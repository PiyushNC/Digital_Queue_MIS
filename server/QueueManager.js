const { Token, Counter, Service } = require('./models');

class QueueManager {
  constructor() {
    this.queues = {};
    this.onUpdate = null;
  }

  async initialize() {
    const services = await Service.findAll();
    services.forEach((service) => {
      this.queues[service.id] = [];
    });

    const waitingTokens = await Token.findAll({
      where: { status: 'WAITING' },
      include: [{ model: Service }],
      order: [['createdAt', 'ASC']],
    });

    waitingTokens.forEach((token) => {
      if (!this.queues[token.serviceId]) {
        this.queues[token.serviceId] = [];
      }
      this.queues[token.serviceId].push(token.id);
    });
  }

  async addToken(tokenId, serviceId) {
    if (!this.queues[serviceId]) {
      this.queues[serviceId] = [];
    }

    // try to find an available counter for this service and assign immediately
    const availableCounter = await Counter.findOne({ where: { serviceId, status: 'AVAILABLE' } });
    if (availableCounter) {
      await this.assignToken(availableCounter.id, tokenId);
    } else {
      this.queues[serviceId].push(tokenId);
    }

    if (this.onUpdate) this.onUpdate();
  }

  async getNextToken(serviceId) {
    if (!this.queues[serviceId] || this.queues[serviceId].length === 0) {
      return null;
    }
    return this.queues[serviceId][0];
  }

  async removeToken(tokenId, serviceId) {
    if (!this.queues[serviceId]) return;
    this.queues[serviceId] = this.queues[serviceId].filter((id) => id !== tokenId);
  }

  async assignToken(counterId, tokenId) {
    const token = await Token.findByPk(tokenId);
    if (!token) return null;

    token.currentCounterId = counterId;
    token.status = 'CALLED';
    await token.save();

    const counter = await Counter.findByPk(counterId);
    if (counter) {
      counter.status = 'BUSY';
      await counter.save();
    }

    await this.removeToken(tokenId, token.serviceId);

    if (this.onUpdate) {
      this.onUpdate();
    }

    return token;
  }

  async completeToken(tokenId) {
    const token = await Token.findByPk(tokenId);
    if (!token) return null;

    const counterId = token.currentCounterId;
    token.status = 'COMPLETED';
    token.currentCounterId = null;
    await token.save();

    const counter = await Counter.findByPk(counterId);
    if (counter) {
      counter.status = 'AVAILABLE';
      await counter.save();

      await this.tryAssignNextToken(counter.serviceId, counterId);
    }

    if (this.onUpdate) {
      this.onUpdate();
    }

    return token;
  }

  async tryAssignNextToken(serviceId, counterId) {
    const nextTokenId = await this.getNextToken(serviceId);
    if (nextTokenId) {
      await this.assignToken(counterId, nextTokenId);
    }
  }

  async getNowServing() {
    // Include tokens that are either CALLED or IN_PROGRESS as "now serving"
    const counters = await Counter.findAll();
    const result = [];

    for (const counter of counters) {
      const token = await Token.findOne({
        where: {
          currentCounterId: counter.id,
          status: ['CALLED', 'IN_PROGRESS'],
        },
        order: [['createdAt', 'ASC']],
      });

      if (token) {
        result.push({
          counterNo: counter.counterNo,
          tokenNo: token.tokenNo,
        });
      }
    }

    return result;
  }

  async getWaitingTokens(limit = 5) {
    const tokens = await Token.findAll({
      where: { status: 'WAITING' },
      order: [['createdAt', 'ASC']],
      limit,
    });

    return tokens.map((t) => ({ tokenNo: t.tokenNo }));
  }

  async getWaitingByService(limitPerService = 5) {
    const services = await Service.findAll();
    const result = [];

    for (const service of services) {
      const queueIds = this.queues[service.id] || [];
      // fetch token details for first N ids
      const tokens = await Token.findAll({
        where: { id: queueIds.slice(0, limitPerService) },
        order: [['createdAt', 'ASC']],
      });

      result.push({
        serviceId: service.id,
        serviceCode: service.code,
        serviceName: service.name,
        waiting: tokens.map((t) => ({ id: t.id, tokenNo: t.tokenNo, createdAt: t.createdAt })),
      });
    }

    return result;
  }
}

module.exports = QueueManager;

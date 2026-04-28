const express = require('express');
const { Token, Service, Counter } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
let queueManager = null;

router.setQueueManager = (qm) => {
  queueManager = qm;
};

router.post('/generate', async (req, res) => {
  try {
    const { serviceId } = req.body;
    const service = await Service.findByPk(serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const count = await Token.count({ where: { serviceId } });
    const tokenNo = `${service.code}-${String(count + 1).padStart(3, '0')}`;

    const token = await Token.create({
      tokenNo,
      serviceId,
      status: 'WAITING',
    });

    if (queueManager) {
      queueManager.addToken(token.id, serviceId);

      const counter = await Counter.findOne({
        where: { serviceId, status: 'AVAILABLE' },
      });

      if (counter) {
        await queueManager.tryAssignNextToken(serviceId, counter.id);
      }
    }

    res.json(token);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:serviceId', async (req, res) => {
  try {
    const tokens = await Token.findAll({
      where: { serviceId: req.params.serviceId },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:serviceId/queue', async (req, res) => {
  try {
    const tokens = await Token.findAll({
      where: { serviceId: req.params.serviceId, status: 'WAITING' },
      order: [['createdAt', 'ASC']],
    });
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/start', authMiddleware, async (req, res) => {
  try {
    const token = await Token.findByPk(req.params.id);
    if (token) {
      token.status = 'IN_PROGRESS';
      await token.save();

      if (queueManager && queueManager.onUpdate) {
        queueManager.onUpdate();
      }
    }
    res.json(token);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/complete', authMiddleware, async (req, res) => {
  try {
    if (queueManager) {
      await queueManager.completeToken(req.params.id);
    }
    const token = await Token.findByPk(req.params.id);
    res.json(token);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

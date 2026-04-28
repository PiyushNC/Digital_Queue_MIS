const WebSocket = require('ws');

class WebSocketManager {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Set();
    this.queueManager = null;

    this.wss.on('connection', (ws) => {
      this.clients.add(ws);

      ws.on('close', () => {
        this.clients.delete(ws);
      });
      // send initial snapshot to newly connected client
      (async () => {
        if (!this.queueManager) return;
        const nowServing = await this.queueManager.getNowServing();
        const waitingByService = await this.queueManager.getWaitingByService(5);
        const data = JSON.stringify({ nowServing, waitingByService });
        if (ws.readyState === WebSocket.OPEN) ws.send(data);
      })();
    });
  }

  setQueueManager(queueManager) {
    this.queueManager = queueManager;
    this.queueManager.onUpdate = () => this.broadcast();
  }

  async broadcast() {
    if (!this.queueManager) return;

    const nowServing = await this.queueManager.getNowServing();
    const waitingByService = await this.queueManager.getWaitingByService(5);

    const data = JSON.stringify({
      nowServing,
      waitingByService,
    });

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}

module.exports = WebSocketManager;

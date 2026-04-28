const express = require('express');
const { Service } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

let queueManager = null;
router.setQueueManager = (qm) => {
  queueManager = qm;
};

router.get('/', async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const service = await Service.create({ name, code, description });

    // create in-memory queue for this service
    if (queueManager) {
      queueManager.queues[service.id] = [];
      if (queueManager.onUpdate) queueManager.onUpdate();
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin-only: delete a service and its in-memory queue
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const id = req.params.id;
    const service = await Service.findByPk(id);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    await service.destroy();

    if (queueManager && queueManager.queues) {
      delete queueManager.queues[id];
      if (queueManager.onUpdate) queueManager.onUpdate();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

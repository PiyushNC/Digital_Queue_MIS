const express = require('express');
const { Service, Counter, Token } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const services = await Service.findAll();
    const counters = await Counter.findAll();
    const totalTokens = await Token.count({
      where: { status: ['COMPLETED', 'IN_PROGRESS', 'CALLED', 'WAITING'] },
    });
    const completedTokens = await Token.count({
      where: { status: 'COMPLETED' },
    });

    res.json({
      services: services.length,
      counters: counters.length,
      totalTokens,
      completedTokens,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin-only: create a new staff member and assign service
router.post('/staff', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { name, email, password, serviceId } = req.body;
    const staff = await require('../models').Staff.create({ name, email, password, serviceId });
    res.json({ staff });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

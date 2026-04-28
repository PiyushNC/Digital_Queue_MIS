const express = require('express');
const { Counter, Service, Staff, Token } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const counters = await Counter.findAll({
      include: [{ model: Service }],
    });
    res.json(counters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { counterNo, serviceId } = req.body;

    if (!counterNo || !serviceId) {
      return res.status(400).json({ error: 'counterNo and serviceId are required' });
    }

    const existingCounter = await Counter.findOne({
      where: { counterNo, serviceId },
    });

    if (existingCounter) {
      return res.status(400).json({ error: 'Counter number already exists for this service' });
    }

    const counter = await Counter.create({
      counterNo,
      serviceId,
      status: 'AVAILABLE',
    });

    res.json(counter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { status, counterNo, serviceId } = req.body;
    const counter = await Counter.findByPk(req.params.id);

    if (!counter) {
      return res.status(404).json({ error: 'Counter not found' });
    }

    if (counterNo !== undefined) {
      const duplicate = await Counter.findOne({
        where: {
          counterNo,
          serviceId: serviceId !== undefined ? serviceId : counter.serviceId,
          id: { [require('sequelize').Op.ne]: counter.id },
        },
      });

      if (duplicate) {
        return res.status(400).json({ error: 'Counter number already exists for this service' });
      }

      counter.counterNo = counterNo;
    }

    if (serviceId !== undefined && serviceId !== '') {
      counter.serviceId = serviceId;
    }

    if (status) {
      counter.status = status;
    }

    await counter.save();

    res.json(counter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const counter = await Counter.findByPk(req.params.id);
    if (!counter) {
      return res.status(404).json({ error: 'Counter not found' });
    }

    await Staff.update({ counterId: null }, { where: { counterId: counter.id } });
    await Token.update({ currentCounterId: null }, { where: { currentCounterId: counter.id } });
    await counter.destroy();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

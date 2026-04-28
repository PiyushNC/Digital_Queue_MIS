const express = require('express');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { Admin, Staff } = require('../models');

const router = express.Router();

router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });

    if (!admin || !await bcryptjs.compare(password, admin.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, role: 'admin' },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '24h' }
    );

    res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/staff/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const staff = await Staff.findOne({ where: { email } });

    if (!staff || !await bcryptjs.compare(password, staff.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: staff.id, role: 'staff' },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      staff: { id: staff.id, name: staff.name, email: staff.email, counterId: staff.counterId },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const { Staff, Counter, Service } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

let queueManager = null;
router.setQueueManager = (qm) => {
  queueManager = qm;
};

router.get('/', authMiddleware, async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.user.id, {
      include: [{ model: Counter }],
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign staff to an available counter for a service
router.post('/assign', authMiddleware, async (req, res) => {
  try {
    const { serviceId } = req.body;
    const staff = await Staff.findByPk(req.user.id);
    if (!staff) return res.status(404).json({ error: 'Staff not found' });

    // find a counter for this service that is not currently assigned to any staff
    const counters = await Counter.findAll({ where: { serviceId } });
    console.log(`[ASSIGN] Staff ${staff.id} requesting service ${serviceId}, found ${counters.length} counters`);

    let assigned = null;
    for (const c of counters) {
      const existing = await Staff.findOne({ where: { counterId: c.id } });
      console.log(`[ASSIGN] Counter ${c.id} existing staff: ${existing ? existing.id : 'none'}`);
      if (!existing) {
        staff.counterId = c.id;
        await staff.save();
        assigned = c;
        console.log(`[ASSIGN] Assigned counter ${c.id} to staff ${staff.id}`);
        break;
      }
    }
    console.log(`[ASSIGN] Final result - assigned: ${assigned ? assigned.id : 'null'}`);

    if (!assigned) return res.status(400).json({ error: 'No available counter for this service' });

    // notify queue manager
    if (queueManager && queueManager.onUpdate) queueManager.onUpdate();

    res.json({ staff, assigned });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

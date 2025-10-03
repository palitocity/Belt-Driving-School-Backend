const express = require('express');
const Accident = require('../models/accident');
const adminOnly = require('../middleware/admin');

const router = express.Router();

// Get all accidents
router.get('/', adminOnly, async (req, res) => {
  try {
    const accidents = await Accident.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(accidents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update accident status (reviewed/resolved)
router.put('/:id/status', adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const accident = await Accident.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ message: "Accident status updated", accident });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

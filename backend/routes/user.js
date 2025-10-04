const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/user');

const router = express.Router();

// Get profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
  // ===================== GET SINGLE PLAN =====================
router.get("/plan/:id", authenticateToken, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving plan" });
  }
});
});

module.exports = router;

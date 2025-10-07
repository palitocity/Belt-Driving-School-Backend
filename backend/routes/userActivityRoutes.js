const express = require('express');
const User = require('../models/user');
const { authenticateToken } = require('../middleware/auth'); // Your JWT middleware
const router = express.Router();
const plan = require('../models/plan');

// ================== GET USER DASHBOARD DATA ==================
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('studentDetails.currentPlan')
      .populate('studentDetails.assignedInstructor', 'fullName email phone')
      .populate('transactions');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      studentDetails: user.studentDetails,
      instructorDetails: user.instructorDetails,
      transactions: user.transactions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== UPDATE PERSONAL INFORMATION ==================
router.put('/update-profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, phone, profileImage } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phone, profileImage },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== UPDATE STUDENT PROGRESS ==================
router.put('/progress', authenticateToken, async (req, res) => {
  try {
    const { progress } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can update progress' });
    }

    user.studentDetails.progress = progress;
    await user.save();

    res.json({ message: 'Progress updated successfully', progress: user.studentDetails.progress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== GET ASSIGNED INSTRUCTOR INFO ==================
router.get('/instructor', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('studentDetails.assignedInstructor', 'fullName email phone instructorDetails');

    if (!user || user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can access instructor info' });
    }
    res.json({
      assignedInstructor: user.studentDetails.assignedInstructor,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== GET USER TRANSACTION HISTORY ==================
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('transactions');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ transactions: user.transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } 
});

// ================== Get user plan ==================
router.get('/plan', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('studentDetails.currentPlan');
    const currentPlan = user.studentDetails.currentPlan;
      if (!currentPlan) return res.status(404).json({ error: 'No active plan found' });
    const { planAmount, planCurrency, durationMonths, planExpiry } = user.studentDetails;
    const userPlan = plan.findById(currentPlan);
  if (!userPlan) return res.status(404).json({ error: 'Plan details not found' });
  const { name, features, description, price, duration } = userPlan;
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ currentPlan: { planAmount, planCurrency, durationMonths, planExpiry }, userPlan: { name, features, description, price, duration } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

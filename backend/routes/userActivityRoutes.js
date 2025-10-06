const express = require('express');
const User = require('../models/user');
const { authenticateToken } = require('../middleware/auth'); // Your JWT middleware
const router = express.Router();

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

module.exports = router;

const express = require('express');
const User = require('../models/user'); // Your model file
const router = express.Router();
const adminOnly = require('../middleware/admin');
// ================== ADD NEW INSTRUCTOR ==================
router.post('/add', adminOnly, async (req, res) => {
  try {
    const { fullName, email, password, phone, specialization, experienceYears } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Full name, email, and password are required" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Instructor with this email already exists" });

    // Create new instructor
    const instructor = new User({
      fullName,
      email,
      password,
      phone,
      role: 'instructor',
      instructorDetails: {
        specialization,
        experienceYears,
        assignedStudents: [],
      },
    });

    await instructor.save();
    res.status(201).json({ message: "Instructor added successfully", instructor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== LIST ALL INSTRUCTORS ==================
router.get('/all', async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor' })
      .select('-password') // hide password
      .populate('instructorDetails.assignedStudents', 'fullName email');

    res.json({ count: instructors.length, instructors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== UPDATE INSTRUCTOR ==================
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const { fullName, email, phone, specialization, experienceYears } = req.body;

    const instructor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'instructor' },
      {
        $set: {
          fullName,
          email,
          phone,
          'instructorDetails.specialization': specialization,
          'instructorDetails.experienceYears': experienceYears,
        },
      },
      { new: true, runValidators: true }
    );

    if (!instructor) return res.status(404).json({ error: "Instructor not found" });
    res.json({ message: "Instructor updated successfully", instructor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== DELETE INSTRUCTOR ==================
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const instructor = await User.findOneAndDelete({ _id: req.params.id, role: 'instructor' });
    if (!instructor) return res.status(404).json({ error: "Instructor not found" });

    res.json({ message: "Instructor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

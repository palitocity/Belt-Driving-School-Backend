const express = require('express');
const User = require('../models/user');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// ================== GET INSTRUCTOR DASHBOARD DATA ==================
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Ensure user is instructor
    const instructor = await User.findById(req.user.id)
      .populate({
        path: 'instructorDetails.assignedStudents',
        select: 'fullName email phone studentDetails.progress studentDetails.courseLevel',
      })
      .select('-password');

    if (!instructor || instructor.role !== 'instructor') {
      return res.status(403).json({ error: 'Access denied. Only instructors can access this route.' });
    }

    const totalStudents = instructor.instructorDetails.assignedStudents.length;

    res.json({
      fullName: instructor.fullName,
      email: instructor.email,
      phone: instructor.phone,
      specialization: instructor.instructorDetails.specialization,
      experienceYears: instructor.instructorDetails.experienceYears,
      totalStudents,
      assignedStudents: instructor.instructorDetails.assignedStudents,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== UPDATE INSTRUCTOR PROFILE ==================
router.put('/update-profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, phone, specialization, experienceYears } = req.body;

    const instructor = await User.findById(req.user.id);
    if (!instructor || instructor.role !== 'instructor') {
      return res.status(403).json({ error: 'Only instructors can update their profile.' });
    }

    instructor.fullName = fullName || instructor.fullName;
    instructor.phone = phone || instructor.phone;
    instructor.instructorDetails.specialization = specialization || instructor.instructorDetails.specialization;
    instructor.instructorDetails.experienceYears = experienceYears || instructor.instructorDetails.experienceYears;

    await instructor.save();
    res.json({ message: 'Instructor profile updated successfully', instructor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== ADD STUDENT TO INSTRUCTOR ==================
router.post('/assign-student', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.body;

    const instructor = await User.findById(req.user.id);
    if (!instructor || instructor.role !== 'instructor') {
      return res.status(403).json({ error: 'Only instructors can assign students.' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Student not found.' });
    }

    // Update references
    if (!instructor.instructorDetails.assignedStudents.includes(studentId)) {
      instructor.instructorDetails.assignedStudents.push(studentId);
      student.studentDetails.assignedInstructor = instructor._id;
      await Promise.all([instructor.save(), student.save()]);
    }

    res.json({ message: 'Student assigned successfully', student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

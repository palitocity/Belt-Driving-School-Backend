const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const router = express.Router();

// Register Admin
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'Admin already exists' });

    user = new User({ name, email, password, role: 'admin' });
    await user.save();

    res.json({ message: 'Admin registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) return res.status(400).json({ error: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

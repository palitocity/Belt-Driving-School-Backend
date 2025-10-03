const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
console.log('JWT_SECRET:', JWT_SECRET);
console.log('JWT_EXPIRES_IN:', JWT_EXPIRES_IN);
console.log('SALT_ROUNDS:', SALT_ROUNDS);



// Register
router.post('/register', async (req, res) => {
  try {
    
    const { fullname, email, password, phone } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ error: 'fullname, email, and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({ fullName: fullname, email: email.toLowerCase(), password: passwordHash, phone });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({ message: 'User registered', user: { id: user._id, fullName: user.fullName, email: user.email , password: user.password }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
 console.log('Comparing passwords:', password, user.password);
    const valid = await bcrypt.compare(password, user.password);
      console.log('Password valid:', valid);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials here' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.json({
      message: 'Authenticated',
      user: { id: user._id, fullName: user.fullName, email: user.email },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = router;

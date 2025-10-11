const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "testeranothertext@gmail.com",
    pass: "rerc rbgr wjrw tpmw",
  },
});
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
console.log('JWT_SECRET:', JWT_SECRET);
console.log('JWT_EXPIRES_IN:', JWT_EXPIRES_IN);
console.log('SALT_ROUNDS:', SALT_ROUNDS);
const Plan = require('../models/plan');
const Team = require('../models/team');

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullname, email, password, phone, role } = req.body;

    if (!fullname || !email || !password || !role) {
      return res.status(400).json({ error: 'fullname, email, password, and role are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'User already exists' });
    const userSalt = await bcrypt.genSalt(SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(password, userSalt);
    console.log('Password hash:', passwordHash, 'using salt:', userSalt, 'for password:', password);
    const emailToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const user = await User.create(
      {
        fullName: fullname,
        email: email.toLowerCase(),
        password: passwordHash,
        role,
        phone,
        emailToken,
        emailTokenExpiry: Date.now() + 10 * 60 * 1000, // 10 minutes
      });
    user.save();
    // Send activation email
    const mailOptions = {
      from: 'testeranothertext@gmail.com',
      to: email,
      subject: "Activate Your Account - Belt Driving School 🚗",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px">
          <h2>Welcome to Belt Driving School!</h2>
          <p>Hi ${fullname},</p>
          <p>Use this code to activate your account:</p>
          <h1 style="color:#2F855A">${emailToken}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>Thank you for joining us!</p>
        </div>
      `,
    };
    try {
    await transporter.verify();
    console.log("✅ Transporter verified");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Message sent:", info.response);
  } catch (err) {
    console.error("❌ SendMail error:", err);
  }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({ message: 'User registered', user: { id: user._id, fullName: user.fullName, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Internal server error: ${err.message}` });
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
    if (!user.isVerified)
      return res.status(401).json({ error: "Please verify your email before logging in.", token });

    console.log('Comparing passwords:', password, user.password);
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    console.log('Hashed password for comparison:', passwordHash);
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    const valid = await bcrypt.compare(password, user.password);

    console.log('Password valid:', valid);
    if (!valid) {
      return res.status(401).json({ error: `Invalid credentials` });
    }

    res.json({
      message: 'Authenticated',
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
  // ===================== GET ALL PLANS =====================

});
router.get("/plans", async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve plans" });
  }
});
router.get("/team/all", async (req, res) => {
  try {
    const team = await Team.find().sort({ createdAt: -1 });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve team" });
  }
});

module.exports = router;

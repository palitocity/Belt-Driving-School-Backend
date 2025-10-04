const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();
const {authenticateToken} = require('../middleware/auth');
const confirmEmail = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

// RESEND EMAIL CONFIRMATION
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ error: "Email already verified" });

    user.emailToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    user.emailTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await user.save();

    // TODO: Send email with confirmation link (including user.emailToken)

    res.json({ message: "Confirmation email resent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
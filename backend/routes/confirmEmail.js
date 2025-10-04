const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {authenticateToken} = require('../middleware/auth');
const router = express.Router();

const confirmEmail = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

// CONFIRM EMAIL
router.post("/confirm-email", authenticateToken, async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ error: "Email already verified" });

    if (
      user.emailToken !== code ||
      user.emailTokenExpiry < Date.now()
    ) {
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.emailToken = undefined;
    user.emailTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Email successfully verified! You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
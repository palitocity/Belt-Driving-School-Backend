const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');

const router = express.Router();

// Generate reset token
function generateResetToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

// ================== FORGOT PASSWORD ==================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, role } = req.body; // role = 'user' | 'admin'
    if (!email || !role) return res.status(400).json({ error: "Email and role are required" });

    const Model = role === 'admin' ? Admin : User;
    const account = await Model.findOne({ email });
    if (!account) return res.status(404).json({ error: "Account not found" });

    // Generate reset token
    const resetToken = generateResetToken(account._id, role);
    account.resetPasswordToken = resetToken;
    account.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await account.save();

    // Here you'd send email with link (frontend route)
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}&role=${role}`;
    res.json({ message: "Password reset link generated", resetUrl });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== RESET PASSWORD ==================
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword, role } = req.body;
    if (!token || !newPassword || !role) return res.status(400).json({ error: "Token, password, and role required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const Model = role === 'admin' ? Admin : User;

    const account = await Model.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!account) return res.status(400).json({ error: "Invalid or expired token" });

    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS) || 10);
    account.password = await bcrypt.hash(newPassword, salt);
    account.resetPasswordToken = undefined;
    account.resetPasswordExpires = undefined;
    await account.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

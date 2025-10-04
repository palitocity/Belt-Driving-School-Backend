const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();

/**
 * Generate a short-lived JWT reset token (15 minutes)
 * @param {string} id - The user's ID
 * @param {string} role - Either 'user' or 'admin'
 * @returns {string} JWT token
 */
function generateResetToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

/**
 * ======================================================
 *              🔹 FORGOT PASSWORD
 * ======================================================
 * POST /api/auth/forgot-password
 * Generates a password reset link for a user or admin
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role)
      return res.status(400).json({ error: 'Email and role are required' });

    const Model = role === 'admin' ? Admin : User;
    const account = await Model.findOne({ email });

    if (!account)
      return res.status(404).json({ error: 'Account not found' });

    // Generate reset token
    const resetToken = generateResetToken(account._id, role);
    account.resetPasswordToken = resetToken;
    account.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await account.save();

    // Send reset link (replace with actual frontend link)
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}&role=${role}`;
    res.json({
      message: 'Password reset link generated successfully.',
      resetUrl,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * ======================================================
 *              🔹 RESET PASSWORD
 * ======================================================
 * POST /api/auth/reset-password
 * Verifies reset token and updates password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword, role } = req.body;
    if (!token || !newPassword || !role)
      return res.status(400).json({
        error: 'Token, new password, and role are required',
      });

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const Model = role === 'admin' ? Admin : User;

    // Find user with valid token
    const account = await Model.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!account)
      return res.status(400).json({ error: 'Invalid or expired token' });

    // Hash new password
    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS) || 10);
    account.password = await bcrypt.hash(newPassword, salt);

    // Clear reset fields
    account.resetPasswordToken = undefined;
    account.resetPasswordExpires = undefined;

    await account.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

const express = require('express');
const User = require('../models/user');
const Order = require('../models/Order');
const HireDriver = require('../models/HireDriver'); // new schema for hiring requests
const adminOnly = require('../middleware/admin');

const router = express.Router();

// Get all users
router.get('/users', adminOnly, async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password');
  res.json(users);
});

// Get all transactions
router.get('/transactions', adminOnly, async (req, res) => {
  const transactions = await Order.find().populate('userId', 'name email');
  res.json(transactions);
});

// Get all hire driver requests
router.get('/hire-requests', adminOnly, async (req, res) => {
  const requests = await HireDriver.find().populate('userId', 'name email');
  res.json(requests);
});

// Admin stats
router.get('/stats', adminOnly, async (req, res) => {
  const totalUsers = await User.countDocuments({ role: 'user' });
  const totalAdmins = await User.countDocuments({ role: 'admin' });
  const totalOrders = await Order.countDocuments();
  const paidOrders = await Order.countDocuments({ status: 'paid' });

  res.json({ totalUsers, totalAdmins, totalOrders, paidOrders });
});

module.exports = router;

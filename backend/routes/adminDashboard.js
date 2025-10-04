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
// Get all students
router.get('/students', adminOnly, async (req, res) => {
  const users = await User.find({ role: 'student' }).select('-password');
  res.json(users);
});
// Get all instructors
router.get('/instructors', adminOnly, async (req, res) => {
  const users = await User.find({ role: 'instructor' }).select('-password');
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
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalInstructors = await User.countDocuments({ role: 'instructor' });
  const totalOrders = await Order.countDocuments();
  const paidOrders = await Order.countDocuments({ status: 'paid' });

  res.json({ totalUsers, totalAdmins, totalStudents, totalInstructors, totalOrders, paidOrders });
});
router.post("/add", adminOnly, async (req, res) => {
  try {
    const { name, price, duration, description, features, highlight } = req.body;

    if (!name || !price || !duration || !description || !features) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newPlan = new Plan({
      name,
      price,
      duration,
      description,
      features,
      highlight,
      createdBy: req.adminId
    });

    await newPlan.save();
    res.status(201).json({ message: "Plan created successfully", plan: newPlan });
  } catch (err) {
    console.error("Error creating plan:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===================== GET ALL PLANS =====================
router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve plans" });
  }
});

// ===================== GET SINGLE PLAN =====================
router.get("/:id", async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving plan" });
  }
});
module.exports = router;

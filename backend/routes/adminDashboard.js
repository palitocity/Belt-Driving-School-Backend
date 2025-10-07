const express = require('express');
const User = require('../models/user');
const Order = require('../models/Order');
const HireDriver = require('../models/HireDriver'); // new schema for hiring requests
const adminOnly = require('../middleware/admin');
const Plan = require('../models/plan');
const Team = require('../models/team');
const { route } = require('./auth');
const { imageURLToPath } = require('url');
const fs = require('fs');
const path = require('path');



const router = express.Router();
router.use(express.json({ limit: "10mb" }));
const uploadsDir = path.join(__dirname, 'teams');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
// Upload route
router.post("/teams/upload", adminOnly, (req, res) => {
   try {
      const { image } = req.body; // expecting { "image": "data:..." }

    if (!image) {
      return res.status(400).json({ message: "No image provided" });
    }

    // Extract image type (e.g., image/png or application/pdf)
    const match = image.match(/^data:(.+);base64,(.*)$/);
    if (!match) {
      return res.status(400).json({ message: "Invalid Base64 format" });
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Determine image extension
    const extension = mimeType.split("/")[1];
    const imageName = `${Date.now()}.${extension}`;
    const imagePath = path.join(uploadsDir, imageName);

    // Save the image
    fs.writeFileSync(imagePath, buffer);

    // Return public image path
    const publicPath = `/uploads/${imageName}`;
    const fullUrl = `http://localhost:5000${publicPath}`;

    return res.json({
      message: "image uploaded successfully",
      imageName,
      path: publicPath,
      url: fullUrl,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error saving image" });
  }
});

// Serve the teams folder publicly
router.use("/teams/uploads", express.static(path.join(__dirname, "teams")));
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
    res.status(500).json({ error: `Error creating plan: ${err.message}` });
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

router.put("/update/:id", adminOnly, async (req, res) => {
  try {
    const planId = req.params.id;
    const { name, price, duration, description, features, highlight } = req.body;

    const updatedPlan = await Plan.findByIdAndUpdate(planId, { name, price, duration, description, features, highlight }, { new: true });
    if (!updatedPlan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    res.json({ message: "Plan updated successfully", plan: updatedPlan });
  } catch (err) {
    console.error("Error updating plan:", err);
    res.status(500).json({ error: `Error updating plan: ${err.message}` });
  }
});

router.delete("/delete/:id", adminOnly, async (req, res) => {
  try {
    const planId = req.params.id;
    const deletedPlan = await Plan.findByIdAndDelete(planId);
    if (!deletedPlan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    res.json({ message: "Plan deleted successfully" });
  } catch (err) {
    console.error("Error deleting plan:", err);
    res.status(500).json({ error: `Error deleting plan: ${err.message}` });
  }
});

// ===================== GET ALL Team =====================

router.post("/team/add", adminOnly, async (req, res) => {
  try {

    const name = req.body.name || "Unnamed"; // Default name if not provided
    const role = req.body.role || "No Role"; // Default role if not provided
    const image = req.body.image || "/images/default.jpg";  // Default image path if not provided
    const bio = req.body.bio || "No bio available."; // Default bio if not provided

    if (!name || !role || !image || !bio) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newTeam = new Team({
      name,
      role,
      image,
      bio,
      createdBy: req.adminId
    });

    await newTeam.save();
    res.status(201).json({ message: "Team created successfully", Team: newTeam });
  } catch (err) {
    console.error("Error creating Team:", err);
    res.status(500).json({ error: `Error creating Team: ${err.message}` });
  }
});

router.delete("/team/delete/:id", adminOnly, async (req, res) => {
  try {
    const teamId = req.params.id;
    const deletedTeam = await Team.findByIdAndDelete(teamId);
    if (!deletedTeam) {
      return res.status(404).json({ error: "Team not found" });
    }
    res.json({ message: "Team deleted successfully" });
  } catch (err) {
    console.error("Error deleting Team:", err);
    res.status(500).json({ error: `Error deleting Team: ${err.message}` });
  }
});
router.put("/team/update/:id", adminOnly, async (req, res) => {
  try {
    const teamId = req.params.id;
    const { name, role, image, bio } = req.body;

    const updatedTeam = await Team.findByIdAndUpdate(teamId, { name, role, image, bio }, { new: true });
    if (!updatedTeam) {
      return res.status(201).json({ error: "Team not found" });
    }
    res.json({ message: "Team updated successfully", Team: updatedTeam });
  } catch (err) {
    console.error("Error updating Team:", err);
    res.status(500).json({ error: `Error updating Team: ${err.message}` });
  }
});

module.exports = router;

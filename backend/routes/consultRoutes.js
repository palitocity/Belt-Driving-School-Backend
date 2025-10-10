const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const Consult = require("../models/Consult");
const adminOnly = require('../middleware/admin');

// Limit consult submissions: 3 per 10 minutes per IP
const consultLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: {
    success: false,
    message: "Too many consultation requests from this IP. Please try again later.",
  },
});

// ===========================
// 📩 POST: Create a consultation request
// ===========================
router.post("/", consultLimiter, async (req, res) => {
  try {
    const { fullName, email, phone, date, notes } = req.body;

    // Validation
    if (!fullName || !email || !phone || !date) {
      return res
        .status(400)
        .json({ message: "fullName, email, phone, and date are required" });
    }

    // Optional: check if same email has already submitted recently (extra protection)
    const recentConsult = await Consult.findOne({
      email,
      createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) }, // last 10 mins
    });
    if (recentConsult) {
      return res
        .status(429)
        .json({ message: "You have already submitted recently. Please wait 10 minutes." });
    }

    // Create new consult
    const newConsult = new Consult({ fullName, email, phone, date, notes });
    await newConsult.save();

    res
      .status(201)
      .json({ success: true, message: "Consultation request submitted", data: newConsult });
  } catch (error) {
    console.error("Error submitting consult:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===========================
// 📋 GET: Retrieve all consultation requests
// ===========================
router.get("/", adminOnly, async (req, res) => {
  try {
    const consults = await Consult.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: consults.length, data: consults });
  } catch (error) {
    console.error("Error fetching consults:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
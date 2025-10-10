const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const contact = require("../models/contactus");
const adminOnly = require('../middleware/admin');


// Limit contact submissions: 5 per 10 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: "Too many contact requests from this IP, please try again later.",
}); 
// ===========================
// 📩 POST: Create a contact request
// ===========================
router.post("/", contactLimiter, async (req, res) => {
  try {
    const { fullName, email, message } = req.body;
    
    const newContact = new contact({ fullName, email, message });
    await newContact.save();

    res.status(201).json({ message: "Contact request submitted successfully." });
  } catch (error) {
    console.error("Error creating contact request:", error);
    res.status(500).json({ message: `Error creating contact request: ${error.message}` });
  }
});

// ===========================
// 📋 GET: Retrieve all contact requests
// ===========================          
router.get("/", adminOnly, async (req, res) => {
  try {
    const contacts = await contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error retrieving contact requests:", error);
    res.status(500).json({ message: `Error retrieving contact requests: ${error.message}` });
  }
});

module.exports = router;
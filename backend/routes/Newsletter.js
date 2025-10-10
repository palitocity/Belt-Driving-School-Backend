const express = require("express");
const router = express.Router();
const Newsletter = require("../models/Newletter");
const adminOnly = require('../middleware/admin');   

// Subscribe to newsletter  
router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    } 
    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ email }); 
    if (existingSubscription) {
      return res.status(400).json({ message: "Email is already subscribed. Thank you for your interest!" });
    }
    // Create a new subscription
    const newSubscription = new Newsletter({ email });
    await newSubscription.save();

    return res.status(201).json({ message: "Successfully subscribed to the newsletter" });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});  

router.get("/", adminOnly, async (req, res) => {
  try {
    const subscriptions = await Newsletter.find().sort({ createdAt: -1 });
    return res.status(200).json(subscriptions);
  } catch (error) {
    console.error("Error fetching newsletter subscriptions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}); 

module.exports = router;

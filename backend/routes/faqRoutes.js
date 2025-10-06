const express = require("express");
const router = express.Router();
const { addFAQ, getFAQs } = require("../controllers/faqController");
const adminOnly = require('../middleware/admin');

// Public - Get all FAQs
router.get("/", getFAQs);

// Admin - Add a new FAQ
router.post("/add", adminOnly, addFAQ);

module.exports = router;

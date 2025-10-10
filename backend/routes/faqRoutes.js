const express = require("express");
const router = express.Router();
const { addFAQ, getFAQs, deleteFAQ, updateFAQ } = require("../controllers/faqController");
const adminOnly = require('../middleware/admin');

// Public - Get all FAQs
router.get("/", getFAQs);

// Admin - Add a new FAQ
router.post("/add", adminOnly, addFAQ);

router.put("/update/:id", adminOnly, updateFAQ);

router.delete("/delete/:id", adminOnly, deleteFAQ);

module.exports = router;

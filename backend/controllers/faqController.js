const FAQ = require("../models/faqModel");

// Add a new FAQ (admin)
exports.addFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: "Question and answer are required" });
    }

    const newFAQ = await FAQ.create({ question, answer });
    res.status(201).json({ message: "FAQ added successfully", data: newFAQ });
  } catch (error) {
    console.error("Add FAQ Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all FAQs (public)
exports.getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    res.status(200).json({ count: faqs.length, data: faqs });
  } catch (error) {
    console.error("Get FAQs Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteFAQ = async (req, res) => {
  try {
    const faqId = req.params.id;
    const deletedFAQ = await FAQ.findByIdAndDelete(faqId);
    if (!deletedFAQ) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.status(200).json({ message: "FAQ deleted successfully", data: deletedFAQ });
  } catch (error) {
    console.error("Delete FAQ Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateFAQ = async (req, res) => {
  try {
    const faqId = req.params.id;
    const { question, answer } = req.body; // Destructure question and answer from req.body

    if (!question || !answer) {
      return res.status(400).json({ message: "Question and answer are required" });
    }
    const updatedFAQ = await FAQ.findByIdAndUpdate(
      faqId,
      { question, answer }, // Use the destructured values here
      { new: true }
    );

    if (!updatedFAQ) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.status(200).json({ message: "FAQ updated successfully", data: updatedFAQ });
  } catch (error) {
    console.error("Update FAQ Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

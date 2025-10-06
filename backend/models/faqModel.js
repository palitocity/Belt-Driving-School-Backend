const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "FAQ question is required"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "FAQ answer is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FAQ", faqSchema);

const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    features: {
      type: [String],
      required: true
    },
    highlight: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);

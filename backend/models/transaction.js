const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  planName: String,
  amount: Number,
  status: { type: String, default: "pending" },
  reference: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);

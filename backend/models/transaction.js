const mongoose = require("mongoose");
const Order = require("./Order");
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  OrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
 firstName: String,
  lastName: String,
  email: String,
  phone: String,
  planName: String,
  amount: Number,
  description: String,
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  reference: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);

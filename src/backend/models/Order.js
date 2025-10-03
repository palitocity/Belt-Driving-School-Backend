const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  planName: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: "NGN" },
  extras: { type: String },
  status: { type: String, default: "pending" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);

const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  planName: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: "NGN" },
  extras: { type: String },
  status: { type: String, default: "pending" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);

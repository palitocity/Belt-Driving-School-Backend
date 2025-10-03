const mongoose = require('mongoose');

const hireDriverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverType: { type: String, enum: ['private', 'corporate'], required: true },
  duration: { type: String, required: true }, // e.g. '3 months'
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('HireDriver', hireDriverSchema);

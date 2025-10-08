const mongoose = require('mongoose');

const hireDriverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  contractType: { type: String, enum: ["Temporary", "Permanent"], required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  note: { type: String },
  driverType: { type: String, enum: ['private', 'corporate'], required: true },
  duration: { type: String, required: true }, 
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('HireDriver', hireDriverSchema);

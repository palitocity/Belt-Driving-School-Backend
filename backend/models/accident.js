const mongoose = require('mongoose');

const accidentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['reported', 'reviewed', 'resolved'], default: 'reported' },
  evidenceImage: { type: String }, // optional: store image URL/path if uploaded
}, { timestamps: true });

module.exports = mongoose.model('Accident', accidentSchema);

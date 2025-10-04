//    name: "Mrs. Sarah Oladipo",
//     role: "Student Coordinator",
//     image: "/images/team2.jpg",
//     bio: "Dedicated to ensuring every student has a smooth and rewarding learning experience.",
const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: Number, required: true },
  image: { type: String },
  bio: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', TeamSchema);

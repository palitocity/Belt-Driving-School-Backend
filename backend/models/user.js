const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { text } = require('express');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, capitalize: true, minlength: 3, maxlength: 255 },
  email: { type: String, unique: true, required: true, lowercase: true, minlength: 3, maxlength: 255 },
  password: { type: String, required: true, minlength: 6, maxlength: 255 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
 resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// Hash password before saving
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   console.log('Hashing password for user:', this.email, 'Password before hash:', this.password);
//   this.password = await bcrypt.hash(this.password, 10);
//   console.log('Password after hash:', this.password);
//   next();
// }
// );

module.exports = mongoose.model('User', userSchema);

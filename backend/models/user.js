const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { text } = require('express');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, capitalize: true, minlength: 3, maxlength: 255 },
  email: { type: String, unique: true, required: true, lowercase: true, minlength: 3, maxlength: 255 },
  password: { type: String, required: true, minlength: 6, maxlength: 255 },
  role: { type: String, enum: ['user', 'admin', 'student', 'instructor'], default: 'student' },
  isVerified: { type: Boolean, default: false },
  address: { type: String, maxlength: 500 },
  emailToken: String,
  emailTokenExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  phone: { type: String, maxlength: 20 },
  studentDetails: {
    enrollmentDate: { type: Date, default: Date.now },
    courseLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
    currentPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }, // Reference to Plan model
    assignedInstructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to Instructor
    progress: { type: Number, default: 0 }, // Percent completed
  },
  instructorDetails: {
    specialization: { type: String },
    experienceYears: { type: Number },
    licenseNumber: { type: String },
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }
  ],
  profileImage: { type: String }
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

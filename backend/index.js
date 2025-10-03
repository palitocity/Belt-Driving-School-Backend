const dotenv = require('dotenv').config();


const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const planRoutes = require('./routes/plan');
const app = express();
const PORT = process.env.PORT || 4000;
const adminAuthRoutes = require('./routes/adminAuth');
const adminDashboardRoutes = require('./routes/adminDashboard');

const accidentRoutes = require('./routes/accident');
const adminAccidentRoutes = require('./routes/adminAccidents');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
// Middleware
app.use(cors());
app.use(express.json());
// Security headers
app.use(helmet());

// CORS
app.use(cors({ origin: "*" }));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/plan', planRoutes);

// Rate limit for sensitive routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
});

// app.use("/api/auth", limiter);
// // // Catch-all for unknown routes
// app.use((req, res, next) => {
//   res.status(404).json({ error: "Route not found" });
// });

// Central error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ error: "Something went wrong on the server" });
});




app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/accidents', accidentRoutes);          // User accident reporting
app.use('/api/admin/accidents', adminAccidentRoutes); // Admin accident dashboard



app.get('/', (req, res) => res.json({ ok: true, message: 'Belt Driving Backend with MongoDB is running' }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error(err));

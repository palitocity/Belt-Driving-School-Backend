const dotenv = require('dotenv').config();


const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');


const authRoutes = require('./backend/routes/auth');
const userRoutes = require('./backend/routes/user');
const planRoutes = require('./backend/routes/plan');
const app = express();
const PORT = process.env.PORT || 4000;
const adminAuthRoutes = require('./backend/routes/adminAuth');
const adminDashboardRoutes = require('./backend/routes/adminDashboard');
const userTransactionRoutes = require('./backend/routes/userTransaction');
const forgotPasswordRoutes = require('./backend/routes/forgotPassword');
const accidentRoutes = require('./backend/routes/accident');
const adminAccidentRoutes = require('./backend/routes/adminAccidents');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
// Middleware
// app.use(cors());
app.use(cors({ origin: "*" }));
app.use(express.json());
// Security headers
app.use(helmet());

// CORS

// Routes



// other routes 

app.use('/api/plan', planRoutes);

//user routes 
app.use('/api/user', userRoutes);
app.use('/api/user/accidents', accidentRoutes);    // User accident reporting
app.use('/api/user/transactions', userTransactionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/forgot-password', forgotPasswordRoutes);

// admin routes
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/forgot-password', forgotPasswordRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/accidents', adminAccidentRoutes); // Admin accident dashboard



// Rate limit for sensitive routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
});

app.use("/api/auth", limiter);
// // Catch-all for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ error: "Something went wrong on the server" });
});



app.get('/', (req, res) => res.json({ ok: true, message: 'Belt Driving Backend with MongoDB is running' }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error(err));

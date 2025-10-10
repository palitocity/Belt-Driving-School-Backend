
// ======================
//  Belt Driving School Backend
// ======================
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const app = express();
const PORT = process.env.PORT || 4000;

// ======================
// Import Routes
// ======================
const authRoutes = require("./backend/routes/auth");
const confirmEmailRoutes = require("./backend/routes/confirmEmail");
const forgotPasswordRoutes = require("./backend/routes/forgetPassword");
const userRoutes = require("./backend/routes/user");
const planRoutes = require("./backend/routes/plan");
const accidentRoutes = require("./backend/routes/accident");
const userTransactionRoutes = require("./backend/routes/userTransaction");
const contactUsRoutes = require("./backend/routes/contactUs");
const consultationRoutes = require("./backend/routes/consultRoutes");  
const NewsletterRoutes = require("./backend/routes/Newsletter");

const adminAuthRoutes = require("./backend/routes/adminAuth");
const adminDashboardRoutes = require("./backend/routes/adminDashboard");
const adminAccidentRoutes = require("./backend/routes/adminAccidents");
const resendEmailConfirmationRoutes = require("./backend/routes/resendEmailConfirmation");
const faqRoutes = require('./backend/routes/faqRoutes');
const instructorRoutes = require('./backend/routes/instructorRoutes');
const userActivityRoutes = require('./backend/routes/userActivityRoutes');
const instructorDashboardRoutes = require('./backend/routes/instructorDashboard');
const  orderRoutes = require('./backend/routes/orderRoute');

// ======================
//  Middleware Setup
// ======================
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(helmet());

// Rate Limiter for Authentication and Password Routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/auth", limiter);
app.use("/api/forgot-password", limiter);

// ======================
//  Routes Registration
// ======================

//consult route 
app.use("/api/consult", consultationRoutes);

// contact us route
app.use("/api/contact-us", contactUsRoutes);

// newsletter route
app.use("/api/newsletter", NewsletterRoutes);

// Public Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth/confirm-email", confirmEmailRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/forgot-password", forgotPasswordRoutes);
app.use("/api/auth/resend-confirmation", resendEmailConfirmationRoutes);
app.use('/api/faqs', faqRoutes);

// add instructor routes
app.use('/api/instructors', instructorRoutes);

// Instructor Routes
app.use('/api/instructor/dashboard', instructorDashboardRoutes);

//student activity routes
app.use('/api/user/activity', userActivityRoutes);

//order routes
app.use("/api/orders", orderRoutes);

// User Routes
app.use("/api/user", userRoutes);
app.use("/api/user/accidents", accidentRoutes);
app.use("/api/user/transactions", userTransactionRoutes);

// Admin Routes
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/dashboard/plans", adminDashboardRoutes);
app.use("/api/admin/accidents", adminAccidentRoutes);
 // Optional: you may separate admin user management later

// ======================
//  Health Check Endpoint
// ======================
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Belt Driving School Backend with MongoDB is running smoothly",
    environment: process.env.NODE_ENV || "development",
  });
});

// ======================
//  Catch-All Route
// ======================
// app.use((req, res, next) => {
//   res.status(404).json({ error: "Route not found" });
// });

// ======================
//  Central Error Handler
// ======================
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ error: "Something went wrong on the server" });
});

// ======================
//  Database Connection
// ======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
    app.listen(PORT, () =>
      console.log(` Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB Connection Error:", err.message));

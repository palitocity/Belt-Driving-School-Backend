const express = require('express');
const jwt = require('jsonwebtoken');
const Accident = require('../models/accident');
const User = require('../models/user');

const router = express.Router();

// Middleware to verify user token
function userAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
}

// Report Accident
router.post('/report', userAuth, async (req, res) => {
  try {
    const { location, description, evidenceImage } = req.body;

    const accident = new Accident({
      userId: req.user.id,
      location,
      description,
      evidenceImage
    });

    await accident.save();
    res.json({ message: "Accident reported successfully", accident });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Transaction = require('../models/transaction');

const router = express.Router();

// Get user transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new transaction
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, planName, amount, description } = req.body;

    const transaction = new Transaction({
      userId: req.user.id,
      firstName,
      lastName,
      email,
      phone,
      planName,
      amount,
      description
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

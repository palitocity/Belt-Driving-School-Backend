const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Order = require('../models/Order');

const router = express.Router();

// Process plan
router.post('/process', authenticateToken, async (req, res) => {
  try {
    const { planName, price, currency, extras } = req.body;
    if (!planName || !price) return res.status(400).json({ error: 'planName and price are required' });

    const order = await Order.create({
      planName,
      price: parseFloat(price),
      currency: currency || 'NGN',
      extras,
      userId: req.user.id
    });

    const payment = {
      paymentId: `pay_${order._id}`,
      amount: order.price,
      currency: order.currency,
      paymentUrl: `https://example.com/pay/${order._id}`,
      order
    };

    res.status(201).json({ message: 'Order created. Proceed to payment.', payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

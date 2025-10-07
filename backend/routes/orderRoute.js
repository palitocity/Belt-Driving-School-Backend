const express = require("express");
const Order = require("../models/Order");
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
const User = require("../models/user");

/**
 * @route POST /api/orders
 * @desc Create new order
 */
router.post("/:id", authenticateToken, async (req, res) => {

  try {
    const planId = req.params.id;
    if (!planId) {
      return res.status(400).json({ message: "Plan ID is required" });
    }
    const { planName, price, currency, userId, fullName, email, phone, address } = req.body;

    if (!planName || !price || !userId || !fullName || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newOrder = new Order({
      planName,
      price,
      currency,
      userId,
      planId,
      fullName,
      email,
      phone,
      address,
    });

    await newOrder.save();
    const updateUserCurrentPlan = await User.findByIdAndUpdate(
  userId,
  { 'studentDetails.currentPlan': planId, 'studentDetails.planAmount': price, 'studentDetails.planCurrency': currency },
  { new: true }
);

    if (!updateUserCurrentPlan) {
      return res.status(404).json({ message: "User not found to update current plan" });
    }

    res.status(201).json({ success: true, data: `${newOrder} ${updateUserCurrentPlan}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error while creating order: ${error.message}` });
  }
});

/**
 * @route GET /api/orders
 * @desc Get all orders or by userId
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error while fetching orders" });
  }
});

/**
 * @route PUT /api/orders/:id
 * @desc Update order (e.g., status or details)
 */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const order = await Order.findByIdAndUpdate(id, updates, { new: true });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error while updating order" });
  }
});

module.exports = router;

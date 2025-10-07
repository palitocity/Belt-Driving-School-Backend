const express = require("express");
const Order = require("../models/Order");
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

/**
 * @route POST /api/orders
 * @desc Create new order
 */// ✅ Create new order and update user's current plan
router.post("/:id", authenticateToken, async (req, res) => {
  try {
    const planId = req.params.id;
    const { planName, price, currency, userId, fullName, email, phone, address } = req.body;

    if (!planId) {
      return res.status(400).json({ message: "Plan ID is required" });
    }

    if (!planName || !price || !userId || !fullName || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Create the order
    const newOrder = new Order({
      planName,
      price,
      currency: currency || "NGN",
      userId,
      planId,
      fullName,
      email,
      phone,
      address,
    });

    await newOrder.save();

    // ✅ Update user's current plan
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { currentPlan: newOrder._id }, // You can also store planId here if preferred
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found while updating current plan" });
    }

    // ✅ Return success response
    res.status(201).json({
      success: true,
      message: "Order created successfully and current plan updated",
      order: newOrder,
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        currentPlan: updatedUser.currentPlan,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      message: `Server Error while creating order: ${error.message}`,
    });
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

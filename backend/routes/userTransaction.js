const express  = require("express");
const axios  = require("axios");
const  dotenv =require("dotenv");
const Transaction =require("../models/transaction"); 

dotenv.config();

const router = express.Router();

/**
 * @route POST /api/transactions
 * @desc Initialize transaction and Paystack payment
 */
router.post("/", async (req, res) => {
  try {
    const { userId, orderId, firstName, lastName, email, phone, planName, amount, description } = req.body;

    // Generate unique reference for Paystack
    const reference = `BDS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create transaction in DB
    const newTransaction = await Transaction.create({
      userId,
      orderId,
      firstName,
      lastName,
      email,
      phone,
      planName,
      amount,
      description,
      reference,
    });

    // Initialize Paystack payment
    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Paystack expects amount in kobo
        reference,
        callback_url: `${process.env.FRONTEND_URL}/payment/verify/${reference}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(201).json({
      success: true,
      message: "Transaction initialized",
      data: {
        transaction: newTransaction,
        authorization_url: paystackResponse.data.data.authorization_url,
      },
    });
  } catch (error) {
    console.error("Error initializing transaction:", error.message);
    res.status(500).json({ success: false, message: "Payment initialization failed" });
  }
});

/**
 * @route PUT /api/transactions/:reference/verify
 * @desc Verify Paystack transaction
 */
router.put("/:reference/verify", async (req, res) => {
  const { reference } = req.params;

  try {
    // Verify transaction on Paystack
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const { status, data } = response.data;

    if (!status) {
      return res.status(400).json({ success: false, message: "Verification failed" });
    }

    const newStatus = data.status === "success" ? "completed" : "failed";

    // Update transaction status in DB
    const transaction = await Transaction.findOneAndUpdate(
      { reference },
      { status: newStatus },
      { new: true }
    );

    res.json({
      success: true,
      message: "Transaction verified",
      data: transaction,
    });
  } catch (error) {
    console.error("Verification error:", error.message);
    res.status(500).json({ success: false, message: "Error verifying transaction" });
  }
});

/**
 * @route GET /api/transactions
 * @desc Get all transactions or user-specific
 */
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};

    const transactions = await Transaction.find(filter)
      .populate("userId", "fullName email")
      .populate("orderId", "planName price status")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error("Fetch transactions error:", error.message);
    res.status(500).json({ success: false, message: "Error fetching transactions" });
  }
});

module.exports = router;

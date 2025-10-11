const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const express = require("express");
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail", // using Gmail service auto-sets host and port
    auth: {
        user: process.env.EMAIL_USER || 'palitocity',
        pass: process.env.EMAIL_PASS || 'rerc rbgr wjrw tpmw',
    },
});

// Optional: verify transporter connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Mail transporter error:", error.message);
    } else {
        console.log("✅ Mail transporter is ready to send messages");
    }
});

module.exports = transporter;

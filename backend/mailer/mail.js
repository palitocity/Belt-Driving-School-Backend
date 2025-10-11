const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const express = require("express");
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "smtp.gmail.com", // using Gmail service auto-sets host and port
    port:465,
    secure: true,
    auth: {
        user: 'testeranothertext@gmail.com',
        pass:  'rerc rbgr wjrw tpmw',
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

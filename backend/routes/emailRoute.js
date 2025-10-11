const  express = require("express");
const  transporter = require("../mailer/mail");
const router = express.Router();

// POST /api/send-mail
router.post("/send-mail", async (req, res) => {
  try {
    const { fullName, email, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const mailOptions = {
      from: `"Belt Driving School" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // receive messages in your Gmail inbox
      subject: `New Message from ${fullName}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px">
          <h2>New Contact Message</h2>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
      `,
    };

    let sentMail = await transporter.sendMail(mailOptions);
    if (!sentMail) {
        res.status(404).json({message: `Failed ${sentMail}`})
    }

    res.status(200).json({ success: "Email sent successfully!" });
  } catch (error) {
    console.error("❌ SendMail error:", error.message);
    res.status(500).json({ error: "Failed to send email", details: error.message });
  }
});

module.exports = router;

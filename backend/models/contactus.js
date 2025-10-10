const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 100,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        message: {
            type: String,
            maxlength: 2000,
            trim: true,
        },
        unread: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ContactUs", contactSchema);

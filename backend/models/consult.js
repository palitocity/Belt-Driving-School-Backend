const mongoose = require("mongoose");

const consultSchema = new mongoose.Schema(
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
        phone: {
            type: String,
            required: true,
            maxlength: 20,
        },
        date: {
            type: Date,
            required: true,
        },
        notes: {
            type: String,
            maxlength: 2000,
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Consult", consultSchema);

require("dotenv").config();

// Check if .env variables are loading
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded ✓" : "Missing ✗");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

/* Email Transporter */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Test Gmail connection on server startup
transporter.verify((error, success) => {
    if (error) {
        console.log("❌ Gmail Error:", error.message);
    } else {
        console.log("✅ Gmail Connected Successfully");
    }
});

/* MongoDB Connection */
console.log("Connecting to MongoDB...");

mongoose.connect(process.env.MONGO_URI, {
    family: 4
})
.then(() => {

    console.log("✅ MongoDB Connected Successfully");

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });

})
.catch((err) => {
    console.log("❌ MongoDB Error:", err);
});

/* Booking Schema */
const BookingSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    mobile: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    requirement: {
        type: String,
        required: true
    },

    message: {
        type: String
    }

});

const Booking = mongoose.model("Booking", BookingSchema);

/* Home Route */
app.get("/", (req, res) => {
    res.send("Super Sun Solar Backend Running");
});

/* Save Appointment */
app.post("/book-appointment", async (req, res) => {

    try {

        const { name, mobile, address, requirement, message } = req.body;

        console.log("📩 Booking received:", req.body);

        // Save to MongoDB
        const booking = new Booking({
            name,
            mobile,
            address,
            requirement,
            message
        });

        await booking.save();
        console.log("💾 Booking saved to database");

        // Send Email Notification
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: "pawar.dnyanu11@gmail.com",
            subject: "🔔 New Appointment Booking",

            text: `
New Appointment Booked

Name: ${name}
Mobile: ${mobile}
Address: ${address}
Requirement: ${requirement}
Message: ${message}
            `,
        });

        console.log("📧 Email sent successfully");

        res.json({
            success: true,
            message: "Booking saved and email sent successfully"
        });

    } catch (error) {

        console.log("❌ ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Error saving booking or sending email"
        });

    }

});

/* View Appointments */
app.get("/appointments", async (req, res) => {

    try {

        const data = await Booking.find();

        res.json(data);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Error fetching appointments"
        });

    }

});
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

/* MongoDB Connection */
console.log("Connecting to MongoDB...");

mongoose.connect(process.env.MONGO_URI, {
    family: 4
})
.then(() => {

    console.log("✅ MongoDB Connected Successfully");

    app.listen(PORT, () => {
        console.log("🚀 Server running on port " + PORT);
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

        console.log(req.body);

        const booking = new Booking(req.body);

        await booking.save();

        res.json({
            success: true,
            message: "Booking saved successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Error saving booking"
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
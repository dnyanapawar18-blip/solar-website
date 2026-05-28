require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

/* =========================
   CORS FIX
========================= */
app.use(cors({
    origin: "*",
    methods: ["GET", "POST","OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

const FILE_PATH = path.join(__dirname, "appointments.json");

/* =========================
   TEST ROUTES
========================= */
app.get("/", (req, res) => {
    res.send("Super Sun Solar Backend Running ✔");
});

app.get("/test", (req, res) => {
    res.send("Backend Working ✔");
});

/* =========================
   BOOK APPOINTMENT
========================= */
app.post("/book-appointment", (req, res) => {
    try {
        const newAppointment = {
            id: Date.now(),
            name: req.body.name,
            mobile: req.body.mobile,
            address: req.body.address,
            requirement: req.body.requirement,
            message: req.body.message,
            createdAt: new Date()
        };

        let appointments = [];

        // Read old appointments
        if (fs.existsSync(FILE_PATH)) {
            const fileData = fs.readFileSync(FILE_PATH, "utf8");
            appointments = JSON.parse(fileData || "[]");
        }

        // Add new appointment
        appointments.push(newAppointment);

        // Save file
        fs.writeFileSync(
            FILE_PATH,
            JSON.stringify(appointments, null, 2),
            "utf8"
        );

        console.log("Saved Appointment Locally ✔", newAppointment);

        res.json({
            success: true,
            message: "Appointment Booked Successfully"
        });

    } catch (error) {
        console.log("Form Save Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server Error saving appointment"
        });
    }
});

/* =========================
   GET ALL APPOINTMENTS
========================= */
app.get("/appointments", (req, res) => {
    try {
        if (!fs.existsSync(FILE_PATH)) {
            return res.json([]);
        }

        const fileData = fs.readFileSync(FILE_PATH, "utf8");
        const appointments = JSON.parse(fileData || "[]");

        res.json(appointments);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching appointments"
        });
    }
});

/* =========================
   START SERVER (KEEP LAST)
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port " + PORT + " 🚀");
    console.log("Saving data locally to: appointments.json");
});
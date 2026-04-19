const User = require("./models/user");
const TripPlan = require("./models/tripPlan");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Booking = require("./models/Booking");
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/tripverse")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Test route
app.get("/", (req, res) => {
    res.send("Server is running...");
});

// Dynamic port (required for Render)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// ===== REGISTER API =====
app.post("/register", async (req, res) => {
    try {
        const { name, email, phone, gender, password } = req.body;

        const newUser = new User({
            name,
            email,
            phone,
            gender,
            password
        });

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        await newUser.save();

        res.json({ message: "User registered successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error registering user" });
    }
});

// ===== LOGIN API =====
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.json({ message: "Login successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error logging in" });
    }
});
// ===== BOOKING API =====
app.post("/book", async (req, res) => {
    try {
        const { from, to, date, transport } = req.body;

        const newBooking = new Booking({
            from,
            to,
            date,
            transport
        });

        await newBooking.save();

        res.json({ message: "Booking successful" });

    } catch (error) {
        res.status(500).json({ error: "Booking failed" });
    }
});
// ===== TRIP PLAN APIs =====

// Save trip plan
app.post("/api/trip-plans", async (req, res) => {
    try {
        const {
            userId,
            startLocation,
            destination,
            travelDate,
            returnDate,
            travelers,
            transport,
            totalCost,
            costBreakdown,
            itinerary,
            recommendations
        } = req.body;

        const newTripPlan = new TripPlan({
            userId,
            startLocation,
            destination,
            travelDate,
            returnDate,
            travelers,
            transport,
            totalCost,
            costBreakdown,
            itinerary,
            recommendations
        });

        await newTripPlan.save();

        res.json({
            message: "Trip plan saved successfully",
            tripPlanId: newTripPlan._id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error saving trip plan" });
    }
});

// Get user's trip plans
app.get("/api/trip-plans/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const tripPlans = await TripPlan.find({ userId }).sort({ createdAt: -1 });

        res.json(tripPlans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching trip plans" });
    }
});

// Delete trip plan
app.delete("/api/trip-plans/:planId", async (req, res) => {
    try {
        const { planId } = req.params;
        await TripPlan.findByIdAndDelete(planId);

        res.json({ message: "Trip plan deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting trip plan" });
    }
});

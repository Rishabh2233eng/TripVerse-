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
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tripverse")
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

        // Validate input
        if (!name || !email || !phone || !gender || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

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
        console.error("Registration error:", error.message);
        res.status(500).json({ message: `Error registering user: ${error.message}` });
    }
});

// ===== LOGIN API =====
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.json({ message: "Login successful", user: { email: user.email, name: user.name } });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: `Error logging in: ${error.message}` });
    }
});
// ===== BOOKING API =====
app.post("/book", async (req, res) => {
    try {
        const { from, to, date, transport } = req.body;

        if (!from || !to || !date || !transport) {
            return res.status(400).json({ message: "All booking fields are required" });
        }

        const newBooking = new Booking({
            from,
            to,
            date,
            transport
        });

        const savedBooking = await newBooking.save();

        res.json({ message: "Booking successful", booking: savedBooking });

    } catch (error) {
        console.error("Booking error:", error.message);
        res.status(500).json({ error: `Booking failed: ${error.message}` });
    }
});

// Get all bookings
app.get("/bookings", async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching bookings" });
    }
});

// Delete a booking by ID
app.delete("/bookings/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await Booking.findByIdAndDelete(id);
        res.json({ message: "Booking canceled successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error cancelling booking" });
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

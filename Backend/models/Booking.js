const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    from: String,
    to: String,
    date: String,
    transport: String
});

module.exports = mongoose.model("Booking", bookingSchema);
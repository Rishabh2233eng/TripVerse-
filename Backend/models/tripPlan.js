const mongoose = require("mongoose");

const tripPlanSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: false
    },
    startLocation: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    travelDate: {
        type: String,
        required: true
    },
    returnDate: {
        type: String,
        required: false
    },
    travelers: {
        type: Number,
        required: true,
        default: 1
    },
    transport: {
        type: String,
        required: true
    },
    totalCost: {
        type: Number,
        required: false
    },
    costBreakdown: {
        type: Object,
        required: false,
        default: {}
    },
    itinerary: {
        type: Array,
        required: false,
        default: []
    },
    recommendations: {
        type: Object,
        required: false,
        default: {}
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("TripPlan", tripPlanSchema);

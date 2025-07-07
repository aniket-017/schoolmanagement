const mongoose = require("mongoose");

const studentTransportSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transport",
      required: [true, "Route ID is required"],
    },

    // Stop Details
    stopName: {
      type: String,
      required: [true, "Stop name is required"],
    },
    pickupTime: {
      type: String,
      required: [true, "Pickup time is required"],
    },
    dropTime: {
      type: String,
      required: [true, "Drop time is required"],
    },

    // Fare
    monthlyFare: {
      type: Number,
      required: [true, "Monthly fare is required"],
      min: 0,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Emergency Contact
    emergencyContact: String,

    // Additional Information
    specialInstructions: String,
    medicalConditions: String,

    // Tracking
    enrolledDate: {
      type: Date,
      default: Date.now,
    },
    enrolledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique student-route combination
studentTransportSchema.index({ studentId: 1, routeId: 1 }, { unique: true });

// Create other indexes
studentTransportSchema.index({ studentId: 1 });
studentTransportSchema.index({ routeId: 1 });
studentTransportSchema.index({ isActive: 1 });

module.exports = mongoose.model("StudentTransport", studentTransportSchema);

const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      required: [true, "Route number is required"],
      unique: true,
      trim: true,
    },
    routeName: {
      type: String,
      required: [true, "Route name is required"],
      trim: true,
    },

    // Staff Assignment
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Driver ID is required"],
    },
    conductorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Vehicle Details
    vehicleNumber: {
      type: String,
      required: [true, "Vehicle number is required"],
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ["bus", "van", "mini_bus"],
      default: "bus",
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: 1,
    },

    // Route Information
    stops: [
      {
        stopName: {
          type: String,
          required: true,
        },
        stopCode: String,
        pickupTime: {
          type: String,
          required: true,
        },
        dropTime: {
          type: String,
          required: true,
        },
        fare: {
          type: Number,
          required: true,
          min: 0,
        },
        order: {
          type: Number,
          required: true,
        },
      },
    ],

    // Timing
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
    },

    // Additional Information
    description: String,

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Maintenance
    lastMaintenanceDate: Date,
    nextMaintenanceDate: Date,

    // Tracking
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Sort stops by order before saving
transportSchema.pre("save", function (next) {
  if (this.stops && this.stops.length > 0) {
    this.stops.sort((a, b) => a.order - b.order);
  }
  next();
});

// Create indexes
transportSchema.index({ routeNumber: 1 });
transportSchema.index({ routeName: 1 });
transportSchema.index({ driverId: 1 });
transportSchema.index({ vehicleNumber: 1 });
transportSchema.index({ isActive: 1 });

module.exports = mongoose.model("Transport", transportSchema);

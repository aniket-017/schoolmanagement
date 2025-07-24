const mongoose = require("mongoose");

const annualCalendarEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
    },
    attachments: [String],
    images: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

annualCalendarEventSchema.index({ date: 1 });
annualCalendarEventSchema.index({ isActive: 1 });

module.exports = mongoose.model("AnnualCalendarEvent", annualCalendarEventSchema); 
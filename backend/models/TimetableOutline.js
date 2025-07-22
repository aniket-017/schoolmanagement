const mongoose = require("mongoose");

const periodSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., Period 1, Break, Lunch
  startTime: { type: String, required: true }, // e.g., 07:00
  endTime: { type: String, required: true }, // e.g., 07:45
  type: { type: String, enum: ["period", "break"], default: "period" },
  duration: { type: Number, required: true }, // in minutes
});

const timetableOutlineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g., "10th Standard Outline"
    description: { type: String },
    periods: [periodSchema], // Array of period/break definitions
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimetableOutline", timetableOutlineSchema);

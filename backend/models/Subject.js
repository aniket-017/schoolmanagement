const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

subjectSchema.index({ name: 1 });

module.exports = mongoose.model("Subject", subjectSchema);

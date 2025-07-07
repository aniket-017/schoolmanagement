const mongoose = require("mongoose");

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: [true, "Assignment ID is required"],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },

    // Submission Content
    submission: String,
    attachments: [String],

    // Submission Details
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    isLate: {
      type: Boolean,
      default: false,
    },

    // Grading
    marksObtained: {
      type: Number,
      min: 0,
    },
    feedback: String,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    gradedAt: Date,

    // Status
    status: {
      type: String,
      enum: ["submitted", "graded", "returned", "resubmitted"],
      default: "submitted",
    },
  },
  {
    timestamps: true,
  }
);

// Check if submission is late
assignmentSubmissionSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const assignment = await mongoose.model("Assignment").findById(this.assignmentId);
      if (assignment && this.submittedAt > assignment.dueDate) {
        this.isLate = true;
      }
    } catch (error) {
      console.error("Error checking late submission:", error);
    }
  }
  next();
});

// Create indexes
assignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 });
assignmentSubmissionSchema.index({ studentId: 1 });
assignmentSubmissionSchema.index({ status: 1 });

module.exports = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);

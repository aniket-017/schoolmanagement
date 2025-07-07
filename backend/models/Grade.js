const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Examination",
      required: [true, "Exam ID is required"],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject ID is required"],
    },

    // Marks
    marksObtained: {
      type: Number,
      required: [true, "Marks obtained is required"],
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: [true, "Total marks is required"],
      min: 1,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      enum: ["A+", "A", "B+", "B", "C+", "C", "D", "F"],
    },

    // Detailed Assessment
    theoryMarks: Number,
    practicalMarks: Number,
    internalMarks: Number,

    // Feedback
    remarks: String,
    improvements: String,

    // Grading Information
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    gradedAt: Date,

    // Status
    status: {
      type: String,
      enum: ["draft", "published", "revised"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

// Calculate percentage before saving
gradeSchema.pre("save", function (next) {
  if (this.marksObtained && this.totalMarks) {
    this.percentage = Math.round((this.marksObtained / this.totalMarks) * 100 * 100) / 100;

    // Calculate grade based on percentage
    if (this.percentage >= 90) this.grade = "A+";
    else if (this.percentage >= 80) this.grade = "A";
    else if (this.percentage >= 70) this.grade = "B+";
    else if (this.percentage >= 60) this.grade = "B";
    else if (this.percentage >= 50) this.grade = "C+";
    else if (this.percentage >= 40) this.grade = "C";
    else if (this.percentage >= 35) this.grade = "D";
    else this.grade = "F";
  }
  next();
});

// Create indexes
gradeSchema.index({ studentId: 1, examId: 1 });
gradeSchema.index({ examId: 1 });
gradeSchema.index({ subjectId: 1 });
gradeSchema.index({ studentId: 1, subjectId: 1 });

module.exports = mongoose.model("Grade", gradeSchema);

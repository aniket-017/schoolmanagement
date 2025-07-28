const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    feeOutlineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeOutline",
    },
    installmentNumber: {
      type: Number,
      min: 1,
    },
    concessionApplied: {
      type: {
        name: {
          type: String,
          enum: ["scholarship", "sibling_discount", "merit_based", "need_based", "staff_ward", "free", "other"],
        },
        discountType: {
          type: String,
          enum: ["percentage", "fixed"],
        },
        discountValue: {
          type: Number,
          min: 0,
        },
        discountAmount: {
          type: Number,
          min: 0,
        },
        approvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        approvedDate: Date,
        reason: String,
      },
    },

    // Fee Details
    feeType: {
      type: String,
      enum: ["tuition", "library", "sports", "transport", "examination", "miscellaneous", "admission", "annual"],
      required: [true, "Fee type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },

    // Payment Information
    status: {
      type: String,
      enum: ["pending", "paid", "overdue", "partial", "cancelled"],
      default: "pending",
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paidDate: Date,
    paymentMethod: {
      type: String,
      enum: ["cash", "online", "cheque", "card"],
    },
    transactionId: String,
    receiptNumber: String,

    // Academic Period
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
    },
    semester: String,
    month: String,

    // Additional Information
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    penalty: {
      type: Number,
      default: 0,
      min: 0,
    },
    remarks: String,

    // Processing
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Calculate balance before saving
feeSchema.virtual("balance").get(function () {
  return this.amount - this.paidAmount + this.penalty - this.discount;
});

// Update status based on payment
feeSchema.pre("save", function (next) {
  const balance = this.amount - this.paidAmount + this.penalty - this.discount;

  if (balance <= 0) {
    this.status = "paid";
  } else if (this.paidAmount > 0) {
    this.status = "partial";
  } else if (new Date() > this.dueDate) {
    this.status = "overdue";
  } else {
    this.status = "pending";
  }

  next();
});

// Create indexes
feeSchema.index({ studentId: 1, status: 1 });
feeSchema.index({ dueDate: 1 });
feeSchema.index({ academicYear: 1 });
feeSchema.index({ feeType: 1 });

module.exports = mongoose.model("Fee", feeSchema);

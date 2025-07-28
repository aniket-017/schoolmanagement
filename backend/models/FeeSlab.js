const mongoose = require("mongoose");

const installmentSchema = new mongoose.Schema({
  installmentNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
});

const feeSlabSchema = new mongoose.Schema(
  {
    slabName: {
      type: String,
      required: [true, "Slab name is required"],
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: 0,
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
    },

    // Installments
    installments: [installmentSchema],

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Validate that installment percentages add up to 100%
feeSlabSchema.pre("save", function (next) {
  if (this.installments && this.installments.length > 0) {
    const totalPercentage = this.installments.reduce((sum, installment) => sum + installment.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.1) {
      return next(new Error("Installment percentages must add up to 100%"));
    }

    // Validate that installment amounts match percentages
    const totalAmount = this.installments.reduce((sum, installment) => sum + installment.amount, 0);
    if (Math.abs(totalAmount - this.totalAmount) > 0.01) {
      return next(new Error("Sum of installment amounts must equal total amount"));
    }
  }
  next();
});

// Calculate percentage for an installment based on amount
feeSlabSchema.methods.calculatePercentage = function (amount) {
  return (amount / this.totalAmount) * 100;
};

// Calculate installment amounts with concession
feeSlabSchema.methods.calculateWithConcession = function (concessionAmount) {
  const discountedTotal = this.totalAmount - concessionAmount;
  return this.installments.map((installment) => ({
    ...installment.toObject(),
    amount: Math.round((installment.percentage / 100) * discountedTotal),
    originalAmount: installment.amount,
    discountAmount: Math.round((installment.percentage / 100) * concessionAmount),
  }));
};

module.exports = mongoose.model("FeeSlab", feeSlabSchema);

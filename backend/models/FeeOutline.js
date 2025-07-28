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
  dueDate: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
});

const feeOutlineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Fee outline name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class is required"],
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
    },

    // Fee Structure
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: 0,
    },

    // Fee Components
    components: [
      {
        name: {
          type: String,
          required: true,
          enum: [
            "tuition",
            "admission",
            "library",
            "laboratory",
            "sports",
            "transport",
            "examination",
            "development",
            "maintenance",
            "uniform",
            "books",
            "miscellaneous",
          ],
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        isOptional: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
          default: "",
        },
      },
    ],

    // Installment Structure
    installments: [installmentSchema],

    // Concession Options
    concessionTypes: [
      {
        name: {
          type: String,
          required: true,
          enum: ["scholarship", "sibling_discount", "merit_based", "need_based", "staff_ward", "free", "other"],
        },
        discountType: {
          type: String,
          enum: ["percentage", "fixed"],
          required: true,
        },
        discountValue: {
          type: Number,
          required: true,
          min: 0,
        },
        maxAmount: {
          type: Number,
          min: 0,
        },
        description: {
          type: String,
          default: "",
        },
        eligibilityCriteria: {
          type: String,
          default: "",
        },
      },
    ],

    // Late Payment
    lateFeeStructure: {
      enabled: {
        type: Boolean,
        default: false,
      },
      gracePeriodinDays: {
        type: Number,
        default: 0,
        min: 0,
      },
      feeType: {
        type: String,
        enum: ["percentage", "fixed_per_day", "fixed_total"],
        default: "fixed_per_day",
      },
      amount: {
        type: Number,
        default: 0,
        min: 0,
      },
      maxAmount: {
        type: Number,
        min: 0,
      },
    },

    // Status and Metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
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

// Ensure only one default fee outline per class per academic year
feeOutlineSchema.index(
  { classId: 1, academicYear: 1, isDefault: 1 },
  {
    unique: true,
    partialFilterExpression: { isDefault: true },
  }
);

// Calculate total from components
feeOutlineSchema.virtual("calculatedTotal").get(function () {
  return this.components.reduce((total, component) => total + component.amount, 0);
});

// Validate installments total matches fee total
feeOutlineSchema.pre("save", function (next) {
  if (this.installments && this.installments.length > 0) {
    const installmentTotal = this.installments.reduce((total, installment) => total + installment.amount, 0);
    if (Math.abs(installmentTotal - this.totalAmount) > 0.01) {
      return next(new Error("Installment total must equal total fee amount"));
    }
  }

  // Ensure components total matches total amount
  const componentsTotal = this.components.reduce((total, component) => total + component.amount, 0);
  if (Math.abs(componentsTotal - this.totalAmount) > 0.01) {
    return next(new Error("Components total must equal total fee amount"));
  }

  next();
});

module.exports = mongoose.model("FeeOutline", feeOutlineSchema);

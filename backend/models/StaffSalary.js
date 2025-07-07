const mongoose = require("mongoose");

const staffSalarySchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employee ID is required"],
    },

    // Salary Period
    month: {
      type: String,
      required: [true, "Month is required"],
      enum: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
    },
    year: {
      type: String,
      required: [true, "Year is required"],
    },

    // Salary Components
    basicSalary: {
      type: Number,
      required: [true, "Basic salary is required"],
      min: 0,
    },
    allowances: {
      da: {
        // Dearness Allowance
        type: Number,
        default: 0,
      },
      hra: {
        // House Rent Allowance
        type: Number,
        default: 0,
      },
      ta: {
        // Travel Allowance
        type: Number,
        default: 0,
      },
      medical: {
        type: Number,
        default: 0,
      },
      performance: {
        type: Number,
        default: 0,
      },
      other: {
        type: Number,
        default: 0,
      },
    },

    // Deductions
    deductions: {
      tax: {
        type: Number,
        default: 0,
      },
      pf: {
        // Provident Fund
        type: Number,
        default: 0,
      },
      esi: {
        // Employee State Insurance
        type: Number,
        default: 0,
      },
      loan: {
        type: Number,
        default: 0,
      },
      advance: {
        type: Number,
        default: 0,
      },
      other: {
        type: Number,
        default: 0,
      },
    },

    // Calculated Values
    grossSalary: {
      type: Number,
      default: 0,
    },
    totalDeductions: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      default: 0,
    },

    // Working Days
    workingDays: {
      type: Number,
      required: [true, "Working days is required"],
      min: 0,
    },
    presentDays: {
      type: Number,
      required: [true, "Present days is required"],
      min: 0,
    },
    leaves: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Payment Status
    status: {
      type: String,
      enum: ["pending", "paid", "hold", "cancelled"],
      default: "pending",
    },
    paidDate: Date,
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "cash", "cheque"],
    },

    // Processing
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    remarks: String,
  },
  {
    timestamps: true,
  }
);

// Calculate totals before saving
staffSalarySchema.pre("save", function (next) {
  // Calculate gross salary
  const totalAllowances = Object.values(this.allowances).reduce((sum, value) => sum + (value || 0), 0);
  this.grossSalary = this.basicSalary + totalAllowances;

  // Calculate total deductions
  this.totalDeductions = Object.values(this.deductions).reduce((sum, value) => sum + (value || 0), 0);

  // Calculate net salary
  this.netSalary = this.grossSalary - this.totalDeductions;

  next();
});

// Create indexes
staffSalarySchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });
staffSalarySchema.index({ status: 1 });
staffSalarySchema.index({ year: 1, month: 1 });

module.exports = mongoose.model("StaffSalary", staffSalarySchema);

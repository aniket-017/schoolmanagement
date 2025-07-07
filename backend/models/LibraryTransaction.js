const mongoose = require("mongoose");

const libraryTransactionSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: [true, "Book ID is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    // Transaction Details
    transactionType: {
      type: String,
      enum: ["issue", "return", "renew", "reserve"],
      required: [true, "Transaction type is required"],
    },

    // Dates
    issueDate: {
      type: Date,
      required: [true, "Issue date is required"],
    },
    returnDate: {
      type: Date,
      required: [true, "Return date is required"],
    },
    actualReturnDate: Date,

    // Status
    status: {
      type: String,
      enum: ["issued", "returned", "overdue", "lost", "damaged"],
      default: "issued",
    },

    // Fines
    fineAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    fineStatus: {
      type: String,
      enum: ["pending", "paid", "waived"],
      default: "pending",
    },

    // Processing
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    returnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Additional Information
    remarks: String,

    // Renewal tracking
    renewalCount: {
      type: Number,
      default: 0,
    },
    maxRenewals: {
      type: Number,
      default: 2,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate fine for overdue books
libraryTransactionSchema.pre("save", function (next) {
  if (this.actualReturnDate && this.actualReturnDate > this.returnDate) {
    // Calculate fine: $1 per day overdue
    const daysOverdue = Math.ceil((this.actualReturnDate - this.returnDate) / (1000 * 60 * 60 * 24));
    this.fineAmount = daysOverdue * 1; // $1 per day
    this.status = "overdue";
  } else if (this.actualReturnDate) {
    this.status = "returned";
  }

  next();
});

// Update book availability after transaction
libraryTransactionSchema.post("save", async function (doc) {
  try {
    const Library = mongoose.model("Library");
    const book = await Library.findById(doc.bookId);

    if (book) {
      if (doc.transactionType === "issue") {
        book.availableCopies = Math.max(0, book.availableCopies - 1);
      } else if (doc.transactionType === "return" && doc.actualReturnDate) {
        book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
      }

      await book.save();
    }
  } catch (error) {
    console.error("Error updating book availability:", error);
  }
});

// Create indexes
libraryTransactionSchema.index({ bookId: 1, userId: 1 });
libraryTransactionSchema.index({ userId: 1, status: 1 });
libraryTransactionSchema.index({ returnDate: 1 });
libraryTransactionSchema.index({ status: 1 });

module.exports = mongoose.model("LibraryTransaction", libraryTransactionSchema);

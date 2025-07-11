const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema(
  {
    bookId: {
      type: String,
      required: [true, "Book ID is required"],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },
    isbn: {
      type: String,
      trim: true,
    },

    // Publication
    publisher: String,
    publicationYear: Number,
    edition: String,

    // Classification
    category: {
      type: String,
      enum: ["fiction", "non-fiction", "reference", "textbook", "journal", "magazine", "newspaper"],
      required: [true, "Category is required"],
    },
    subject: String,
    language: {
      type: String,
      default: "English",
    },

    // Physical Details
    totalCopies: {
      type: Number,
      required: [true, "Total copies is required"],
      min: 1,
    },
    availableCopies: {
      type: Number,
      required: [true, "Available copies is required"],
      min: 0,
    },
    location: String,
    shelfNumber: String,

    // Pricing
    price: {
      type: Number,
      min: 0,
    },
    purchaseDate: Date,
    vendor: String,

    // Status
    condition: {
      type: String,
      enum: ["new", "good", "fair", "poor", "damaged"],
      default: "new",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Additional Information
    description: String,
    keywords: [String],

    // Tracking
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Update available copies when total copies change
librarySchema.pre("save", function (next) {
  if (this.isModified("totalCopies") && this.isNew) {
    this.availableCopies = this.totalCopies;
  }

  // Ensure available copies don't exceed total copies
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }

  next();
});

// Create indexes
librarySchema.index({ title: 1 });
librarySchema.index({ author: 1 });
librarySchema.index({ isbn: 1 });
librarySchema.index({ category: 1 });
librarySchema.index({ subject: 1 });

module.exports = mongoose.model("Library", librarySchema);

const Library = require("../models/Library");
const LibraryTransaction = require("../models/LibraryTransaction");
const User = require("../models/User");

// Add a new book to library
exports.addBook = async (req, res) => {
  try {
    const { title, author, isbn, category, publisher, publication_year, total_copies, location, description, price } =
      req.body;

    // Validate required fields
    if (!title || !author || !isbn || !category || !total_copies) {
      return res.status(400).json({
        success: false,
        message: "Title, author, ISBN, category, and total copies are required",
      });
    }

    // Check if book with same ISBN already exists
    const existingBook = await Library.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: "Book with this ISBN already exists",
      });
    }

    const book = new Library({
      title,
      author,
      isbn,
      category,
      publisher,
      publication_year,
      total_copies,
      available_copies: total_copies,
      location,
      description,
      price,
      added_by: req.user.id,
    });

    await book.save();
    await book.populate("added_by", "name email");

    res.status(201).json({
      success: true,
      message: "Book added to library successfully",
      data: book,
    });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({
      success: false,
      message: "Error adding book to library",
      error: error.message,
    });
  }
};

// Get all books with filters
exports.getBooks = async (req, res) => {
  try {
    const { category, author, isbn, status, availability, search, page = 1, limit = 10 } = req.query;

    const query = {};

    // Build query filters
    if (category) query.category = category;
    if (author) query.author = new RegExp(author, "i");
    if (isbn) query.isbn = isbn;
    if (status) query.status = status;
    if (availability === "available") query.available_copies = { $gt: 0 };
    if (availability === "unavailable") query.available_copies = { $eq: 0 };

    // Search functionality
    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { author: new RegExp(search, "i") },
        { isbn: new RegExp(search, "i") },
        { category: new RegExp(search, "i") },
      ];
    }

    const skip = (page - 1) * limit;

    const books = await Library.find(query)
      .populate("added_by", "name email")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Library.countDocuments(query);

    res.json({
      success: true,
      data: books,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total,
      },
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching books",
      error: error.message,
    });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Library.findById(req.params.id).populate("added_by", "name email");

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Get recent transactions for this book
    const recentTransactions = await LibraryTransaction.find({ book_id: req.params.id })
      .populate("user_id", "name email")
      .sort({ created_at: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        book,
        recent_transactions: recentTransactions,
      },
    });
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching book",
      error: error.message,
    });
  }
};

// Update book information
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating certain fields
    delete updateData.added_by;
    delete updateData.created_at;

    // If total_copies is being updated, adjust available_copies
    if (updateData.total_copies !== undefined) {
      const book = await Library.findById(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }

      const borrowed = book.total_copies - book.available_copies;
      updateData.available_copies = Math.max(0, updateData.total_copies - borrowed);
    }

    const book = await Library.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate(
      "added_by",
      "name email"
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.json({
      success: true,
      message: "Book updated successfully",
      data: book,
    });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({
      success: false,
      message: "Error updating book",
      error: error.message,
    });
  }
};

// Delete book
exports.deleteBook = async (req, res) => {
  try {
    const book = await Library.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Check if there are any active borrows
    const activeBorrows = await LibraryTransaction.countDocuments({
      book_id: req.params.id,
      status: "borrowed",
    });

    if (activeBorrows > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete book with active borrows",
      });
    }

    await Library.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting book",
      error: error.message,
    });
  }
};

// Issue book to user
exports.issueBook = async (req, res) => {
  try {
    const { book_id, user_id, due_date } = req.body;

    // Validate required fields
    if (!book_id || !user_id || !due_date) {
      return res.status(400).json({
        success: false,
        message: "Book ID, user ID, and due date are required",
      });
    }

    // Check if book exists and is available
    const book = await Library.findById(book_id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.available_copies <= 0) {
      return res.status(400).json({
        success: false,
        message: "Book is not available for issue",
      });
    }

    // Check if user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user already has this book
    const existingBorrow = await LibraryTransaction.findOne({
      book_id,
      user_id,
      status: "borrowed",
    });

    if (existingBorrow) {
      return res.status(400).json({
        success: false,
        message: "User already has this book issued",
      });
    }

    // Create library transaction
    const transaction = new LibraryTransaction({
      book_id,
      user_id,
      transaction_type: "issue",
      status: "borrowed",
      issue_date: new Date(),
      due_date: new Date(due_date),
      issued_by: req.user.id,
    });

    await transaction.save();

    // Update book availability
    await Library.findByIdAndUpdate(book_id, {
      $inc: { available_copies: -1 },
    });

    await transaction.populate(["book_id", "user_id", "issued_by"]);

    res.status(201).json({
      success: true,
      message: "Book issued successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Error issuing book:", error);
    res.status(500).json({
      success: false,
      message: "Error issuing book",
      error: error.message,
    });
  }
};

// Return book
exports.returnBook = async (req, res) => {
  try {
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    // Find the transaction
    const transaction = await LibraryTransaction.findById(transaction_id).populate(["book_id", "user_id"]);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.status !== "borrowed") {
      return res.status(400).json({
        success: false,
        message: "Book is not currently borrowed",
      });
    }

    // Update transaction
    transaction.status = "returned";
    transaction.return_date = new Date();
    transaction.returned_by = req.user.id;

    await transaction.save();

    // Update book availability
    await Library.findByIdAndUpdate(transaction.book_id._id, {
      $inc: { available_copies: 1 },
    });

    await transaction.populate("returned_by", "name email");

    res.json({
      success: true,
      message: "Book returned successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Error returning book:", error);
    res.status(500).json({
      success: false,
      message: "Error returning book",
      error: error.message,
    });
  }
};

// Get library transactions
exports.getTransactions = async (req, res) => {
  try {
    const { book_id, user_id, status, transaction_type, start_date, end_date, page = 1, limit = 10 } = req.query;

    const query = {};

    // Build query filters
    if (book_id) query.book_id = book_id;
    if (user_id) query.user_id = user_id;
    if (status) query.status = status;
    if (transaction_type) query.transaction_type = transaction_type;

    // Date range filter
    if (start_date || end_date) {
      query.issue_date = {};
      if (start_date) query.issue_date.$gte = new Date(start_date);
      if (end_date) query.issue_date.$lte = new Date(end_date);
    }

    const skip = (page - 1) * limit;

    const transactions = await LibraryTransaction.find(query)
      .populate("book_id", "title author isbn")
      .populate("user_id", "name email")
      .populate("issued_by", "name email")
      .populate("returned_by", "name email")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LibraryTransaction.countDocuments(query);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error: error.message,
    });
  }
};

// Get user's borrowed books
exports.getUserBorrowedBooks = async (req, res) => {
  try {
    const { user_id } = req.params;

    const borrowedBooks = await LibraryTransaction.find({
      user_id,
      status: "borrowed",
    })
      .populate("book_id")
      .populate("issued_by", "name email")
      .sort({ issue_date: -1 });

    // Calculate overdue books
    const currentDate = new Date();
    const overdueBooks = borrowedBooks.filter((transaction) => new Date(transaction.due_date) < currentDate);

    res.json({
      success: true,
      data: {
        borrowed_books: borrowedBooks,
        overdue_books: overdueBooks,
        total_borrowed: borrowedBooks.length,
        total_overdue: overdueBooks.length,
      },
    });
  } catch (error) {
    console.error("Error fetching user borrowed books:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user borrowed books",
      error: error.message,
    });
  }
};

// Get overdue books
exports.getOverdueBooks = async (req, res) => {
  try {
    const currentDate = new Date();

    const overdueTransactions = await LibraryTransaction.find({
      status: "borrowed",
      due_date: { $lt: currentDate },
    })
      .populate("book_id", "title author isbn")
      .populate("user_id", "name email")
      .sort({ due_date: 1 });

    res.json({
      success: true,
      data: overdueTransactions,
      count: overdueTransactions.length,
    });
  } catch (error) {
    console.error("Error fetching overdue books:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching overdue books",
      error: error.message,
    });
  }
};

// Get library statistics
exports.getLibraryStats = async (req, res) => {
  try {
    const totalBooks = await Library.countDocuments();
    const totalCopies = await Library.aggregate([{ $group: { _id: null, total: { $sum: "$total_copies" } } }]);
    const availableCopies = await Library.aggregate([{ $group: { _id: null, total: { $sum: "$available_copies" } } }]);

    const totalBorrowed = await LibraryTransaction.countDocuments({ status: "borrowed" });
    const totalOverdue = await LibraryTransaction.countDocuments({
      status: "borrowed",
      due_date: { $lt: new Date() },
    });

    const categoryStats = await Library.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 }, total_copies: { $sum: "$total_copies" } } },
      { $sort: { count: -1 } },
    ]);

    const popularBooks = await LibraryTransaction.aggregate([
      { $group: { _id: "$book_id", borrow_count: { $sum: 1 } } },
      { $lookup: { from: "libraries", localField: "_id", foreignField: "_id", as: "book" } },
      { $unwind: "$book" },
      { $sort: { borrow_count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        total_books: totalBooks,
        total_copies: totalCopies.length > 0 ? totalCopies[0].total : 0,
        available_copies: availableCopies.length > 0 ? availableCopies[0].total : 0,
        total_borrowed: totalBorrowed,
        total_overdue: totalOverdue,
        category_stats: categoryStats,
        popular_books: popularBooks,
      },
    });
  } catch (error) {
    console.error("Error fetching library statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching library statistics",
      error: error.message,
    });
  }
};

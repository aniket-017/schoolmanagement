const express = require("express");
const router = express.Router();
const {
  addBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  issueBook,
  returnBook,
  getTransactions,
  getUserBorrowedBooks,
  getOverdueBooks,
  getLibraryStats,
} = require("../controllers/libraryController.js");
const { auth } = require("../middleware/auth.js");

// Add book to library (admins and librarians)
router.post("/", auth, addBook);

// Issue book to user
router.post("/issue", auth, issueBook);

// Return book
router.post("/return", auth, returnBook);

// Get all books with filters
router.get("/", auth, getBooks);

// Get book by ID
router.get("/:id", auth, getBookById);

// Get library transactions
router.get("/transactions", auth, getTransactions);

// Get user's borrowed books
router.get("/user/:user_id/borrowed", auth, getUserBorrowedBooks);

// Get overdue books
router.get("/overdue", auth, getOverdueBooks);

// Get library statistics
router.get("/stats/overview", auth, getLibraryStats);

// Update book information
router.put("/:id", auth, updateBook);

// Delete book
router.delete("/:id", auth, deleteBook);

module.exports = router;

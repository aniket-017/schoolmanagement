const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const compression = require("compression");

// Load environment variables
dotenv.config();

const app = express();

// Database connection
const connectDB = require("./config/database");
connectDB();

// Middleware
app.use(compression()); // Enable gzip compression
app.use(
  cors({
    origin: true, // Allow all origins for development
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Add caching headers for static assets
app.use((req, res, next) => {
  if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
    res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year
  }
  next();
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/student-auth", require("./routes/studentAuth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/students", require("./routes/students"));
app.use("/api/classes", require("./routes/classes"));
app.use("/api/assignments", require("./routes/assignments"));
app.use("/api/homework", require("./routes/homework"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/fees", require("./routes/fees"));

// New comprehensive routes
app.use("/api/subjects", require("./routes/subjects"));
app.use("/api/attendances", require("./routes/attendances"));
app.use("/api/timetables", require("./routes/timetables"));
app.use("/api/teachers", require("./routes/teachers"));
app.use("/api/examinations", require("./routes/examinations"));
app.use("/api/grades", require("./routes/grades"));
app.use("/api/syllabus", require("./routes/syllabus"));
app.use("/api/announcements", require("./routes/announcements"));
app.use("/api/salaries", require("./routes/salaries"));
app.use("/api/libraries", require("./routes/libraries"));
app.use("/api/transports", require("./routes/transports"));
app.use("/api/communications", require("./routes/communications"));
app.use("/api/assignments-detailed", require("./routes/assignmentsroutes"));
app.use("/api/fees-detailed", require("./routes/feesroutes"));
app.use("/api/fee-slabs", require("./routes/feeSlabs"));
app.use("/api/annual-calendar", require("./routes/annualCalendar"));

// Health check route - must be before production static handling
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "School Management API is running",
    timestamp: new Date().toISOString(),
  });
});

// Serve static files from React app build
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // Handle React routing - return all requests to React app
  app.get("*", (req, res) => {
    // Skip API routes
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({
        success: false,
        message: "API route not found",
      });
    }
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Handle unmatched routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 1704;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`
🚀 School Management API Server Started!
📍 Server running on port ${PORT}
🌐 Environment: ${process.env.NODE_ENV}
🗄️  Database: ${process.env.MONGODB_URI}
🔗 Network: Server accessible from all devices on network
  `);
});

const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/school-management");
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      name: "School Administrator",
      email: "admin@school.com",
      password: "admin123",
      role: "admin",
      phone: "+1234567890",
      // status will automatically be set to 'approved' for admin role
    };

    const admin = await User.create(adminData);
    console.log("Admin user created successfully!");
    console.log("Email:", admin.email);
    console.log("Password: admin123");
    console.log("Status:", admin.status);
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
};

createAdmin();

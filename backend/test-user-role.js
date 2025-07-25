const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const checkUsers = async () => {
  try {
    console.log("Checking all users in the database:");
    
    const users = await User.find({}).select('email role status isActive');
    
    users.forEach(user => {
      console.log(`Email: ${user.email}, Role: ${user.role}, Status: ${user.status}, Active: ${user.isActive}`);
    });
    
    console.log("\nChecking for admin users specifically:");
    const adminUsers = await User.find({ role: "admin" }).select('email role status isActive');
    
    if (adminUsers.length === 0) {
      console.log("No admin users found!");
    } else {
      adminUsers.forEach(user => {
        console.log(`Admin - Email: ${user.email}, Role: ${user.role}, Status: ${user.status}, Active: ${user.isActive}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error checking users:", error);
    process.exit(1);
  }
};

// Run the script
connectDB().then(() => {
  checkUsers();
}); 
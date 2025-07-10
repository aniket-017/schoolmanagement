const mongoose = require("mongoose");
const User = require("../models/User");
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

const checkTeachers = async () => {
  try {
    const teachers = await User.find({ role: "teacher" });
    console.log(`Found ${teachers.length} teachers in database:`);
    
    if (teachers.length === 0) {
      console.log("No teachers found. You need to create teachers first.");
      console.log("Run: node scripts/createTeachers.js");
    } else {
      teachers.forEach((teacher, index) => {
        console.log(`${index + 1}. ${teacher.name} (${teacher.email}) - Status: ${teacher.status}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("Error checking teachers:", error);
    process.exit(1);
  }
};

// Run the script
connectDB().then(() => {
  checkTeachers();
}); 
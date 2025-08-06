const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@school.com" });

    if (existingAdmin) {
      console.log("Admin user already exists:");
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
      console.log(`Status: ${existingAdmin.status}`);
      console.log("Password: admin123");
      return;
    }

    const adminUser = new User({
      name: "School Administrator",
      email: "admin@school.com",
      password: "Admin@2024", // More secure password
      role: "admin",
      phone: "+1234567890",
      address: {
        street: "123 School Street",
        city: "Education City",
        state: "Learning State",
        zipCode: "12345",
        country: "USA",
      },
      employeeId: "ADMIN001",
      gender: "other",
      isActive: true,
      status: "approved",
      isFirstLogin: false,
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@school.com");
    console.log("🔑 Password: Admin@2024");
    console.log("👤 Role: admin");
    console.log("✅ Status: approved");
    console.log("\n🎯 You can now login to the admin dashboard!");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

// Run the script
connectDB().then(() => {
  createAdminUser();
});

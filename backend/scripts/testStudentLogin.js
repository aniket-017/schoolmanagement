const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

// Load environment variables
dotenv.config();

// Import Student model
const Student = require("../models/Student");

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

// Test student login functionality
const testStudentLogin = async () => {
  try {
    console.log("🔍 Finding students with login passwords...");
    
    const students = await Student.find({ loginPassword: { $exists: true, $ne: null } });
    console.log(`📊 Found ${students.length} students with login passwords`);
    
    if (students.length === 0) {
      console.log("❌ No students with login passwords found. Run generateStudentPasswords.js first.");
      return;
    }
    
    // Test with the first student
    const testStudent = students[0];
    console.log(`\n🧪 Testing login for: ${testStudent.name || testStudent.email}`);
    console.log(`📧 Email: ${testStudent.email}`);
    console.log(`🔢 Roll Number: ${testStudent.rollNumber}`);
    console.log(`👩 Mother's Name: ${testStudent.mother?.name}`);
    console.log(`🔑 Generated Password: ${testStudent.loginPassword}`);
    
    // Test password verification
    const isPasswordValid = testStudent.verifyLoginPassword(testStudent.loginPassword);
    console.log(`✅ Password verification: ${isPasswordValid ? "PASSED" : "FAILED"}`);
    
    // Test with wrong password
    const isWrongPasswordValid = testStudent.verifyLoginPassword("wrongpassword");
    console.log(`❌ Wrong password test: ${isWrongPasswordValid ? "FAILED" : "PASSED"}`);
    
    // Test JWT token generation
    const token = jwt.sign({ id: testStudent._id, type: 'student' }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    console.log(`🎫 JWT Token generated: ${token.substring(0, 50)}...`);
    
    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`✅ JWT Token verification: PASSED`);
      console.log(`👤 Decoded user ID: ${decoded.id}`);
      console.log(`🎭 User type: ${decoded.type}`);
    } catch (error) {
      console.log(`❌ JWT Token verification: FAILED - ${error.message}`);
    }
    
    console.log("\n🎉 Student login functionality test completed successfully!");
    
  } catch (error) {
    console.error("❌ Error testing student login:", error);
  }
};

// Main function
const main = async () => {
  console.log("🚀 Starting student login functionality test...");
  
  await connectDB();
  await testStudentLogin();
  
  console.log("✅ Test completed");
  process.exit(0);
};

// Run the script
main().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
}); 
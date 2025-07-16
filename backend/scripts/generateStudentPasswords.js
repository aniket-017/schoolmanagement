const mongoose = require("mongoose");
const dotenv = require("dotenv");

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

// Generate passwords for all students
const generatePasswordsForAllStudents = async () => {
  try {
    console.log("🔍 Finding all students...");
    
    const students = await Student.find({});
    console.log(`📊 Found ${students.length} students`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const student of students) {
      try {
        // Check if student has required fields
        if (!student.rollNumber) {
          console.log(`⚠️  Skipping ${student.name || student.email}: No roll number`);
          errorCount++;
          continue;
        }
        
        if (!student.mother || !student.mother.name) {
          console.log(`⚠️  Skipping ${student.name || student.email}: No mother's name`);
          errorCount++;
          continue;
        }
        
        // Generate password
        const password = student.generateLoginPassword();
        if (password) {
          await student.save();
          console.log(`✅ Generated password for ${student.name || student.email}: ${password}`);
          successCount++;
        } else {
          console.log(`❌ Failed to generate password for ${student.name || student.email}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${student.name || student.email}:`, error.message);
        errorCount++;
      }
    }
    
    console.log("\n📈 Summary:");
    console.log(`✅ Successfully generated passwords: ${successCount}`);
    console.log(`❌ Failed to generate passwords: ${errorCount}`);
    console.log(`📊 Total students processed: ${students.length}`);
    
  } catch (error) {
    console.error("❌ Error generating passwords:", error);
  }
};

// Main function
const main = async () => {
  console.log("🚀 Starting student password generation...");
  
  await connectDB();
  await generatePasswordsForAllStudents();
  
  console.log("✅ Password generation completed");
  process.exit(0);
};

// Run the script
main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
}); 
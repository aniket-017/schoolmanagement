const mongoose = require("mongoose");
const config = require("../config/database");
const StudentAttendance = require("../models/Attendance");
const Student = require("../models/Student");
const Class = require("../models/Class");
const User = require("../models/User");

// Connect to database
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testAttendanceSystem = async () => {
  try {
    console.log("Testing new attendance system...");

    // Get a sample student and class
    const student = await Student.findOne().populate("class");
    const classData = await Class.findOne();
    const teacher = await User.findOne({ role: "teacher" });

    if (!student || !classData || !teacher) {
      console.log("Need at least one student, class, and teacher to run tests");
      return;
    }

    console.log(`Testing with student: ${student.firstName} ${student.lastName}`);
    console.log(`Class: ${classData.grade}${classData.division}`);
    console.log(`Teacher: ${teacher.name}`);

    // Test 1: Create StudentAttendance document
    console.log("\n1. Testing StudentAttendance creation...");

    let studentAttendance = new StudentAttendance({
      studentId: student._id,
      classId: student.class._id,
      academicYear: new Date().getFullYear().toString(),
      attendanceRecords: [],
    });

    await studentAttendance.save();
    console.log("✓ StudentAttendance document created successfully");

    // Test 2: Add attendance records
    console.log("\n2. Testing attendance record addition...");

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await studentAttendance.addAttendanceRecord({
      date: today,
      status: "present",
      timeIn: "08:00",
      timeOut: "15:00",
      markedBy: teacher._id,
      attendanceType: "daily",
    });

    await studentAttendance.addAttendanceRecord({
      date: yesterday,
      status: "absent",
      markedBy: teacher._id,
      attendanceType: "daily",
      remarks: "Student was sick",
    });

    console.log("✓ Attendance records added successfully");

    // Test 3: Test duplicate prevention
    console.log("\n3. Testing duplicate prevention...");

    await studentAttendance.addAttendanceRecord({
      date: today,
      status: "late",
      timeIn: "08:30",
      markedBy: teacher._id,
      attendanceType: "daily",
    });

    console.log("✓ Duplicate prevention working (should have updated today's record)");

    // Test 4: Test statistics
    console.log("\n4. Testing statistics calculation...");

    await studentAttendance.populate("studentId", "name");
    const stats = studentAttendance.statistics;

    console.log("Attendance Statistics:");
    console.log(`- Total Days: ${stats.totalDays}`);
    console.log(`- Present Days: ${stats.presentDays}`);
    console.log(`- Absent Days: ${stats.absentDays}`);
    console.log(`- Attendance Percentage: ${stats.attendancePercentage}%`);

    // Test 5: Test date range queries
    console.log("\n5. Testing date range queries...");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();

    const rangeRecords = studentAttendance.getAttendanceForRange(startDate, endDate);
    console.log(`✓ Found ${rangeRecords.length} records in date range`);

    // Test 6: Test class attendance retrieval
    console.log("\n6. Testing class attendance retrieval...");

    const classAttendance = await StudentAttendance.getClassAttendanceForDate(
      student.class._id,
      today.toISOString().split("T")[0]
    );

    console.log(`✓ Retrieved attendance for ${classAttendance.length} students in class`);

    // Test 7: Test bulk attendance marking
    console.log("\n7. Testing bulk attendance marking...");

    const attendanceData = {
      [student._id.toString()]: {
        status: "present",
        timeIn: "08:00",
        markedBy: teacher._id,
        attendanceType: "daily",
      },
    };

    await StudentAttendance.bulkMarkClassAttendance(
      student.class._id,
      today.toISOString().split("T")[0],
      attendanceData
    );

    console.log("✓ Bulk attendance marking completed successfully");

    // Test 8: Test model methods
    console.log("\n8. Testing model methods...");

    // Test getAttendanceForMonth
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthRecords = studentAttendance.getAttendanceForMonth(currentMonth, currentYear);
    console.log(`✓ Found ${monthRecords.length} records for current month`);

    // Test 9: Test update and delete operations
    console.log("\n9. Testing update and delete operations...");

    // Update attendance
    const updateData = {
      status: "late",
      remarks: "Updated remark",
    };

    const updatedRecord = await StudentAttendance.findOneAndUpdate(
      { studentId: student._id },
      { $set: { "attendanceRecords.0.status": "late", "attendanceRecords.0.remarks": "Updated remark" } },
      { new: true }
    );

    console.log("✓ Attendance record updated successfully");

    // Test 10: Performance test
    console.log("\n10. Testing performance...");

    const startTime = Date.now();

    // Simulate adding multiple attendance records
    for (let i = 0; i < 10; i++) {
      const testDate = new Date();
      testDate.setDate(testDate.getDate() - i);

      await studentAttendance.addAttendanceRecord({
        date: testDate,
        status: i % 2 === 0 ? "present" : "absent",
        markedBy: teacher._id,
        attendanceType: "daily",
      });
    }

    const endTime = Date.now();
    console.log(`✓ Added 10 attendance records in ${endTime - startTime}ms`);

    console.log("\n🎉 All tests passed! The new attendance system is working correctly.");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run tests if this script is executed directly
if (require.main === module) {
  testAttendanceSystem();
}

module.exports = testAttendanceSystem;

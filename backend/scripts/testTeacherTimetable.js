const mongoose = require("mongoose");
const Timetable = require("../models/Timetable");
const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
require("dotenv").config();

async function testTeacherTimetable() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/school_management");
    console.log("Connected to database");

    // Check if there are any timetable entries
    const totalTimetables = await Timetable.countDocuments();
    console.log("Total timetable entries:", totalTimetables);

    // Check if there are any active timetable entries
    const activeTimetables = await Timetable.countDocuments({ isActive: true });
    console.log("Active timetable entries:", activeTimetables);

    // Get all timetable entries
    const timetables = await Timetable.find({ isActive: true })
      .populate("classId", "grade division")
      .populate("periods.subject", "name code")
      .populate("periods.teacher", "name email");

    console.log("\nAll timetable entries:");
    timetables.forEach((timetable, index) => {
      console.log(
        `\n${index + 1}. Day: ${timetable.day}, Class: ${timetable.classId?.grade}${timetable.classId?.division}`
      );
      console.log("   Periods:", timetable.periods.length);
      timetable.periods.forEach((period, pIndex) => {
        console.log(
          `     ${pIndex + 1}. Subject: ${period.subject?.name || "Unknown"}, Teacher: ${
            period.teacher?.name || "Unknown"
          }, Time: ${period.startTime}-${period.endTime}`
        );
      });
    });

    // Check for teachers
    const teachers = await User.find({ role: "teacher" }).select("name email");
    console.log("\nTeachers in system:", teachers.length);
    teachers.forEach((teacher) => {
      console.log(`- ${teacher.name} (${teacher.email})`);
    });

    // Check for specific teacher timetables
    if (teachers.length > 0) {
      const firstTeacher = teachers[0];
      console.log(`\nChecking timetable for teacher: ${firstTeacher.name} (${firstTeacher._id})`);

      const teacherTimetables = await Timetable.find({
        "periods.teacher": firstTeacher._id,
        isActive: true,
      }).populate([
        { path: "classId", select: "grade division classroom" },
        { path: "periods.subject", select: "name code description" },
        { path: "periods.teacher", select: "name email phone" },
      ]);

      console.log(`Found ${teacherTimetables.length} timetable entries for this teacher`);

      if (teacherTimetables.length > 0) {
        teacherTimetables.forEach((timetable, index) => {
          console.log(
            `\nTimetable ${index + 1}: Day: ${timetable.day}, Class: ${timetable.classId?.grade}${
              timetable.classId?.division
            }`
          );
          const teacherPeriods = timetable.periods.filter(
            (period) => period.teacher && period.teacher._id.toString() === firstTeacher._id.toString()
          );
          console.log(`Teacher periods: ${teacherPeriods.length}`);
          teacherPeriods.forEach((period, pIndex) => {
            console.log(
              `  ${pIndex + 1}. ${period.subject?.name || "Unknown"} (${period.startTime}-${period.endTime})`
            );
          });
        });
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

testTeacherTimetable();

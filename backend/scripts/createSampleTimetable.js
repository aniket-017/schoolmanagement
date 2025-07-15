const mongoose = require("mongoose");
const Timetable = require("../models/Timetable");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const User = require("../models/User");
require("dotenv").config();

async function createSampleTimetable() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/school_management");
    console.log("Connected to database");

    // Get or create a class
    let classData = await Class.findOne();
    if (!classData) {
      console.log("No classes found. Creating a sample class...");
      classData = new Class({
        grade: "10",
        division: "A",
        classroom: "Room 101",
        academicYear: new Date().getFullYear().toString(),
        capacity: 30,
        classTeacher: null,
      });
      await classData.save();
      console.log("Created sample class:", classData._id);
    }

    // Get or create subjects
    let subjects = await Subject.find().limit(5);
    if (subjects.length === 0) {
      console.log("No subjects found. Creating sample subjects...");
      const sampleSubjects = [
        { name: "Mathematics", code: "MATH101", description: "Advanced Mathematics" },
        { name: "English", code: "ENG101", description: "English Literature" },
        { name: "Science", code: "SCI101", description: "General Science" },
        { name: "History", code: "HIST101", description: "World History" },
        { name: "Geography", code: "GEO101", description: "Physical Geography" },
      ];

      subjects = await Subject.insertMany(sampleSubjects);
      console.log("Created sample subjects");
    }

    // Get or create teachers
    let teachers = await User.find({ role: "teacher" }).limit(5);
    if (teachers.length === 0) {
      console.log("No teachers found. Creating sample teachers...");
      const sampleTeachers = [
        { name: "John Smith", email: "john.smith@school.com", role: "teacher", password: "password123" },
        { name: "Jane Doe", email: "jane.doe@school.com", role: "teacher", password: "password123" },
        { name: "Mike Johnson", email: "mike.johnson@school.com", role: "teacher", password: "password123" },
        { name: "Sarah Wilson", email: "sarah.wilson@school.com", role: "teacher", password: "password123" },
        { name: "David Brown", email: "david.brown@school.com", role: "teacher", password: "password123" },
      ];

      teachers = await User.insertMany(sampleTeachers);
      console.log("Created sample teachers");
    }

    // Check if timetable already exists
    const existingTimetable = await Timetable.findOne({ classId: classData._id });
    if (existingTimetable) {
      console.log("Timetable already exists for this class. Skipping creation.");
      return;
    }

    // Create sample timetable entries for each day
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = [
      { period: 1, startTime: "08:00", endTime: "08:45" },
      { period: 2, startTime: "08:45", endTime: "09:30" },
      { period: 3, startTime: "09:30", endTime: "10:15" },
      { period: 4, startTime: "10:15", endTime: "11:00" },
      { period: 5, startTime: "11:15", endTime: "12:00" },
      { period: 6, startTime: "12:00", endTime: "12:45" },
      { period: 7, startTime: "12:45", endTime: "01:30" },
      { period: 8, startTime: "01:30", endTime: "02:15" },
    ];

    for (const day of days) {
      const periods = timeSlots.map((slot, index) => ({
        periodNumber: slot.period,
        subject: subjects[index % subjects.length]._id,
        teacher: teachers[index % teachers.length]._id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        room: `Room ${101 + (index % 5)}`,
        type: index % 3 === 0 ? "theory" : index % 3 === 1 ? "practical" : "lab",
      }));

      const timetable = new Timetable({
        classId: classData._id,
        day: day,
        periods: periods,
        academicYear: new Date().getFullYear().toString(),
        semester: "1",
        isActive: true,
      });

      await timetable.save();
      console.log(`Created timetable for ${day}`);
    }

    console.log("Sample timetable created successfully!");
    console.log(`Created timetables for class: ${classData.grade}${classData.division}`);
    console.log(`Teachers assigned: ${teachers.length}`);
    console.log(`Subjects used: ${subjects.length}`);
  } catch (error) {
    console.error("Error creating sample timetable:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

createSampleTimetable();

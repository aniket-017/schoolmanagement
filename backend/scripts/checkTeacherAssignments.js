const mongoose = require("mongoose");
const Class = require("../models/Class");
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

const checkTeacherAssignments = async () => {
  try {
    console.log("Checking teacher assignments...\n");

    // Get all classes with assigned teachers
    const classesWithTeachers = await Class.find({ classTeacher: { $exists: true, $ne: null } })
      .populate("classTeacher", "name firstName middleName lastName email role")
      .populate("students", "name firstName lastName");

    console.log(`Found ${classesWithTeachers.length} classes with assigned teachers:\n`);

    classesWithTeachers.forEach((cls, index) => {
      console.log(`${index + 1}. Class: ${cls.grade}${cls.getOrdinalSuffix(cls.grade)} - ${cls.division}`);
      console.log(`   Teacher: ${cls.classTeacher ? (cls.classTeacher.name || [cls.classTeacher.firstName, cls.classTeacher.middleName, cls.classTeacher.lastName].filter(Boolean).join(" ")) : 'No teacher'}`);
      console.log(`   Students: ${cls.students ? cls.students.length : 0}`);
      console.log(`   Active: ${cls.isActive}`);
      console.log("");
    });

    // Get all teachers
    const teachers = await User.find({ role: "teacher" }).select("name firstName middleName lastName email");
    console.log(`\nTotal teachers in system: ${teachers.length}`);
    teachers.forEach((teacher, index) => {
      const teacherName = teacher.name || [teacher.firstName, teacher.middleName, teacher.lastName].filter(Boolean).join(" ");
      console.log(`${index + 1}. ${teacherName} (${teacher.email})`);
    });

    // Check if any teacher is assigned to multiple classes
    const teacherAssignments = {};
    classesWithTeachers.forEach(cls => {
      if (cls.classTeacher) {
        const teacherId = cls.classTeacher._id.toString();
        if (!teacherAssignments[teacherId]) {
          teacherAssignments[teacherId] = [];
        }
        teacherAssignments[teacherId].push(cls);
      }
    });

    console.log("\nTeacher assignments summary:");
    Object.keys(teacherAssignments).forEach(teacherId => {
      const classes = teacherAssignments[teacherId];
      const teacher = classes[0].classTeacher;
      const teacherName = teacher.name || [teacher.firstName, teacher.middleName, teacher.lastName].filter(Boolean).join(" ");
      console.log(`${teacherName} is assigned to ${classes.length} class(es)`);
    });

  } catch (error) {
    console.error("Error checking teacher assignments:", error);
  } finally {
    process.exit(0);
  }
};

// Run the script
connectDB().then(() => {
  checkTeacherAssignments();
}); 
const mongoose = require("mongoose");
const User = require("../models/User");
const Subject = require("../models/Subject");
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

const createSampleTeachers = async () => {
  try {
    // First, let's create some subjects if they don't exist
    const subjects = [
      { name: "Mathematics", code: "MATH-101" },
      { name: "English", code: "ENG-101" },
      { name: "Science", code: "SCI-101" },
      { name: "History", code: "HIST-101" },
      { name: "Geography", code: "GEO-101" },
      { name: "Computer Science", code: "CS-101" },
      { name: "Physics", code: "PHY-101" },
      { name: "Chemistry", code: "CHEM-101" },
      { name: "Biology", code: "BIO-101" },
      { name: "Literature", code: "LIT-101" },
    ];

    // Create subjects
    const createdSubjects = [];
    for (const subjectData of subjects) {
      let subject = await Subject.findOne({ code: subjectData.code });
      if (!subject) {
        subject = await Subject.create(subjectData);
        console.log(`Created subject: ${subject.name}`);
      }
      createdSubjects.push(subject);
    }

    // Sample teachers data
    const teachers = [
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@school.com",
        password: "teacher123",
        role: "teacher",
        employeeId: "T001",
        phone: "+1234567890",
        qualification: "M.Sc. Mathematics",
        experience: 8,
        subjects: [createdSubjects[0]._id, createdSubjects[6]._id], // Math, Physics
        address: {
          street: "123 Teacher Street",
          city: "Education City",
          state: "Learning State",
          zipCode: "12345",
          country: "USA",
        },
        gender: "female",
        isActive: true,
        status: "approved",
      },
      {
        name: "Michael Chen",
        email: "michael.chen@school.com",
        password: "teacher123",
        role: "teacher",
        employeeId: "T002",
        phone: "+1234567891",
        qualification: "Ph.D. Computer Science",
        experience: 12,
        subjects: [createdSubjects[5]._id, createdSubjects[0]._id], // CS, Math
        address: {
          street: "456 Tech Avenue",
          city: "Education City",
          state: "Learning State",
          zipCode: "12345",
          country: "USA",
        },
        gender: "male",
        isActive: true,
        status: "approved",
      },
      {
        name: "Emily Davis",
        email: "emily.davis@school.com",
        password: "teacher123",
        role: "teacher",
        employeeId: "T003",
        phone: "+1234567892",
        qualification: "M.A. English Literature",
        experience: 6,
        subjects: [createdSubjects[1]._id, createdSubjects[9]._id], // English, Literature
        address: {
          street: "789 Literature Lane",
          city: "Education City",
          state: "Learning State",
          zipCode: "12345",
          country: "USA",
        },
        gender: "female",
        isActive: true,
        status: "approved",
      },
      {
        name: "David Wilson",
        email: "david.wilson@school.com",
        password: "teacher123",
        role: "teacher",
        employeeId: "T004",
        phone: "+1234567893",
        qualification: "M.Sc. Chemistry",
        experience: 10,
        subjects: [createdSubjects[7]._id, createdSubjects[8]._id], // Chemistry, Biology
        address: {
          street: "321 Science Road",
          city: "Education City",
          state: "Learning State",
          zipCode: "12345",
          country: "USA",
        },
        gender: "male",
        isActive: true,
        status: "approved",
      },
      {
        name: "Lisa Brown",
        email: "lisa.brown@school.com",
        password: "teacher123",
        role: "teacher",
        employeeId: "T005",
        phone: "+1234567894",
        qualification: "M.A. History",
        experience: 7,
        subjects: [createdSubjects[3]._id, createdSubjects[4]._id], // History, Geography
        address: {
          street: "654 History Hill",
          city: "Education City",
          state: "Learning State",
          zipCode: "12345",
          country: "USA",
        },
        gender: "female",
        isActive: true,
        status: "approved",
      },
    ];

    // Create teachers
    const createdTeachers = [];
    for (const teacherData of teachers) {
      const existingTeacher = await User.findOne({ email: teacherData.email });
      if (!existingTeacher) {
        const teacher = await User.create(teacherData);
        console.log(`Created teacher: ${teacher.name} (${teacher.employeeId})`);
        createdTeachers.push(teacher);
      } else {
        console.log(`Teacher already exists: ${existingTeacher.name}`);
        createdTeachers.push(existingTeacher);
      }
    }

    console.log("\nSample teachers created successfully!");
    console.log("You can now test the assign teacher functionality.");
    console.log("\nTeacher credentials:");
    createdTeachers.forEach((teacher) => {
      console.log(`- ${teacher.name} (${teacher.email}): teacher123`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error creating sample teachers:", error);
    process.exit(1);
  }
};

// Run the script
connectDB().then(() => {
  createSampleTeachers();
});

const mongoose = require("mongoose");
const Class = require("../models/Class");
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

const createSampleClasses = async () => {
  try {
    // Clear existing classes
    await Class.deleteMany({});
    console.log("Cleared existing classes");

    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    const sampleClasses = [
      // 1st Class
      {
        name: "1st Class",
        grade: 1,
        division: "A",
        academicYear,
        maxStudents: 35,
        classroom: "Room 101",
        currentStrength: 0,
        isActive: true,
      },
      {
        name: "1st Class",
        grade: 1,
        division: "B",
        academicYear,
        maxStudents: 35,
        classroom: "Room 102",
        currentStrength: 0,
        isActive: true,
      },
      // 2nd Class
      {
        name: "2nd Class",
        grade: 2,
        division: "A",
        academicYear,
        maxStudents: 35,
        classroom: "Room 201",
        currentStrength: 0,
        isActive: true,
      },
      {
        name: "2nd Class",
        grade: 2,
        division: "B",
        academicYear,
        maxStudents: 35,
        classroom: "Room 202",
        currentStrength: 0,
        isActive: true,
      },
      // 3rd Class
      {
        name: "3rd Class",
        grade: 3,
        division: "A",
        academicYear,
        maxStudents: 40,
        classroom: "Room 301",
        currentStrength: 0,
        isActive: true,
      },
      {
        name: "3rd Class",
        grade: 3,
        division: "B",
        academicYear,
        maxStudents: 40,
        classroom: "Room 302",
        currentStrength: 0,
        isActive: true,
      },
      // 4th Class
      {
        name: "4th Class",
        grade: 4,
        division: "A",
        academicYear,
        maxStudents: 40,
        classroom: "Room 401",
        currentStrength: 0,
        isActive: true,
      },
      {
        name: "4th Class",
        grade: 4,
        division: "B",
        academicYear,
        maxStudents: 40,
        classroom: "Room 402",
        currentStrength: 0,
        isActive: true,
      },
      // 5th Class
      {
        name: "5th Class",
        grade: 5,
        division: "A",
        academicYear,
        maxStudents: 40,
        classroom: "Room 501",
        currentStrength: 0,
        isActive: true,
      },
      {
        name: "5th Class",
        grade: 5,
        division: "B",
        academicYear,
        maxStudents: 40,
        classroom: "Room 502",
        currentStrength: 0,
        isActive: true,
      },
      // 6th Class
      {
        name: "6th Class",
        grade: 6,
        division: "A",
        academicYear,
        maxStudents: 40,
        classroom: "Room 601",
        currentStrength: 0,
        isActive: true,
      },
      {
        name: "6th Class",
        grade: 6,
        division: "B",
        academicYear,
        maxStudents: 40,
        classroom: "Room 602",
        currentStrength: 0,
        isActive: true,
      },
      // 7th Class
      {
        name: "7th Class",
        grade: 7,
        division: "A",
        academicYear,
        maxStudents: 40,
        classroom: "Room 701",
        currentStrength: 0,
        isActive: true,
      },
      {
        name: "7th Class",
        grade: 7,
        division: "B",
        academicYear,
        maxStudents: 40,
        classroom: "Room 702",
        currentStrength: 0,
        isActive: true,
      },
      // 8th Class
      {
        name: "8th Class",
        grade: 8,
        division: "A",
        academicYear,
        maxStudents: 40,
        classroom: "Room 801",
        currentStrength: 0,
        isActive: true,
      },
      {
        name: "8th Class",
        grade: 8,
        division: "B",
        academicYear,
        maxStudents: 40,
        classroom: "Room 802",
        currentStrength: 0,
        isActive: true,
      },
      // 9th Class
      {
        name: "9th Class",
        grade: 9,
        division: "A",
        academicYear,
        maxStudents: 40,
        classroom: "Room 901",
        currentStrength: 0,
        isActive: true,
      },
      {
        name: "9th Class",
        grade: 9,
        division: "B",
        academicYear,
        maxStudents: 40,
        classroom: "Room 902",
        currentStrength: 0,
        isActive: true,
      },
      // 10th Class
      {
        name: "10th Class",
        grade: 10,
        division: "A",
        academicYear,
        maxStudents: 40,
        classroom: "Room 1001",
        currentStrength: 0,
        isActive: true,
      },
      {
        name: "10th Class",
        grade: 10,
        division: "B",
        academicYear,
        maxStudents: 40,
        classroom: "Room 1002",
        currentStrength: 0,
        isActive: true,
      },
    ];

    const createdClasses = await Class.insertMany(sampleClasses);
    console.log(`Created ${createdClasses.length} sample classes`);

    console.log("Sample classes created successfully!");
    console.log("\nCreated classes:");
    createdClasses.forEach((cls) => {
      console.log(`- ${cls.grade}${getOrdinalSuffix(cls.grade)} Class - ${cls.division} (${cls.classroom})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error creating sample classes:", error);
    process.exit(1);
  }
};

const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
};

// Run the script
connectDB().then(() => {
  createSampleClasses();
});

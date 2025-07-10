const mongoose = require("mongoose");
const Subject = require("../models/Subject");
require("dotenv").config();

const subjects = [
  {
    name: "Mathematics",
    code: "MATH001",
    description: "Basic and Advanced Mathematics",
    department: "Mathematics",
    credits: 3,
    totalMarks: 100,
    passingMarks: 35,
  },
  {
    name: "Physics",
    code: "PHY001",
    description: "Physics concepts and practical applications",
    department: "Science",
    credits: 3,
    totalMarks: 100,
    passingMarks: 35,
  },
  {
    name: "Chemistry",
    code: "CHEM001",
    description: "Organic and Inorganic Chemistry",
    department: "Science",
    credits: 3,
    totalMarks: 100,
    passingMarks: 35,
  },
  {
    name: "Biology",
    code: "BIO001",
    description: "Life Sciences and Biology",
    department: "Science",
    credits: 3,
    totalMarks: 100,
    passingMarks: 35,
  },
  {
    name: "English Literature",
    code: "ENG001",
    description: "English Language and Literature",
    department: "English",
    credits: 3,
    totalMarks: 100,
    passingMarks: 35,
  },
  {
    name: "English Grammar",
    code: "ENG002",
    description: "English Grammar and Composition",
    department: "English",
    credits: 2,
    totalMarks: 100,
    passingMarks: 35,
  },
  {
    name: "History",
    code: "HIST001",
    description: "World History and Civilizations",
    department: "Social Studies",
    credits: 3,
    totalMarks: 100,
    passingMarks: 35,
  },
  {
    name: "Geography",
    code: "GEO001",
    description: "Physical and Human Geography",
    department: "Social Studies",
    credits: 3,
    totalMarks: 100,
    passingMarks: 35,
  },
  {
    name: "Political Science",
    code: "POL001",
    description: "Government and Political Systems",
    department: "Social Studies",
    credits: 3,
    totalMarks: 100,
    passingMarks: 35,
  },
  {
    name: "Computer Science",
    code: "CS001",
    description: "Programming and Computer Applications",
    department: "Computer Science",
    credits: 4,
    totalMarks: 100,
    passingMarks: 35,
  },
  {
    name: "Information Technology",
    code: "IT001",
    description: "IT Fundamentals and Applications",
    department: "Computer Science",
    credits: 3,
    totalMarks: 100,
    passingMarks: 35,
  },
  {
    name: "Physical Education",
    code: "PE001",
    description: "Sports and Physical Fitness",
    department: "Physical Education",
    credits: 2,
    totalMarks: 100,
    passingMarks: 35,
  },
  {
    name: "Art & Craft",
    code: "ART001",
    description: "Visual Arts and Creative Expression",
    department: "Arts",
    credits: 2,
    totalMarks: 100,
    passingMarks: 35,
  },
  {
    name: "Music",
    code: "MUS001",
    description: "Music Theory and Practice",
    department: "Arts",
    credits: 2,
    totalMarks: 100,
    passingMarks: 35,
  },
  {
    name: "Spanish",
    code: "SPAN001",
    description: "Spanish Language and Culture",
    department: "Languages",
    credits: 3,
    totalMarks: 100,
    passingMarks: 35,
  },
  {
    name: "French",
    code: "FR001",
    description: "French Language and Culture",
    department: "Languages",
    credits: 3,
    totalMarks: 100,
    passingMarks: 35,
  },
];

async function createSubjects() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/schoolmanagement");
    console.log("Connected to MongoDB");

    // Clear existing subjects
    await Subject.deleteMany({});
    console.log("Cleared existing subjects");

    // Create new subjects
    const createdSubjects = await Subject.insertMany(subjects);
    console.log(`Created ${createdSubjects.length} subjects`);

    // Display created subjects
    console.log("\nCreated subjects:");
    createdSubjects.forEach((subject) => {
      console.log(`- ${subject.name} (${subject.code}) - ${subject.department}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error creating subjects:", error);
    process.exit(1);
  }
}

createSubjects();

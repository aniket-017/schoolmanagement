const mongoose = require('mongoose');
const Student = require('../models/Student');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolmanagment', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Valid category values from the model
const VALID_CATEGORIES = ['Open', 'NT', 'VJ', 'OBC', 'SC', 'ST', 'EWS', 'PWD', 'Other'];

// Function to clean and validate category
function cleanCategory(category) {
  // If category is null, undefined, empty string, or whitespace only, return null (optional)
  if (!category || String(category).trim() === '') {
    return null;
  }
  
  // Convert to string and trim
  const cleanCategory = String(category).trim();
  
  // Check if it's already a valid category
  if (VALID_CATEGORIES.includes(cleanCategory)) {
    return cleanCategory;
  }
  
  // Try to map common variations
  const categoryMap = {
    'open': 'Open',
    'general': 'Open',
    'gen': 'Open',
    'obc': 'OBC',
    'sc': 'SC',
    'st': 'ST',
    'ews': 'EWS',
    'pwd': 'PWD',
    'other': 'Other',
    'nt': 'NT',
    'vj': 'VJ',
    'vjnt': 'VJ',
    'ntdnt': 'NT'
  };
  
  const lowerCategory = cleanCategory.toLowerCase();
  if (categoryMap[lowerCategory]) {
    return categoryMap[lowerCategory];
  }
  
  // If no match found, return null (optional field)
  console.log(`Unknown category: "${category}" - setting to null (optional field)`);
  return null;
}

// Function to clean mobile number
function cleanMobileNumber(mobile) {
  if (!mobile) return null;
  
  // Convert to string and remove all non-digits
  let cleanMobile = String(mobile).replace(/\D/g, '');
  
  // If it's 11 digits and starts with 0, remove the leading 0
  if (cleanMobile.length === 11 && cleanMobile.startsWith('0')) {
    cleanMobile = cleanMobile.substring(1);
  }
  
  // If it's 12 digits and starts with 91, remove the country code
  if (cleanMobile.length === 12 && cleanMobile.startsWith('91')) {
    cleanMobile = cleanMobile.substring(2);
  }
  
  // Validate the final number
  if (cleanMobile.length === 10 && /^[1-9]/.test(cleanMobile)) {
    return cleanMobile;
  }
  
  console.log(`Invalid mobile number: "${mobile}" - setting to null`);
  return null;
}

// Function to clean date
function cleanDate(dateValue) {
  if (!dateValue) return null;
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  
  // If it's a string, try to parse it
  if (typeof dateValue === 'string') {
    const trimmed = dateValue.trim();
    if (trimmed === '' || trimmed.toLowerCase() === 'invalid date') {
      return null;
    }
    
    const parsedDate = new Date(trimmed);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }
  
  console.log(`Invalid date: "${dateValue}" - setting to null`);
  return null;
}

// Function to generate unique email if null
function generateUniqueEmail(studentId, firstName, lastName) {
  if (!firstName || !lastName) {
    return `student.${studentId}@school.com`;
  }
  
  const baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@school.com`;
  return baseEmail.replace(/\s+/g, '');
}

async function fixStudentDataValidation() {
  try {
    console.log('Starting student data validation fix...');
    
    // Get all students
    const students = await Student.find({});
    console.log(`Found ${students.length} students to process`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const student of students) {
      try {
        let hasChanges = false;
        
        // Fix category (optional field)
        if (student.category) {
          const cleanedCategory = cleanCategory(student.category);
          if (cleanedCategory !== student.category) {
            student.category = cleanedCategory;
            hasChanges = true;
          }
        }
        // If category is empty/null, leave it as is (optional field)
        
        // Fix mobile number
        if (student.mobileNumber) {
          const cleanMobile = cleanMobileNumber(student.mobileNumber);
          if (cleanMobile !== student.mobileNumber) {
            student.mobileNumber = cleanMobile;
            hasChanges = true;
          }
        }
        
        // Fix optional mobile number
        if (student.optionalMobileNumber) {
          const cleanOptionalMobile = cleanMobileNumber(student.optionalMobileNumber);
          if (cleanOptionalMobile !== student.optionalMobileNumber) {
            student.optionalMobileNumber = cleanOptionalMobile;
            hasChanges = true;
          }
        }
        
        // Fix admission date
        if (student.admissionDate) {
          const cleanAdmissionDate = cleanDate(student.admissionDate);
          if (cleanAdmissionDate !== student.admissionDate) {
            student.admissionDate = cleanAdmissionDate;
            hasChanges = true;
          }
        }
        
        // Fix date of birth
        if (student.dateOfBirth) {
          const cleanDateOfBirth = cleanDate(student.dateOfBirth);
          if (cleanDateOfBirth !== student.dateOfBirth) {
            student.dateOfBirth = cleanDateOfBirth;
            hasChanges = true;
          }
        }
        
        // Fix null email issue
        if (!student.email || student.email === 'null' || student.email === '') {
          const uniqueEmail = generateUniqueEmail(
            student.studentId || student._id,
            student.firstName,
            student.lastName
          );
          student.email = uniqueEmail;
          hasChanges = true;
        }
        
        // Fix parent mobile numbers
        if (student.mother && student.mother.phone) {
          const cleanMotherPhone = cleanMobileNumber(student.mother.phone);
          if (cleanMotherPhone !== student.mother.phone) {
            student.mother.phone = cleanMotherPhone;
            hasChanges = true;
          }
        }
        
        // Fix legacy phone field
        if (student.phone) {
          const cleanPhone = cleanMobileNumber(student.phone);
          if (cleanPhone !== student.phone) {
            student.phone = cleanPhone;
            hasChanges = true;
          }
        }
        
        // Fix parents mobile number
        if (student.parentsMobileNumber) {
          const cleanParentsMobile = cleanMobileNumber(student.parentsMobileNumber);
          if (cleanParentsMobile !== student.parentsMobileNumber) {
            student.parentsMobileNumber = cleanParentsMobile;
            hasChanges = true;
          }
        }
        
        // Save if there are changes
        if (hasChanges) {
          await student.save();
          updatedCount++;
          console.log(`Updated student: ${student.firstName} ${student.lastName} (${student.studentId})`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`Error processing student ${student._id}:`, error.message);
      }
    }
    
    console.log(`\nValidation fix completed!`);
    console.log(`Updated: ${updatedCount} students`);
    console.log(`Errors: ${errorCount} students`);
    
  } catch (error) {
    console.error('Error in fixStudentDataValidation:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
if (require.main === module) {
  fixStudentDataValidation();
}

module.exports = { fixStudentDataValidation }; 
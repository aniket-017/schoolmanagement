const Student = require('../models/Student');

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
  
  return null;
}

// Function to generate unique email
async function generateUniqueEmail(firstName, lastName, studentId) {
  if (!firstName || !lastName) {
    return `student.${studentId}@school.com`;
  }
  
  const baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@school.com`;
  const cleanEmail = baseEmail.replace(/\s+/g, '');
  
  // Check if email already exists
  const existingStudent = await Student.findOne({ email: cleanEmail });
  if (!existingStudent) {
    return cleanEmail;
  }
  
  // If exists, add a number suffix
  let counter = 1;
  let uniqueEmail = cleanEmail;
  while (true) {
    uniqueEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${counter}@school.com`;
    const existing = await Student.findOne({ email: uniqueEmail });
    if (!existing) {
      return uniqueEmail;
    }
    counter++;
  }
}

// Main validation function for student data
async function validateAndCleanStudentData(row, classId) {
  const errors = [];
  const cleanedData = {};
  
  // Required fields validation
  if (!row.FirstName || !row.LastName || !row.MobileNumber || !row.RollNumber) {
    errors.push("FirstName, LastName, MobileNumber, and RollNumber are required");
  }
  
  // Clean and validate mobile number
  const cleanMobile = cleanMobileNumber(row.MobileNumber);
  if (!cleanMobile) {
    errors.push("Mobile number must be exactly 10 digits and cannot start with 0");
  } else {
    cleanedData.mobileNumber = cleanMobile;
  }
  
  // Clean optional mobile number
  if (row.OptionalMobileNumber) {
    const cleanOptionalMobile = cleanMobileNumber(row.OptionalMobileNumber);
    if (cleanOptionalMobile) {
      cleanedData.optionalMobileNumber = cleanOptionalMobile;
    }
  }
  
  // Clean category (optional field)
  const cleanedCategory = cleanCategory(row.Category);
  if (cleanedCategory && cleanedCategory.trim() !== '') {
    cleanedData.category = cleanedCategory;
  }
  // If category is empty, null, or invalid, don't set it at all (optional field)
  
  // Clean dates
  if (row.DateOfBirth) {
    const cleanDateOfBirth = cleanDate(row.DateOfBirth);
    if (cleanDateOfBirth) {
      cleanedData.dateOfBirth = cleanDateOfBirth;
    }
  }
  
  if (row.AdmissionDate) {
    const cleanAdmissionDate = cleanDate(row.AdmissionDate);
    if (cleanAdmissionDate) {
      cleanedData.admissionDate = cleanAdmissionDate;
    }
  }
  
  // Handle email
  if (row.Email && String(row.Email).trim() !== '') {
    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (emailRegex.test(String(row.Email))) {
      cleanedData.email = String(row.Email).toLowerCase();
    } else {
      errors.push("Invalid email format");
    }
  } else {
    // Generate unique email if not provided
    const uniqueEmail = await generateUniqueEmail(row.FirstName, row.LastName, row.RollNumber);
    cleanedData.email = uniqueEmail;
  }
  
  // Check for duplicate email
  if (cleanedData.email) {
    const existingStudent = await Student.findOne({ email: cleanedData.email });
    if (existingStudent) {
      errors.push("Email already exists");
    }
  }
  
  // Check for duplicate roll number in class
  if (row.RollNumber && classId) {
    const existingRollNumber = await Student.findOne({
      class: classId,
      rollNumber: row.RollNumber,
    });
    if (existingRollNumber) {
      errors.push("Roll number already exists in this class");
    }
  }
  
  // Basic student data
  cleanedData.firstName = String(row.FirstName || '').trim();
  cleanedData.middleName = String(row.MiddleName || '').trim();
  cleanedData.lastName = String(row.LastName || '').trim();
  cleanedData.rollNumber = String(row.RollNumber || '').trim();
  cleanedData.gender = String(row.Gender || 'other').toLowerCase();
  
  // Personal Information
  if (row.Nationality) cleanedData.nationality = String(row.Nationality).trim();
  if (row.Religion) cleanedData.religion = String(row.Religion).trim();
  if (row.Caste) cleanedData.caste = String(row.Caste).trim();
  if (row.MotherTongue) cleanedData.motherTongue = String(row.MotherTongue).trim();
  if (row.BloodGroup) cleanedData.bloodGroup = String(row.BloodGroup).trim();
  if (row.Photo) cleanedData.photo = String(row.Photo).trim();
  
  // Contact & Address Details
  if (row.CurrentAddress) cleanedData.currentAddress = String(row.CurrentAddress).trim();
  if (row.PermanentAddress) cleanedData.permanentAddress = String(row.PermanentAddress).trim();
  if (row.City) cleanedData.city = String(row.City).trim();
  if (row.State) cleanedData.state = String(row.State).trim();
  if (row.PinCode) cleanedData.pinCode = String(row.PinCode).trim();
  
  // Parent/Guardian Information
  if (row.FatherName || row.FatherOccupation || row.FatherEmail || row.FatherIncome) {
    cleanedData.father = {
      name: String(row.FatherName || '').trim(),
      occupation: String(row.FatherOccupation || '').trim(),
      email: String(row.FatherEmail || '').trim(),
      annualIncome: row.FatherIncome ? parseFloat(row.FatherIncome) : undefined,
    };
  }
  
  if (row.MothersName || row.MotherOccupation || row.MotherEmail || row.MotherIncome) {
    cleanedData.mother = {
      name: String(row.MothersName || row.ParentName || '').trim(),
      occupation: String(row.MotherOccupation || '').trim(),
      email: String(row.MotherEmail || '').trim(),
      annualIncome: row.MotherIncome ? parseFloat(row.MotherIncome) : undefined,
    };
  }
  
  if (row.GuardianName || row.GuardianRelation || row.GuardianEmail) {
    cleanedData.guardian = {
      name: String(row.GuardianName || '').trim(),
      relation: String(row.GuardianRelation || '').trim(),
      email: String(row.GuardianEmail || '').trim(),
    };
  }
  
  // Academic Information
  if (row.RegistrationNumber) cleanedData.registrationNumber = String(row.RegistrationNumber).trim();
  if (row.AdmissionNumber) cleanedData.admissionNumber = String(row.AdmissionNumber).trim();
  if (row.Section) cleanedData.section = String(row.Section).trim();
  if (row.PreviousSchool) cleanedData.previousSchool = String(row.PreviousSchool).trim();
  if (row.TransferCertificateNumber) cleanedData.transferCertificateNumber = String(row.TransferCertificateNumber).trim();
  if (row.SpecialNeeds) cleanedData.specialNeeds = String(row.SpecialNeeds).trim();
  
  // Fees & Finance
  if (row.FeeStructure) cleanedData.feeStructure = String(row.FeeStructure).trim();
  if (row.FeeDiscount) cleanedData.feeDiscount = parseFloat(row.FeeDiscount);
  if (row.PaymentStatus) cleanedData.paymentStatus = String(row.PaymentStatus).trim();
  if (row.LateFees) cleanedData.lateFees = parseFloat(row.LateFees);
  
  // Physical & Health Metrics
  if (row.Height || row.Weight || row.VisionTestLeftEye || row.VisionTestRightEye || row.HearingTestLeftEar || row.HearingTestRightEar || row.FitnessScore) {
    cleanedData.physicalMetrics = {
      height: row.Height ? parseFloat(row.Height) : undefined,
      weight: row.Weight ? parseFloat(row.Weight) : undefined,
      visionTest: (row.VisionTestLeftEye || row.VisionTestRightEye) ? {
        leftEye: String(row.VisionTestLeftEye || '').trim(),
        rightEye: String(row.VisionTestRightEye || '').trim(),
        date: row.VisionTestDate ? cleanDate(row.VisionTestDate) : undefined,
      } : undefined,
      hearingTest: (row.HearingTestLeftEar || row.HearingTestRightEar) ? {
        leftEar: String(row.HearingTestLeftEar || '').trim(),
        rightEar: String(row.HearingTestRightEar || '').trim(),
        date: row.HearingTestDate ? cleanDate(row.HearingTestDate) : undefined,
      } : undefined,
      fitnessScore: row.FitnessScore ? parseFloat(row.FitnessScore) : undefined,
    };
  }
  
  // Medical Information
  if (row.Allergies || row.MedicalConditions || row.Medications || row.EmergencyInstructions || row.VaccinationStatus) {
    cleanedData.medicalHistory = {
      allergies: row.Allergies ? String(row.Allergies).split(',').map(a => a.trim()) : [],
      medicalConditions: row.MedicalConditions ? String(row.MedicalConditions).split(',').map(c => c.trim()) : [],
      medications: row.Medications ? String(row.Medications).split(',').map(m => m.trim()) : [],
      emergencyInstructions: String(row.EmergencyInstructions || '').trim(),
      vaccinationStatus: String(row.VaccinationStatus || 'complete').trim(),
    };
  }
  
  // Emergency Contact
  if (row.EmergencyContactName || row.EmergencyContactRelation || row.EmergencyContactPhone || row.EmergencyContactEmail) {
    cleanedData.emergencyContact = {
      name: String(row.EmergencyContactName || '').trim(),
      relation: String(row.EmergencyContactRelation || '').trim(),
      phone: String(row.EmergencyContactPhone || '').trim(),
      email: String(row.EmergencyContactEmail || '').trim(),
    };
  }
  
  // System & Access Information
  if (row.RFIDCardNumber) cleanedData.rfidCardNumber = String(row.RFIDCardNumber).trim();
  if (row.LibraryCardNumber) cleanedData.libraryCardNumber = String(row.LibraryCardNumber).trim();
  if (row.HostelRoomNumber || row.HostelWardenName || row.HostelWardenPhone) {
    cleanedData.hostelInformation = {
      roomNumber: String(row.HostelRoomNumber || '').trim(),
      wardenName: String(row.HostelWardenName || '').trim(),
      wardenPhone: String(row.HostelWardenPhone || '').trim(),
    };
  }
  
  // Transport Details
  if (row.TransportRequired || row.PickupPoint || row.DropPoint || row.BusNumber || row.DriverName || row.DriverPhone) {
    cleanedData.transportDetails = {
      required: row.TransportRequired === 'true' || row.TransportRequired === true,
      pickupPoint: String(row.PickupPoint || '').trim(),
      dropPoint: String(row.DropPoint || '').trim(),
      busNumber: String(row.BusNumber || '').trim(),
      driverName: String(row.DriverName || '').trim(),
      driverPhone: String(row.DriverPhone || '').trim(),
    };
  }
  
  // Documents
  if (row.BirthCertificate || row.TransferCertificate || row.CharacterCertificate || row.MedicalCertificate || row.AadharCard || row.CasteCertificate || row.IncomeCertificate || row.Passport) {
    cleanedData.documents = {
      birthCertificate: String(row.BirthCertificate || '').trim(),
      transferCertificate: String(row.TransferCertificate || '').trim(),
      characterCertificate: String(row.CharacterCertificate || '').trim(),
      medicalCertificate: String(row.MedicalCertificate || '').trim(),
      photograph: String(row.Photo || '').trim(),
      aadharCard: String(row.AadharCard || '').trim(),
      casteCertificate: String(row.CasteCertificate || '').trim(),
      incomeCertificate: String(row.IncomeCertificate || '').trim(),
      passport: String(row.Passport || '').trim(),
    };
  }
  
  // Legacy fields for backward compatibility
  cleanedData.mothersName = String(row.MothersName || row.ParentName || '').trim();
  cleanedData.parentsMobileNumber = String(row.ParentsMobileNumber || row.ParentPhone || '').trim();
  cleanedData.address = {
    street: String(row.CurrentAddress || row.Address || '').trim(),
    city: String(row.City || '').trim(),
    state: String(row.State || '').trim(),
    zipCode: String(row.ZipCode || '').trim(),
    country: String(row.Country || 'India').trim(),
  };
  
  return {
    isValid: errors.length === 0,
    errors,
    cleanedData
  };
}

module.exports = {
  validateAndCleanStudentData,
  cleanCategory,
  cleanMobileNumber,
  cleanDate,
  generateUniqueEmail
}; 
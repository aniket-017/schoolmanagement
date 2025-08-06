const Student = require("../models/Student");

// Valid category values from the model
const VALID_CATEGORIES = ["Open", "NT", "VJ", "OBC", "SC", "ST", "EWS", "PWD", "Other"];

// Function to clean and validate category
function cleanCategory(category) {
  // If category is null, undefined, empty string, or whitespace only, return null (optional)
  if (!category || String(category).trim() === "") {
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
    open: "Open",
    general: "Open",
    gen: "Open",
    obc: "OBC",
    sc: "SC",
    st: "ST",
    ews: "EWS",
    pwd: "PWD",
    other: "Other",
    nt: "NT",
    vj: "VJ",
    vjnt: "VJ",
    ntdnt: "NT",
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
  let cleanMobile = String(mobile).replace(/\D/g, "");

  // If it's 11 digits and starts with 0, remove the leading 0
  if (cleanMobile.length === 11 && cleanMobile.startsWith("0")) {
    cleanMobile = cleanMobile.substring(1);
  }

  // If it's 12 digits and starts with 91, remove the country code
  if (cleanMobile.length === 12 && cleanMobile.startsWith("91")) {
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

  console.log("Original dateValue:", dateValue, "Type:", typeof dateValue);

  // If it's already a Date object
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }

  // Try to parse Excel serial dates (numbers)
  if (typeof dateValue === "number" || (typeof dateValue === "string" && /^\d+(\.\d+)?$/.test(dateValue.trim()))) {
    const excelDateValue = typeof dateValue === "number" ? dateValue : parseFloat(dateValue);
    console.log("Detected possible Excel serial date:", excelDateValue);

    if (excelDateValue > 59) {
      // Account for Excel's leap year bug in 1900
      const millisecondsSince1900 = (excelDateValue - 1) * 24 * 60 * 60 * 1000;
      const excelEpoch = new Date(1899, 11, 31); // Dec 31, 1899
      const parsedDate = new Date(excelEpoch.getTime() + millisecondsSince1900);
      if (!isNaN(parsedDate.getTime())) {
        console.log("Successfully parsed Excel serial date:", parsedDate);
        return parsedDate;
      }
    }
  }

  // If it's a string, try to parse it
  if (typeof dateValue === "string") {
    const trimmed = dateValue.trim();
    if (trimmed === "" || trimmed.toLowerCase() === "invalid date") {
      return null;
    }

    console.log("Attempting to parse date string:", trimmed);

    // First priority: Handle DD-MM-YYYY format (with various separators)
    const ddmmyyyyRegex = /^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/;
    const ddmmyyyyMatch = trimmed.match(ddmmyyyyRegex);

    if (ddmmyyyyMatch) {
      console.log("DD-MM-YYYY format detected");
      const day = parseInt(ddmmyyyyMatch[1], 10);
      const month = parseInt(ddmmyyyyMatch[2], 10) - 1; // Months are 0-indexed in JS Date
      const year = parseInt(ddmmyyyyMatch[3], 10);

      console.log(`Parsed values - Day: ${day}, Month: ${month + 1}, Year: ${year}`);

      // Check if values are in valid ranges
      if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        const parsedDate = new Date(year, month, day);

        // Additional validation to ensure we don't accept invalid dates like Feb 31
        if (
          !isNaN(parsedDate.getTime()) &&
          parsedDate.getDate() === day &&
          parsedDate.getMonth() === month &&
          parsedDate.getFullYear() === year
        ) {
          console.log("DD-MM-YYYY format successfully parsed:", parsedDate);
          return parsedDate;
        } else {
          console.log("Invalid date combination");
        }
      } else {
        console.log("Month or day out of valid range");
      }
    }

    // If standard parsing works, use it as fallback
    const standardParsed = new Date(trimmed);
    if (!isNaN(standardParsed.getTime())) {
      console.log("Standard date parsing successful:", standardParsed);
      return standardParsed;
    }
  }

  console.log("Failed to parse date:", dateValue);
  return null;
}

// Function to generate unique email
async function generateUniqueEmail(firstName, lastName, studentId) {
  if (!firstName || !lastName) {
    return `student.${studentId}@school.com`;
  }

  const baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@school.com`;
  const cleanEmail = baseEmail.replace(/\s+/g, "");

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

// Helper function to get case-insensitive field value from row
function getFieldValue(row, fieldName) {
  console.log(`Looking for field: "${fieldName}" in row keys:`, Object.keys(row));

  // If the exact field exists, return it
  if (row[fieldName] !== undefined) {
    console.log(`Found exact match for "${fieldName}":`, row[fieldName]);
    return row[fieldName];
  }

  // Common variations for date fields
  const dateFieldVariations = {
    DateOfBirth: ["DOB", "Date of Birth", "Birth Date", "BirthDate", "Birth_Date", "Date-of-Birth", "Date_of_Birth"],
  };

  // If this is a date field, check all its variations
  if (dateFieldVariations[fieldName]) {
    for (const variation of dateFieldVariations[fieldName]) {
      if (row[variation] !== undefined) {
        console.log(`Found date field variation "${variation}" for "${fieldName}":`, row[variation]);
        return row[variation];
      }
    }
  }

  // Try case-insensitive search
  const lowerFieldName = fieldName.toLowerCase();
  for (const key in row) {
    if (key.toLowerCase() === lowerFieldName) {
      console.log(`Found case-insensitive match "${key}" for "${fieldName}":`, row[key]);
      return row[key];
    }
  }

  // Try with spaces (common Excel header variation)
  const spacedFieldName = fieldName.replace(/([A-Z])/g, " $1").trim();
  const lowerSpacedFieldName = spacedFieldName.toLowerCase();
  for (const key in row) {
    if (key.toLowerCase() === lowerSpacedFieldName || key.toLowerCase().replace(/\s+/g, "") === lowerFieldName) {
      console.log(`Found spaced variation "${key}" for "${fieldName}":`, row[key]);
      return row[key];
    }
  }

  // Special date field hacks - look for any field that might contain "date" and "birth"
  if (fieldName === "DateOfBirth") {
    for (const key in row) {
      if (key.toLowerCase().includes("date") && key.toLowerCase().includes("birth")) {
        console.log(`Found potential DOB field "${key}":`, row[key]);
        return row[key];
      }
    }
  }

  console.log(`No match found for "${fieldName}"`);
  return undefined;
}

// Main validation function for student data
async function validateAndCleanStudentData(row, classId) {
  const errors = [];
  const cleanedData = {};

  // Required fields validation
  const firstName = getFieldValue(row, "FirstName");
  const lastName = getFieldValue(row, "LastName");
  const mobileNumber = getFieldValue(row, "MobileNumber");
  const rollNumber = getFieldValue(row, "RollNumber");

  if (!firstName || !lastName || !mobileNumber || !rollNumber) {
    errors.push("FirstName, LastName, MobileNumber, and RollNumber are required");
  }

  // Clean and validate mobile number
  const cleanMobile = cleanMobileNumber(mobileNumber);
  if (!cleanMobile) {
    errors.push("Mobile number must be exactly 10 digits and cannot start with 0");
  } else {
    cleanedData.mobileNumber = cleanMobile;
  }

  // Clean optional mobile number
  const optionalMobileNumber = getFieldValue(row, "OptionalMobileNumber");
  if (optionalMobileNumber) {
    const cleanOptionalMobile = cleanMobileNumber(optionalMobileNumber);
    if (cleanOptionalMobile) {
      cleanedData.optionalMobileNumber = cleanOptionalMobile;
    }
  }

  // Clean category (optional field)
  const category = getFieldValue(row, "Category");
  const cleanedCategory = cleanCategory(category);
  if (cleanedCategory && cleanedCategory.trim() !== "") {
    cleanedData.category = cleanedCategory;
  }
  // If category is empty, null, or invalid, don't set it at all (optional field)

  // Clean dates
  const dateOfBirth = getFieldValue(row, "DateOfBirth");
  console.log("DateOfBirth field value found:", dateOfBirth);

  if (dateOfBirth) {
    console.log("Processing DateOfBirth:", dateOfBirth);
    const cleanDateOfBirth = cleanDate(dateOfBirth);
    console.log("Cleaned DateOfBirth result:", cleanDateOfBirth);

    if (cleanDateOfBirth) {
      cleanedData.dateOfBirth = cleanDateOfBirth;
      console.log("DateOfBirth set in cleanedData:", cleanDateOfBirth);
    } else {
      console.log("DateOfBirth parsing failed");
    }
  } else {
    console.log("No DateOfBirth value found in row");
    console.log("Available fields:", Object.keys(row).join(", "));
  }

  const admissionDate = getFieldValue(row, "AdmissionDate");
  if (admissionDate) {
    const cleanAdmissionDate = cleanDate(admissionDate);
    if (cleanAdmissionDate) {
      cleanedData.admissionDate = cleanAdmissionDate;
    }
  }

  // Handle email
  const email = getFieldValue(row, "Email");
  if (email && String(email).trim() !== "") {
    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (emailRegex.test(String(email))) {
      cleanedData.email = String(email).toLowerCase();
    } else {
      errors.push("Invalid email format");
    }
  } else {
    // Generate unique email if not provided
    const uniqueEmail = await generateUniqueEmail(firstName, lastName, rollNumber);
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
  if (rollNumber && classId) {
    const existingRollNumber = await Student.findOne({
      class: classId,
      rollNumber: rollNumber,
    });
    if (existingRollNumber) {
      errors.push("Roll number already exists in this class");
    }
  }

  // Basic student data
  cleanedData.firstName = String(firstName || "").trim();
  const middleName = getFieldValue(row, "MiddleName");
  cleanedData.middleName = String(middleName || "").trim();
  cleanedData.lastName = String(lastName || "").trim();
  cleanedData.rollNumber = String(rollNumber || "").trim();
  const gender = getFieldValue(row, "Gender");
  cleanedData.gender = String(gender || "other").toLowerCase();

  // Personal Information
  const nationality = getFieldValue(row, "Nationality");
  if (nationality) cleanedData.nationality = String(nationality).trim();

  const religion = getFieldValue(row, "Religion");
  if (religion) cleanedData.religion = String(religion).trim();

  const caste = getFieldValue(row, "Caste");
  if (caste) cleanedData.caste = String(caste).trim();

  const motherTongue = getFieldValue(row, "MotherTongue");
  if (motherTongue) cleanedData.motherTongue = String(motherTongue).trim();

  const bloodGroup = getFieldValue(row, "BloodGroup");
  if (bloodGroup) cleanedData.bloodGroup = String(bloodGroup).trim();

  const photo = getFieldValue(row, "Photo");
  if (photo) cleanedData.photo = String(photo).trim();

  // Contact & Address Details
  const currentAddress = getFieldValue(row, "CurrentAddress");
  if (currentAddress) cleanedData.currentAddress = String(currentAddress).trim();

  const permanentAddress = getFieldValue(row, "PermanentAddress");
  if (permanentAddress) cleanedData.permanentAddress = String(permanentAddress).trim();

  const city = getFieldValue(row, "City");
  if (city) cleanedData.city = String(city).trim();

  const state = getFieldValue(row, "State");
  if (state) cleanedData.state = String(state).trim();

  const pinCode = getFieldValue(row, "PinCode");
  if (pinCode) cleanedData.pinCode = String(pinCode).trim();

  // Parent/Guardian Information
  const fatherName = getFieldValue(row, "FatherName");
  const fatherOccupation = getFieldValue(row, "FatherOccupation");
  const fatherEmail = getFieldValue(row, "FatherEmail");
  const fatherIncome = getFieldValue(row, "FatherIncome");

  if (fatherName || fatherOccupation || fatherEmail || fatherIncome) {
    cleanedData.father = {
      name: String(fatherName || "").trim(),
      occupation: String(fatherOccupation || "").trim(),
      email: String(fatherEmail || "").trim(),
      annualIncome: fatherIncome ? parseFloat(fatherIncome) : undefined,
    };
  }

  const mothersName = getFieldValue(row, "MothersName") || getFieldValue(row, "ParentName");
  const motherOccupation = getFieldValue(row, "MotherOccupation");
  const motherEmail = getFieldValue(row, "MotherEmail");
  const motherIncome = getFieldValue(row, "MotherIncome");

  if (mothersName || motherOccupation || motherEmail || motherIncome) {
    cleanedData.mother = {
      name: String(mothersName || "").trim(),
      occupation: String(motherOccupation || "").trim(),
      email: String(motherEmail || "").trim(),
      annualIncome: motherIncome ? parseFloat(motherIncome) : undefined,
    };
  }

  const guardianName = getFieldValue(row, "GuardianName");
  const guardianRelation = getFieldValue(row, "GuardianRelation");
  const guardianEmail = getFieldValue(row, "GuardianEmail");

  if (guardianName || guardianRelation || guardianEmail) {
    cleanedData.guardian = {
      name: String(guardianName || "").trim(),
      relation: String(guardianRelation || "").trim(),
      email: String(guardianEmail || "").trim(),
    };
  }

  // Academic Information
  if (row.RegistrationNumber) cleanedData.registrationNumber = String(row.RegistrationNumber).trim();
  if (row.AdmissionNumber) cleanedData.admissionNumber = String(row.AdmissionNumber).trim();
  if (row.Section) cleanedData.section = String(row.Section).trim();
  if (row.PreviousSchool) cleanedData.previousSchool = String(row.PreviousSchool).trim();
  if (row.TransferCertificateNumber)
    cleanedData.transferCertificateNumber = String(row.TransferCertificateNumber).trim();
  if (row.SpecialNeeds) cleanedData.specialNeeds = String(row.SpecialNeeds).trim();

  // Fees & Finance
  if (row.FeeStructure) cleanedData.feeStructure = String(row.FeeStructure).trim();
  if (row.FeeDiscount) cleanedData.feeDiscount = parseFloat(row.FeeDiscount);
  if (row.PaymentStatus) cleanedData.paymentStatus = String(row.PaymentStatus).trim();
  if (row.LateFees) cleanedData.lateFees = parseFloat(row.LateFees);

  // Physical & Health Metrics
  if (
    row.Height ||
    row.Weight ||
    row.VisionTestLeftEye ||
    row.VisionTestRightEye ||
    row.HearingTestLeftEar ||
    row.HearingTestRightEar ||
    row.FitnessScore
  ) {
    cleanedData.physicalMetrics = {
      height: row.Height ? parseFloat(row.Height) : undefined,
      weight: row.Weight ? parseFloat(row.Weight) : undefined,
      visionTest:
        row.VisionTestLeftEye || row.VisionTestRightEye
          ? {
              leftEye: String(row.VisionTestLeftEye || "").trim(),
              rightEye: String(row.VisionTestRightEye || "").trim(),
              date: row.VisionTestDate ? cleanDate(row.VisionTestDate) : undefined,
            }
          : undefined,
      hearingTest:
        row.HearingTestLeftEar || row.HearingTestRightEar
          ? {
              leftEar: String(row.HearingTestLeftEar || "").trim(),
              rightEar: String(row.HearingTestRightEar || "").trim(),
              date: row.HearingTestDate ? cleanDate(row.HearingTestDate) : undefined,
            }
          : undefined,
      fitnessScore: row.FitnessScore ? parseFloat(row.FitnessScore) : undefined,
    };
  }

  // Medical Information
  if (row.Allergies || row.MedicalConditions || row.Medications || row.EmergencyInstructions || row.VaccinationStatus) {
    cleanedData.medicalHistory = {
      allergies: row.Allergies
        ? String(row.Allergies)
            .split(",")
            .map((a) => a.trim())
        : [],
      medicalConditions: row.MedicalConditions
        ? String(row.MedicalConditions)
            .split(",")
            .map((c) => c.trim())
        : [],
      medications: row.Medications
        ? String(row.Medications)
            .split(",")
            .map((m) => m.trim())
        : [],
      emergencyInstructions: String(row.EmergencyInstructions || "").trim(),
      vaccinationStatus: String(row.VaccinationStatus || "complete").trim(),
    };
  }

  // Emergency Contact
  if (
    row.EmergencyContactName ||
    row.EmergencyContactRelation ||
    row.EmergencyContactPhone ||
    row.EmergencyContactEmail
  ) {
    cleanedData.emergencyContact = {
      name: String(row.EmergencyContactName || "").trim(),
      relation: String(row.EmergencyContactRelation || "").trim(),
      phone: String(row.EmergencyContactPhone || "").trim(),
      email: String(row.EmergencyContactEmail || "").trim(),
    };
  }

  // System & Access Information
  if (row.RFIDCardNumber) cleanedData.rfidCardNumber = String(row.RFIDCardNumber).trim();
  if (row.LibraryCardNumber) cleanedData.libraryCardNumber = String(row.LibraryCardNumber).trim();
  if (row.HostelRoomNumber || row.HostelWardenName || row.HostelWardenPhone) {
    cleanedData.hostelInformation = {
      roomNumber: String(row.HostelRoomNumber || "").trim(),
      wardenName: String(row.HostelWardenName || "").trim(),
      wardenPhone: String(row.HostelWardenPhone || "").trim(),
    };
  }

  // Transport Details
  if (row.TransportRequired || row.PickupPoint || row.DropPoint || row.BusNumber || row.DriverName || row.DriverPhone) {
    cleanedData.transportDetails = {
      required: row.TransportRequired === "true" || row.TransportRequired === true,
      pickupPoint: String(row.PickupPoint || "").trim(),
      dropPoint: String(row.DropPoint || "").trim(),
      busNumber: String(row.BusNumber || "").trim(),
      driverName: String(row.DriverName || "").trim(),
      driverPhone: String(row.DriverPhone || "").trim(),
    };
  }

  // Documents
  if (
    row.BirthCertificate ||
    row.TransferCertificate ||
    row.CharacterCertificate ||
    row.MedicalCertificate ||
    row.AadharCard ||
    row.CasteCertificate ||
    row.IncomeCertificate ||
    row.Passport
  ) {
    cleanedData.documents = {
      birthCertificate: String(row.BirthCertificate || "").trim(),
      transferCertificate: String(row.TransferCertificate || "").trim(),
      characterCertificate: String(row.CharacterCertificate || "").trim(),
      medicalCertificate: String(row.MedicalCertificate || "").trim(),
      photograph: String(row.Photo || "").trim(),
      aadharCard: String(row.AadharCard || "").trim(),
      casteCertificate: String(row.CasteCertificate || "").trim(),
      incomeCertificate: String(row.IncomeCertificate || "").trim(),
      passport: String(row.Passport || "").trim(),
    };
  }

  // Legacy fields for backward compatibility
  cleanedData.mothersName = String(row.MothersName || row.ParentName || "").trim();
  cleanedData.parentsMobileNumber = String(row.ParentsMobileNumber || row.ParentPhone || "").trim();
  cleanedData.address = {
    street: String(row.CurrentAddress || row.Address || "").trim(),
    city: String(row.City || "").trim(),
    state: String(row.State || "").trim(),
    zipCode: String(row.ZipCode || "").trim(),
    country: String(row.Country || "India").trim(),
  };

  return {
    isValid: errors.length === 0,
    errors,
    cleanedData,
  };
}

module.exports = {
  validateAndCleanStudentData,
  cleanCategory,
  cleanMobileNumber,
  cleanDate,
  generateUniqueEmail,
};

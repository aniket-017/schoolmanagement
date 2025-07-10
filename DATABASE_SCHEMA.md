# Comprehensive Database Schema for School Management System

## Overview

This document outlines the complete database schema design for the school management system, covering all aspects from academic management to administrative operations.

## Core Models

### 1. Users (Enhanced)

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['admin', 'principal', 'teacher', 'student', 'cleaner', 'bus_driver', 'accountant']),

  // Contact Information
  phone: String,
  alternatePhone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },

  // Identification
  employeeId: String (unique, sparse),
  studentId: String (unique, sparse),


  // Personal Information
  dateOfBirth: Date,
  bloodGroup: String,
  gender: String (enum: ['male', 'female', 'other']),
  religion: String,
  nationality: String,
  profilePicture: String,

  // Academic/Professional Information
  class: ObjectId (ref: 'Class'),
  subjects: [ObjectId] (ref: 'Subject'),
  qualification: String,
  experience: Number,
  joiningDate: Date,

  // Family Information (for students)
  father: {
    name: String,
    occupation: String,
    phone: String,
    email: String
  },
  mother: {
    name: String,
    occupation: String,
    phone: String,
    email: String
  },
  guardian: {
    name: String,
    relation: String,
    phone: String,
    email: String
  },

  // Employment Information
  salary: Number,
  bankDetails: {
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    accountHolderName: String
  },

  // System Information
  isActive: Boolean (default: true),
  status: String (enum: ['pending', 'approved', 'rejected', 'suspended']),
  approvedBy: ObjectId (ref: 'User'),
  approvedAt: Date,
  emergencyContact: String,

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Classes (Enhanced)

```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  grade: String (required),
  section: String (required),
  classTeacher: ObjectId (ref: 'User', required),

  // Academic Information
  subjects: [{
    subject: ObjectId (ref: 'Subject'),
    teacher: ObjectId (ref: 'User'),
    hoursPerWeek: Number
  }],

  students: [ObjectId] (ref: 'User'),
  maxStudents: Number (default: 50),
  currentStrength: Number,

  // Infrastructure
  classroom: String,
  building: String,
  floor: String,

  // Academic Calendar
  academicYear: String (required),
  semester: String,

  // Schedule
  schedule: [{
    day: String (enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
    periods: [{
      subject: ObjectId (ref: 'Subject'),
      teacher: ObjectId (ref: 'User'),
      startTime: String,
      endTime: String,
      room: String,
      periodNumber: Number
    }]
  }],

  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Subjects

```javascript
{
  _id: ObjectId,
  name: String (required),
  code: String (required, unique),
  description: String,

  credits: Number,

  // Curriculum
  syllabus: String,
  textbooks: [String],
  references: [String],

  // Assessment
  totalMarks: Number,
  passingMarks: Number,
  assessmentPattern: {
    theory: Number,
    practical: Number,
    internal: Number,
    external: Number
  },

  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Attendance

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  classId: ObjectId (ref: 'Class'),
  date: Date (required),

  // Attendance Details
  status: String (enum: ['present', 'absent', 'late', 'half_day', 'holiday', 'leave']),
  timeIn: String,
  timeOut: String,
  totalHours: Number,

  // For Students
  periodWiseAttendance: [{
    period: Number,
    subject: ObjectId (ref: 'Subject'),
    status: String (enum: ['present', 'absent', 'late'])
  }],

  // Tracking
  markedBy: ObjectId (ref: 'User'),
  markedAt: Date,
  attendanceType: String (enum: ['daily', 'period_wise']),

  // Additional Information
  remarks: String,
  leaveType: String (enum: ['sick', 'casual', 'emergency', 'authorized']),
  leaveReason: String,

  createdAt: Date,
  updatedAt: Date
}
```

### 5. Timetable

```javascript
{
  _id: ObjectId,
  classId: ObjectId (ref: 'Class', required),
  day: String (enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),

  periods: [{
    periodNumber: Number,
    subject: ObjectId (ref: 'Subject'),
    teacher: ObjectId (ref: 'User'),
    startTime: String,
    endTime: String,
    room: String,
    type: String (enum: ['theory', 'practical', 'lab', 'sports', 'library'])
  }],

  academicYear: String,
  semester: String,
  effectiveFrom: Date,
  effectiveTo: Date,

  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Examinations

```javascript
{
  _id: ObjectId,
  name: String (required),
  type: String (enum: ['unit_test', 'midterm', 'final', 'practical', 'project', 'assignment']),

  // Academic Information
  classId: ObjectId (ref: 'Class'),
  subjectId: ObjectId (ref: 'Subject'),
  academicYear: String,
  semester: String,

  // Scheduling
  examDate: Date,
  startTime: String,
  endTime: String,
  duration: Number, // in minutes
  venue: String,

  // Marks
  totalMarks: Number,
  passingMarks: Number,

  // Instructions
  instructions: String,
  syllabus: String,
  allowedMaterials: [String],

  // Status
  status: String (enum: ['scheduled', 'ongoing', 'completed', 'cancelled']),

  // Supervision
  invigilators: [ObjectId] (ref: 'User'),

  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Grades

```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: 'User', required),
  examId: ObjectId (ref: 'Examination', required),
  subjectId: ObjectId (ref: 'Subject', required),

  // Marks
  marksObtained: Number,
  totalMarks: Number,
  percentage: Number,
  grade: String (enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']),

  // Detailed Assessment
  theoryMarks: Number,
  practicalMarks: Number,
  internalMarks: Number,

  // Feedback
  remarks: String,
  improvements: String,

  // Grading Information
  gradedBy: ObjectId (ref: 'User'),
  gradedAt: Date,

  // Status
  status: String (enum: ['draft', 'published', 'revised']),

  createdAt: Date,
  updatedAt: Date
}
```

### 8. Fees Management

```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: 'User', required),

  // Fee Details
  feeType: String (enum: ['tuition', 'library', 'sports', 'transport', 'examination', 'miscellaneous']),
  amount: Number (required),
  dueDate: Date,

  // Payment Information
  status: String (enum: ['pending', 'paid', 'overdue', 'partial', 'cancelled']),
  paidAmount: Number,
  paidDate: Date,
  paymentMethod: String (enum: ['cash', 'online', 'cheque', 'card']),
  transactionId: String,
  receiptNumber: String,

  // Academic Period
  academicYear: String,
  semester: String,
  month: String,

  // Additional Information
  discount: Number,
  penalty: Number,
  remarks: String,

  // Processing
  processedBy: ObjectId (ref: 'User'),

  createdAt: Date,
  updatedAt: Date
}
```

### 9. Assignments

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,

  // Academic Information
  subjectId: ObjectId (ref: 'Subject', required),
  classId: ObjectId (ref: 'Class', required),
  teacherId: ObjectId (ref: 'User', required),

  // Dates
  assignedDate: Date,
  dueDate: Date,

  // Content
  instructions: String,
  attachments: [String],
  resources: [String],

  // Assessment
  totalMarks: Number,
  weightage: Number, // percentage of total subject marks

  // Submission Settings
  allowLateSubmission: Boolean,
  latePenalty: Number,
  submissionFormat: String (enum: ['file', 'text', 'both']),

  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 10. Assignment Submissions

```javascript
{
  _id: ObjectId,
  assignmentId: ObjectId (ref: 'Assignment', required),
  studentId: ObjectId (ref: 'User', required),

  // Submission Content
  submission: String,
  attachments: [String],

  // Submission Details
  submittedAt: Date,
  isLate: Boolean,

  // Grading
  marksObtained: Number,
  feedback: String,
  gradedBy: ObjectId (ref: 'User'),
  gradedAt: Date,

  // Status
  status: String (enum: ['submitted', 'graded', 'returned', 'resubmitted']),

  createdAt: Date,
  updatedAt: Date
}
```

### 11. Syllabus Tracking

```javascript
{
  _id: ObjectId,
  subjectId: ObjectId (ref: 'Subject', required),
  classId: ObjectId (ref: 'Class', required),
  teacherId: ObjectId (ref: 'User', required),

  // Content
  topic: String (required),
  chapter: String,
  unit: String,

  // Planning
  plannedDate: Date,
  estimatedHours: Number,

  // Completion
  completedDate: Date,
  actualHours: Number,
  completionPercentage: Number,

  // Status
  status: String (enum: ['planned', 'in_progress', 'completed', 'delayed', 'cancelled']),

  // Teaching Methods
  teachingMethod: String (enum: ['lecture', 'practical', 'demonstration', 'project', 'discussion']),
  resources: [String],

  // Assessment
  assessmentConducted: Boolean,
  studentFeedback: String,

  // Notes
  remarks: String,
  challenges: String,

  academicYear: String,
  semester: String,

  createdAt: Date,
  updatedAt: Date
}
```

### 12. Communications

```javascript
{
  _id: ObjectId,
  senderId: ObjectId (ref: 'User', required),
  receiverId: ObjectId (ref: 'User', required),

  // Message Details
  messageType: String (enum: ['direct', 'announcement', 'complaint', 'inquiry', 'notification']),
  subject: String,
  message: String (required),
  attachments: [String],

  // Threading
  threadId: String,
  parentMessageId: ObjectId (ref: 'Communication'),

  // Status
  isRead: Boolean (default: false),
  readAt: Date,

  // Priority
  priority: String (enum: ['low', 'medium', 'high', 'urgent']),

  // Delivery
  sentAt: Date,
  deliveredAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

### 13. Staff Salary

```javascript
{
  _id: ObjectId,
  employeeId: ObjectId (ref: 'User', required),

  // Salary Period
  month: String,
  year: String,

  // Salary Components
  basicSalary: Number,
  allowances: {
    da: Number, // Dearness Allowance
    hra: Number, // House Rent Allowance
    ta: Number, // Travel Allowance
    medical: Number,
    performance: Number,
    other: Number
  },

  // Deductions
  deductions: {
    tax: Number,
    pf: Number, // Provident Fund
    esi: Number, // Employee State Insurance
    loan: Number,
    advance: Number,
    other: Number
  },

  // Calculated Values
  grossSalary: Number,
  totalDeductions: Number,
  netSalary: Number,

  // Working Days
  workingDays: Number,
  presentDays: Number,
  leaves: Number,

  // Payment Status
  status: String (enum: ['pending', 'paid', 'hold', 'cancelled']),
  paidDate: Date,
  paymentMethod: String (enum: ['bank_transfer', 'cash', 'cheque']),

  // Processing
  processedBy: ObjectId (ref: 'User'),
  remarks: String,

  createdAt: Date,
  updatedAt: Date
}
```

### 14. Announcements

```javascript
{
  _id: ObjectId,
  title: String (required),
  content: String (required),

  // Publishing
  createdBy: ObjectId (ref: 'User', required),
  publishDate: Date,
  expiryDate: Date,

  // Targeting
  targetAudience: String (enum: ['all', 'students', 'teachers', 'staff']),
  targetClasses: [ObjectId] (ref: 'Class'),
  targetRoles: [String],

  // Content
  attachments: [String],
  images: [String],

  // Priority
  priority: String (enum: ['low', 'medium', 'high', 'urgent']),

  // Status
  status: String (enum: ['draft', 'published', 'expired', 'archived']),
  isActive: Boolean (default: true),

  // Engagement
  views: Number (default: 0),
  likes: Number (default: 0),

  createdAt: Date,
  updatedAt: Date
}
```

### 15. Library Management

```javascript
{
  _id: ObjectId,
  bookId: String (required, unique),
  title: String (required),
  author: String,
  isbn: String,

  // Publication
  publisher: String,
  publicationYear: Number,
  edition: String,

  // Classification
  category: String (enum: ['fiction', 'non-fiction', 'reference', 'textbook', 'journal']),
  subject: String,
  language: String,

  // Physical Details
  totalCopies: Number,
  availableCopies: Number,
  location: String,
  shelfNumber: String,

  // Pricing
  price: Number,
  purchaseDate: Date,
  vendor: String,

  // Status
  condition: String (enum: ['new', 'good', 'fair', 'poor', 'damaged']),
  isActive: Boolean (default: true),

  createdAt: Date,
  updatedAt: Date
}
```

### 16. Library Transactions

```javascript
{
  _id: ObjectId,
  bookId: ObjectId (ref: 'Library', required),
  userId: ObjectId (ref: 'User', required),

  // Transaction Details
  transactionType: String (enum: ['issue', 'return', 'renew', 'reserve']),

  // Dates
  issueDate: Date,
  returnDate: Date,
  actualReturnDate: Date,

  // Status
  status: String (enum: ['issued', 'returned', 'overdue', 'lost', 'damaged']),

  // Fines
  fineAmount: Number,
  fineStatus: String (enum: ['pending', 'paid', 'waived']),

  // Processing
  issuedBy: ObjectId (ref: 'User'),
  returnedBy: ObjectId (ref: 'User'),

  remarks: String,

  createdAt: Date,
  updatedAt: Date
}
```

### 17. Transport Management

```javascript
{
  _id: ObjectId,
  routeNumber: String (required, unique),
  routeName: String (required),

  // Staff Assignment
  driverId: ObjectId (ref: 'User', required),
  conductorId: ObjectId (ref: 'User'),

  // Vehicle Details
  vehicleNumber: String,
  vehicleType: String (enum: ['bus', 'van', 'mini_bus']),
  capacity: Number,

  // Route Information
  stops: [{
    stopName: String,
    stopCode: String,
    pickupTime: String,
    dropTime: String,
    fare: Number,
    order: Number
  }],

  // Timing
  startTime: String,
  endTime: String,

  // Status
  isActive: Boolean (default: true),

  createdAt: Date,
  updatedAt: Date
}
```

### 18. Student Transport

```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: 'User', required),
  routeId: ObjectId (ref: 'Transport', required),

  // Stop Details
  stopName: String,
  pickupTime: String,
  dropTime: String,

  // Fare
  monthlyFare: Number,

  // Status
  isActive: Boolean (default: true),

  // Emergency Contact
  emergencyContact: String,

  createdAt: Date,
  updatedAt: Date
}
```

## Database Relationships

### Primary Relationships:

1. **User → Class**: Many-to-One (Students belong to one class)
2. **User → Subject**: Many-to-Many (Teachers can teach multiple subjects)
3. **Class → Subject**: Many-to-Many (Classes have multiple subjects)
4. **User → Attendance**: One-to-Many (User has multiple attendance records)
5. **User → Fees**: One-to-Many (Student has multiple fee records)
6. **Assignment → Assignment_Submission**: One-to-Many
7. **User → Communication**: Many-to-Many (Users can send/receive messages)
8. **User → Salary**: One-to-Many (Employee has multiple salary records)

### Indexes for Performance:

```javascript
// Users
{ email: 1 }
{ role: 1 }
{ studentId: 1 }
{ employeeId: 1 }
{ status: 1 }

// Attendance
{ userId: 1, date: 1 }
{ classId: 1, date: 1 }
{ date: 1 }

// Fees
{ studentId: 1, status: 1 }
{ dueDate: 1 }
{ academicYear: 1 }

// Grades
{ studentId: 1, examId: 1 }
{ examId: 1 }

// Communications
{ senderId: 1, receiverId: 1 }
{ threadId: 1 }
{ isRead: 1 }
```

## Data Validation Rules

### User Validation:

- Email must be unique and valid format
- Password minimum 8 characters
- Role-based field validation
- Phone number format validation

### Academic Validation:

- Attendance date cannot be future
- Marks cannot exceed total marks
- Fee amount must be positive
- Due dates must be reasonable

### Business Rules:

- Student can only belong to one class
- Teacher can teach multiple subjects
- Class teacher must be a teacher role
- Salary month/year combination must be unique per employee

## Security Considerations

1. **Password Hashing**: All passwords stored using bcrypt
2. **Role-based Access**: Different access levels for different user roles
3. **Data Encryption**: Sensitive data (salary, bank details) should be encrypted
4. **Audit Trail**: Track all modifications with timestamps and user info
5. **Soft Deletes**: Use isActive flag instead of hard deletes

## API Endpoints Structure

### Core Endpoints:

- `/api/users` - User management
- `/api/classes` - Class management
- `/api/subjects` - Subject management
- `/api/attendance` - Attendance tracking
- `/api/fees` - Fee management
- `/api/examinations` - Exam management
- `/api/grades` - Grade management
- `/api/assignments` - Assignment management
- `/api/communications` - Messaging system
- `/api/salary` - Salary management
- `/api/library` - Library management
- `/api/transport` - Transport management
- `/api/announcements` - Announcement system
- `/api/reports` - Reporting and analytics

This comprehensive schema provides a solid foundation for your complete school management system, covering all the requirements you mentioned including attendance tracking, fee management, communication systems, staff management, and administrative oversight.

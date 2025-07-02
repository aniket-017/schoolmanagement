# School Management System - Backend API

Node.js + Express + MongoDB backend API for the School Management System.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update environment variables in `.env`:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/school_management
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

4. Start MongoDB service (if running locally)

5. Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
backend/
├── config/
│   └── database.js       # MongoDB connection
├── controllers/
│   └── authController.js # Authentication logic
├── middleware/
│   └── auth.js          # JWT authentication & authorization
├── models/
│   ├── User.js          # User model (admin, teacher, student, parent)
│   └── Class.js         # Class model
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── users.js         # User management routes
│   ├── classes.js       # Class management routes
│   ├── assignments.js   # Assignment routes
│   ├── attendance.js    # Attendance routes
│   └── fees.js          # Fee management routes
├── utils/               # Utility functions
├── server.js           # Main server file
└── package.json        # Dependencies and scripts
```

## 🔐 Authentication & Authorization

### User Roles

- **Admin**: Full system access
- **Teacher**: Manage classes, assignments, grades, attendance
- **Student**: View own data, assignments, grades
- **Parent**: View child's data

### JWT Token

- All protected routes require `Authorization: Bearer <token>` header
- Tokens expire in 7 days (configurable)
- Role-based access control implemented

## 📡 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register user (Admin only)
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Users (Admin only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Classes

- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class (Admin)
- `GET /api/classes/:id` - Get class details

### Assignments

- `GET /api/assignments` - Get assignments
- `POST /api/assignments` - Create assignment (Teacher/Admin)

### Attendance

- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance (Teacher/Admin)

### Fees

- `GET /api/fees` - Get fee records
- `POST /api/fees` - Create fee record (Admin)

### System

- `GET /api/health` - Health check endpoint

## 🗄️ Database Models

### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['admin', 'teacher', 'student', 'parent'],
  phone: String,
  address: Object,
  employeeId: String (teachers),
  studentId: String (students),
  children: [ObjectId] (parents),
  class: ObjectId,
  subjects: [ObjectId],
  department: String,
  dateOfBirth: Date,
  joiningDate: Date,
  isActive: Boolean
}
```

### Class Model

```javascript
{
  name: String,
  grade: String,
  section: String,
  classTeacher: ObjectId,
  subjects: [Object],
  students: [ObjectId],
  maxStudents: Number,
  academicYear: String,
  schedule: [Object],
  isActive: Boolean
}
```

## 🛠️ Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm test`: Run tests (to be implemented)

## 🔧 Environment Variables

| Variable      | Description               | Default                                     |
| ------------- | ------------------------- | ------------------------------------------- |
| `NODE_ENV`    | Environment               | development                                 |
| `PORT`        | Server port               | 3000                                        |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/school_management |
| `JWT_SECRET`  | JWT signing secret        | required                                    |
| `JWT_EXPIRE`  | JWT expiration time       | 7d                                          |
| `CLIENT_URL`  | Frontend URL for CORS     | http://localhost:5173                       |

## 🚨 Error Handling

The API includes comprehensive error handling:

- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

All errors return a consistent JSON format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT authentication
- Role-based authorization
- Input validation
- CORS configuration
- Rate limiting (to be implemented)
- Request sanitization (to be implemented)

## 📝 Development Notes

- Most routes are placeholder implementations
- Authentication system is fully functional
- User and Class models are implemented
- Additional models need to be created for:
  - Subjects
  - Assignments
  - Attendance
  - Fees
  - Announcements

## 🚀 Deployment

1. Set `NODE_ENV=production`
2. Update `MONGODB_URI` for production database
3. Generate strong `JWT_SECRET`
4. Configure production CORS settings
5. Use PM2 or similar for process management

## 📚 API Documentation

For detailed API documentation, consider integrating:

- Swagger/OpenAPI
- Postman collections
- API documentation generator

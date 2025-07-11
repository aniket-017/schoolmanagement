# Student Management API Documentation

## Base URL
```
http://localhost:1704/api
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get All Students in a Class
**GET** `/classes/{classId}/students`

**Description**: Retrieve all students enrolled in a specific class.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parameters**:
- `classId` (path parameter): The ID of the class

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john.doe@school.com",
      "phone": "+1234567890",
      "studentId": "STU1704123456789",
      "dateOfBirth": "2010-05-15T00:00:00.000Z",
      "father": {
        "name": "Mike Doe",
        "phone": "+1234567891"
      },
      "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "state": "State",
        "zipCode": "12345",
        "country": "Country"
      },
      "isActive": true,
      "status": "approved"
    }
  ]
}
```

---

### 2. Add Individual Student to Class
**POST** `/classes/{classId}/students`

**Description**: Add a single student to a specific class.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parameters**:
- `classId` (path parameter): The ID of the class

**Request Body**:
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@school.com",
  "phone": "+1234567892",
  "rollNumber": "STU001",
  "dateOfBirth": "2010-08-20",
  "parentName": "John Smith",
  "parentPhone": "+1234567893",
  "address": "456 Oak Avenue, Anytown, State 12345, Country"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Student added successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "name": "Jane Smith",
    "email": "jane.smith@school.com",
    "studentId": "STU1704123456790",
    "tempPassword": "abc123xy"
  }
}
```

---

### 3. Bulk Upload Students to Class
**POST** `/classes/{classId}/students/bulk`

**Description**: Upload multiple students to a class using an Excel file.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Parameters**:
- `classId` (path parameter): The ID of the class
- `file` (form data): Excel file (.xlsx or .xls)

**Excel Template Format**:
| Name | Email | Phone | DateOfBirth | ParentName | ParentPhone | Address | City | State | ZipCode | Country | RollNumber |
|------|-------|-------|-------------|------------|-------------|---------|------|-------|---------|---------|------------|
| John Doe | john.doe@school.com | +1234567890 | 2010-05-15 | Mike Doe | +1234567891 | 123 Main St | Anytown | State | 12345 | Country | STU001 |

**Response**:
```json
{
  "success": true,
  "message": "Successfully uploaded 3 students",
  "uploadedCount": 3,
  "results": {
    "successful": [
      {
        "row": 2,
        "student": {
          "name": "John Doe",
          "email": "john.doe@school.com",
          "studentId": "STU1704123456789",
          "tempPassword": "abc123xy"
        }
      }
    ],
    "failed": [],
    "duplicates": []
  }
}
```

---

### 4. Remove Student from Class
**DELETE** `/classes/{classId}/students/{studentId}`

**Description**: Remove a student from a specific class.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parameters**:
- `classId` (path parameter): The ID of the class
- `studentId` (path parameter): The ID of the student to remove

**Response**:
```json
{
  "success": true,
  "message": "Student removed from class successfully"
}
```

---

### 5. Download Excel Template
**GET** `/classes/{classId}/students/excel-template`

**Description**: Download an Excel template for bulk student upload.

**Headers**:
```
Authorization: Bearer <token>
```

**Parameters**:
- `classId` (path parameter): The ID of the class

**Response**: Excel file download

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Class is at maximum capacity"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Class not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error adding student",
  "error": "Detailed error message"
}
```

---

## Postman Collection Setup

### 1. Environment Variables
Create a new environment in Postman with these variables:
- `base_url`: `http://localhost:1704/api`
- `token`: Your JWT authentication token
- `class_id`: A valid class ID for testing

### 2. Pre-request Scripts
For endpoints requiring authentication, add this pre-request script:
```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('token')
});
```

### 3. Test Scripts
Add this test script to automatically extract the token from login response:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.token) {
        pm.environment.set('token', response.token);
    }
}
```

---

## Testing Flow

1. **Login as Admin**: First authenticate to get a JWT token
2. **Get Class ID**: Use the classes endpoint to get a valid class ID
3. **Test Individual Student Creation**: Add a single student
4. **Test Bulk Upload**: Download template, fill it, and upload
5. **Test Student Listing**: Retrieve all students in the class
6. **Test Student Removal**: Remove a student from the class

---

## Notes

- All student creation endpoints require admin privileges
- Students are automatically assigned a unique student ID
- Temporary passwords are generated for new students
- Students are automatically approved when created by admin
- Class capacity is checked before adding students
- Duplicate email addresses are not allowed
- Excel files must follow the exact column format specified 
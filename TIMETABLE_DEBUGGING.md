# Timetable Saving Issue - Debugging Guide

## Issue Description

The timetable is not saving when clicking the "Save Timetable" button in the frontend.

## Debugging Steps

### 1. Frontend Debugging

- Open browser developer tools (F12)
- Go to Console tab
- Try to save a timetable
- Look for console logs:
  - "Saving timetable with data: ..."
  - "Save response status: ..."
  - "Save response data: ..."

### 2. Backend Debugging

- Check backend console/logs
- Look for these log messages:
  - "=== TIMETABLE SAVE REQUEST START ==="
  - "Received timetable save request: ..."
  - "Checking conflicts for [day]: ..."
  - "Deleting existing timetables for class: ..."
  - "Creating timetable for [day]: ..."
  - "Successfully created/updated timetable. Total created: ..."
  - "=== TIMETABLE SAVE REQUEST END ==="

### 3. Network Debugging

- Open browser developer tools
- Go to Network tab
- Try to save a timetable
- Look for the POST request to `/timetables/class/{classId}`
- Check:
  - Request URL
  - Request method (should be POST)
  - Request headers (should include Authorization)
  - Request payload
  - Response status
  - Response body

### 4. Common Issues to Check

#### Authentication Issues

- Check if user is logged in
- Check if token is valid
- Check if token is included in request headers

#### CORS Issues

- Check if backend allows requests from frontend origin
- Look for CORS errors in browser console

#### Data Validation Issues

- Check if all required fields are present
- Check if data format is correct
- Check if classId is valid

#### Database Issues

- Check if database is connected
- Check if models are properly defined
- Check if indexes are created

### 5. Test Cases

#### Test 1: Simple Save

1. Add one period to Monday
2. Click Save
3. Check if it saves successfully

#### Test 2: Multiple Periods

1. Add multiple periods across different days
2. Click Save
3. Check if all periods save

#### Test 3: Conflict Detection

1. Try to schedule same teacher at same time in different classes
2. Check if conflict is detected

### 6. Expected Behavior

#### Frontend

- Save button should show "Saving..." while processing
- Success toast should appear on successful save
- Timetable should refresh with populated data
- Error toast should appear on failure

#### Backend

- Should receive POST request with timetable data
- Should validate input data
- Should check for conflicts
- Should delete existing timetables
- Should create new timetables
- Should return success response

### 7. Troubleshooting Commands

#### Check Backend Logs

```bash
# If using npm
npm run dev

# If using nodemon
nodemon server.js

# Check logs for timetable-related messages
```

#### Check Database

```bash
# Connect to MongoDB
mongosh

# Check timetable collection
use school_management
db.timetables.find().pretty()
```

#### Test API Endpoint

```bash
# Test with curl
curl -X POST http://localhost:1704/api/timetables/class/{classId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "weeklyTimetable": {
      "Monday": [{
        "periodNumber": 1,
        "subject": "subjectId",
        "teacher": "teacherId",
        "startTime": "08:00",
        "endTime": "08:45",
        "room": "101",
        "type": "theory"
      }]
    },
    "academicYear": "2024",
    "semester": "1"
  }'
```

### 8. Files to Check

#### Frontend

- `frontend/src/components/TimetableTab.jsx` - Save function
- `frontend/src/config/environment.js` - API configuration

#### Backend

- `backend/controllers/timetableController.js` - Save logic
- `backend/routes/timetables.js` - Route definition
- `backend/models/Timetable.js` - Model definition

### 9. Next Steps

1. Run the debugging steps above
2. Check console logs in both frontend and backend
3. Identify where the process is failing
4. Fix the specific issue
5. Test the fix

### 10. Common Solutions

#### If request doesn't reach backend:

- Check API URL configuration
- Check CORS settings
- Check authentication

#### If request reaches backend but fails:

- Check data validation
- Check database connection
- Check model validation

#### If save succeeds but data doesn't appear:

- Check data refresh logic
- Check data population
- Check frontend state management

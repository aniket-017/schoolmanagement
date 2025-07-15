# Mobile App Timetable Testing Guide

## Overview
The mobile app now supports dynamic timetable display with the following features:

1. **Today's Schedule** - Shows today's classes on the student dashboard
2. **Full Timetable** - Complete weekly timetable view with day selection
3. **Dynamic Data** - Fetches real timetable data from the backend API

## Features Implemented

### Student Dashboard
- **Today's Schedule Section**: Displays today's classes with period details
- **Quick View**: Shows first 4 periods with "View Full" button
- **Period Details**: Subject, teacher, room, and period type
- **Empty State**: Shows appropriate message when no classes scheduled

### Timetable Screen
- **Day Selector**: Horizontal scrollable day tabs (Mon-Sat)
- **Period Cards**: Detailed view of each period
- **Period Information**: Time, subject, teacher, room, type
- **Empty States**: Different messages for no timetable vs no classes
- **Pull to Refresh**: Refresh timetable data

## Testing Steps

### 1. Backend Setup
Ensure the backend is running and has:
- Timetable data created for a class
- Students assigned to classes
- Teachers assigned to subjects

### 2. Mobile App Testing

#### Dashboard Testing
1. Login as a student
2. Check if "Today's Schedule" section appears
3. Verify period details are displayed correctly
4. Test "View Full" button navigation

#### Timetable Screen Testing
1. Navigate to Timetable tab
2. Check day selector functionality
3. Verify period cards display correctly
4. Test pull-to-refresh
5. Check empty states

### 3. Debug Information
The app includes console logs for debugging:
- `console.log("Timetable data received:", timetableData)`
- `console.log("Today's schedule data:", {...})`
- `console.log("Timetable response:", response)`

### 4. Common Issues

#### No Timetable Data
- Check if student has `class_id` assigned
- Verify backend has timetable data for the class
- Check API endpoint `/timetables/class/:classId`

#### "Unknown Subject/Teacher"
- Ensure subjects and teachers are properly populated
- Check backend population in `getClassTimetable` method

#### API Errors
- Verify backend is running on correct port
- Check network connectivity
- Review API response structure

## API Endpoints Used

- `GET /api/timetables/class/:classId` - Get class timetable
- Response format: `{ success: true, data: { weeklyTimetable: {...} } }`

## Data Structure Expected

```javascript
{
  success: true,
  data: {
    classId: "...",
    academicYear: "2024",
    weeklyTimetable: {
      Monday: [
        {
          periodNumber: 1,
          startTime: "08:00",
          endTime: "09:00",
          subject: { name: "Mathematics", code: "MATH" },
          teacher: { name: "John Doe", email: "john@school.com" },
          room: "101",
          type: "theory"
        }
      ],
      // ... other days
    }
  }
}
```

## Troubleshooting

### Console Debugging
1. Open React Native debugger or Metro logs
2. Look for timetable-related console logs
3. Check for API error messages

### Network Issues
1. Verify API base URL in `config/index.js`
2. Check if backend is accessible from mobile device/emulator
3. Test API endpoint directly with Postman

### Data Issues
1. Verify student has correct `class_id`
2. Check if timetable exists for the class
3. Ensure subjects and teachers are properly linked 
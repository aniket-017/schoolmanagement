# School Management Mobile App

A comprehensive mobile application for school management built with React Native and Expo.

## Features

### Teacher Features
- **Dashboard**: Overview of classes, schedule, and notifications
- **Class Management**: View and manage assigned classes
- **Attendance Management**: Mark daily attendance for students
  - Date picker with today's date as default
  - Class and section selection
  - Student list with roll numbers and names
  - Quick attendance marking (Present ✅, Absent ❌, Leave 🟡)
  - Real-time attendance summary
  - Save attendance data to backend
- **Grade Management**: Manage student grades and assessments
- **Profile Management**: Update personal information

### Student Features
- **Dashboard**: View schedule, assignments, and grades
- **Attendance Tracking**: View personal attendance history
- **Assignment Management**: Submit and track assignments
- **Grade Viewing**: Access academic performance

### Admin Features
- **User Management**: Manage teachers, students, and staff
- **Class Management**: Create and manage classes
- **Fee Management**: Handle student fees
- **Reports**: Generate various reports

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Additional Dependencies for Attendance Management**
   ```bash
   npx expo install @react-native-community/datetimepicker @react-native-picker/picker
   ```

3. **Start the Development Server**
   ```bash
   npm start
   ```

4. **Run on Device/Simulator**
   ```bash
   # For Android
   npm run android
   
   # For iOS
   npm run ios
   ```

## Backend API

Make sure the backend server is running and accessible. The mobile app connects to the backend API for:
- User authentication
- Data synchronization
- Attendance management
- Grade management
- Assignment management

## Attendance Management

The attendance management feature includes:

### For Teachers:
- **Date Selection**: Pick any date (defaults to today)
- **Class Selection**: Choose from assigned classes
- **Student Loading**: Load all students in the selected class
- **Attendance Marking**: Mark students as Present, Absent, or Leave
- **Real-time Summary**: See counts of present, absent, leave, and unmarked students
- **Data Persistence**: Save attendance to backend database

### Features:
- ✅ Intuitive touch-friendly interface
- ✅ Color-coded attendance status (Green=Present, Red=Absent, Yellow=Leave)
- ✅ Real-time attendance summary
- ✅ Load existing attendance for previous dates
- ✅ Bulk attendance saving
- ✅ Error handling and validation

## Configuration

Update the API configuration in `config/index.js` to point to your backend server:

```javascript
export default {
  API_BASE_URL: 'http://your-backend-url:port/api',
  // ... other config
};
```

## Development

### Project Structure
```
mobile-app/
├── components/          # Reusable UI components
├── screens/            # Screen components
│   ├── teacher/        # Teacher-specific screens
│   ├── student/        # Student-specific screens
│   └── admin/          # Admin-specific screens
├── navigation/         # Navigation configuration
├── services/           # API services
├── context/            # React Context providers
├── utils/              # Utility functions and theme
└── config/             # Configuration files
```

### Key Dependencies
- React Native & Expo
- React Navigation
- Axios for API calls
- AsyncStorage for local storage
- React Native Animatable for animations
- Expo Linear Gradient for gradients
- React Native Vector Icons for icons

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

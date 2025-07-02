# School Management Mobile App

React Native mobile application for students, parents, and teachers to access school management features.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device (for testing)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Scan the QR code with Expo Go app to test on your device

## 📱 Features

### Student/Parent Features

- Dashboard with attendance, assignments, and grades overview
- Timetable view
- Assignments tracking
- Attendance records
- Grade reports

### Teacher Features

- Teacher dashboard with class statistics
- Class management
- Attendance management
- Grade management

## 🏗️ Project Structure

```
mobile-app/
├── assets/           # Images, fonts, and other static assets
├── components/       # Reusable UI components
├── context/          # React Context for state management
├── navigation/       # Navigation configuration
├── screens/          # App screens organized by role
│   ├── auth/        # Authentication screens
│   ├── student/     # Student-specific screens
│   └── teacher/     # Teacher-specific screens
├── services/         # API service functions
├── utils/           # Utility functions
├── App.js           # Main app component
└── package.json     # Dependencies and scripts
```

## 🔧 Configuration

### Backend Connection

Update the API base URL in `services/authService.js`:

```javascript
const API_BASE_URL = "http://your-backend-url:3000/api";
```

## 🎨 User Roles

- **Student**: Access personal dashboard, view timetable, assignments, grades
- **Parent**: Similar to student but for monitoring child's progress
- **Teacher**: Manage classes, take attendance, assign grades

## 🛠️ Development

### Running on Specific Platforms

- iOS: `npm run ios`
- Android: `npm run android`
- Web: `npm run web`

### Available Scripts

- `npm start`: Start development server
- `npm run android`: Run on Android device/emulator
- `npm run ios`: Run on iOS device/simulator
- `npm run web`: Run in web browser

## 📝 Notes

- This app requires a backend API to be running for authentication and data
- Default backend URL is set to `http://localhost:3000/api`
- Make sure your backend server is running before testing the app

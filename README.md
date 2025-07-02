# 🎓 School Management System

A comprehensive school management system built with modern web technologies, featuring a React Native mobile app, React web dashboard, and Node.js backend API.

## 🏗️ Project Structure

```
SchoolManagement/
├── mobile-app/          # React Native (Expo) app for students/parents/teachers
├── frontend/           # React.js admin dashboard
├── backend/            # Node.js + Express + MongoDB API
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on mobile device (for testing)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

The API will run on `http://localhost:3000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The web dashboard will run on `http://localhost:5173`

### 3. Mobile App Setup

```bash
cd mobile-app
npm install
npm start
```

Scan the QR code with Expo Go to test on your device.

## 📱 Features

### Mobile App (React Native)

- **Multi-role Support**: Students, parents, and teachers
- **Student Dashboard**: Attendance, assignments, grades overview
- **Teacher Dashboard**: Class management, grade entry
- **Authentication**: Role-based login system
- **Navigation**: Tab-based navigation for each role

### Web Dashboard (React)

- **Admin Interface**: Modern, responsive design with Tailwind CSS
- **User Management**: Create, edit, and manage users
- **Class Management**: Organize classes and subjects
- **Fee Management**: Track payments and billing
- **Announcements**: School-wide communication
- **Role-based Access**: Admin-only features

### Backend API (Node.js)

- **Authentication**: JWT-based auth with role permissions
- **User Management**: Multi-role user system
- **Database**: MongoDB with Mongoose ODM
- **Security**: Password hashing, CORS, validation
- **Error Handling**: Comprehensive error management

## 🎯 User Roles

| Role        | Mobile App | Web Dashboard | Capabilities                          |
| ----------- | ---------- | ------------- | ------------------------------------- |
| **Admin**   | ❌         | ✅            | Full system access, user management   |
| **Teacher** | ✅         | ✅            | Class management, grading, attendance |
| **Student** | ✅         | ❌            | View grades, assignments, attendance  |
| **Parent**  | ✅         | ❌            | Monitor child's progress              |

## 🛠️ Technology Stack

### Mobile App

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **State Management**: React Context API
- **Storage**: AsyncStorage
- **HTTP Client**: Axios

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **CORS**: cors middleware

## 🔧 Environment Configuration

### Backend (.env)

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/school_management
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### API URLs

- Mobile app: Update `API_BASE_URL` in `mobile-app/services/authService.js`
- Frontend: Update `API_BASE_URL` in `frontend/src/context/AuthContext.jsx`

## 📊 Database Schema

### User Model

- Multi-role user system (admin, teacher, student, parent)
- Profile information and role-specific fields
- Relationships with classes, subjects, and children

### Class Model

- Class organization with grades and sections
- Teacher assignments and student enrollment
- Schedule management

## 🔒 Authentication Flow

1. **Login**: User authenticates with email/password
2. **JWT Token**: Server returns JWT token with user info
3. **Role Check**: Frontend/mobile app checks user role
4. **Route Protection**: Access control based on user role
5. **Auto-refresh**: Token validation on app restart

## 🚀 Deployment

### Backend Deployment

- Deploy to Heroku, AWS, or Digital Ocean
- Set production environment variables
- Use MongoDB Atlas for production database

### Frontend Deployment

- Deploy to Vercel, Netlify, or AWS S3
- Update API URLs for production
- Configure environment-specific settings

### Mobile App Deployment

- Build with `expo build`
- Submit to App Store/Play Store
- Update API URLs for production

## 📱 Development Workflow

### Starting Development

1. Start MongoDB service
2. Run backend: `cd backend && npm run dev`
3. Run frontend: `cd frontend && npm run dev`
4. Run mobile app: `cd mobile-app && npm start`

### Testing

- Backend: API testing with Postman or curl
- Frontend: Browser testing at localhost:5173
- Mobile: Test with Expo Go app

## 🎨 UI/UX Features

### Mobile App

- Modern iOS/Android design patterns
- Tab navigation with role-specific screens
- Card-based layouts for data display
- Loading states and error handling

### Web Dashboard

- Responsive design with Tailwind CSS
- Sidebar navigation with active states
- Dashboard cards with statistics
- Modern form layouts and buttons

## 🔮 Future Enhancements

### Phase 2 Features

- [ ] Real-time notifications
- [ ] File upload for assignments
- [ ] Advanced reporting and analytics
- [ ] Parent-teacher communication
- [ ] Timetable management
- [ ] Library management
- [ ] Transportation tracking

### Technical Improvements

- [ ] TypeScript implementation
- [ ] Automated testing (Jest, Cypress)
- [ ] Docker containerization
- [ ] CI/CD pipelines
- [ ] Rate limiting and caching
- [ ] Email notifications
- [ ] Push notifications for mobile

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Check individual README files in each directory
- Review the API documentation
- Test the health endpoint: `GET /api/health`

## 📚 Documentation

- **Mobile App**: See `mobile-app/README.md`
- **Frontend**: See `frontend/README.md`
- **Backend**: See `backend/README.md`

---

Built with ❤️ for modern education management

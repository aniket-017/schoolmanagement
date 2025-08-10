import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TeacherAuthProvider } from "./context/TeacherAuthContext";

// Public Pages
import PublicLayout from "./components/PublicLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Admission from "./pages/Admission";
import Academic from "./pages/Academic";
import Achievements from "./pages/Achievements";
import Infrastructure from "./pages/Infrastructure";
import Gallery from "./pages/Gallery";
import MandatoryDisclosure from "./pages/MandatoryDisclosure";
import Contact from "./pages/Contact";

// Student/Teacher Portal
import StudentTeacherLogin from "./pages/StudentTeacherLogin";
import StudentDashboard from "./pages/StudentDashboard";
import StudentAttendance from "./pages/StudentAttendance";
import StudentProfile from "./pages/StudentProfile";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherProtectedRoute from "./components/TeacherProtectedRoute";

// Teacher-specific pages (to be created)
import TeacherClasses from "./pages/TeacherClasses";
import TeacherClassDetails from "./pages/TeacherClassDetails";
import TeacherAttendance from "./pages/TeacherAttendance";
import TeacherTimetable from "./pages/TeacherTimetable";
import TeacherAnnualCalendar from "./pages/TeacherAnnualCalendar";
import TeacherProfile from "./pages/TeacherProfile";

// Admin/Management Pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import TeacherManagement from "./pages/TeacherManagement";
import ClassManagement from "./pages/ClassManagement";
import ClassDetails from "./pages/ClassDetails";
import AddStudent from "./pages/AddStudent";
import FeeManagement from "./pages/FeeManagement";
import Announcements from "./pages/Announcements";
import TimetableOutlineManager from "./pages/TimetableOutlineManager";
import AnnualCalendarAdmin from "./pages/AnnualCalendarAdmin";
import AnnualCalendarView from "./pages/AnnualCalendarView";
import StudentDemo from "./pages/StudentDemo";
import ProtectedRoute from "./components/ProtectedRoute";
import ChangePassword from "./components/ChangePassword";
import TeacherAnnouncements from "./pages/TeacherAnnouncements";
import StudentTimetable from "./pages/StudentTimetable";
import StudentAnnouncements from "./pages/StudentAnnouncements";
import StudentAnnualCalendar from "./pages/StudentAnnualCalendar";
import StudentHomework from "./pages/StudentHomework";
import StudentFees from "./pages/StudentFees";
import TeacherHomework from "./pages/TeacherHomework";

function AppContent() {
  const { requirePasswordChange } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            theme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      />

      <Routes>
        {/* Public School Website Routes */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />
        <Route
          path="/about"
          element={
            <PublicLayout>
              <About />
            </PublicLayout>
          }
        />
        <Route
          path="/admission"
          element={
            <PublicLayout>
              <Admission />
            </PublicLayout>
          }
        />
        <Route
          path="/academic"
          element={
            <PublicLayout>
              <Academic />
            </PublicLayout>
          }
        />
        <Route
          path="/achievements"
          element={
            <PublicLayout>
              <Achievements />
            </PublicLayout>
          }
        />
        <Route
          path="/infrastructure"
          element={
            <PublicLayout>
              <Infrastructure />
            </PublicLayout>
          }
        />
        <Route
          path="/gallery"
          element={
            <PublicLayout>
              <Gallery />
            </PublicLayout>
          }
        />
        <Route
          path="/mandatory-disclosure"
          element={
            <PublicLayout>
              <MandatoryDisclosure />
            </PublicLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          }
        />

        {/* Student/Teacher Portal Routes */}
        <Route path="/student-teacher-login" element={<StudentTeacherLogin />} />

        {/* Student Portal Routes */}
        <Route
          path="/student/dashboard"
          element={
            <TeacherProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </TeacherProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <TeacherProtectedRoute allowedRoles={["student"]}>
              <StudentAttendance />
            </TeacherProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <TeacherProtectedRoute allowedRoles={["student"]}>
              <StudentProfile />
            </TeacherProtectedRoute>
          }
        />

        <Route
          path="/student/timetable"
          element={
            <TeacherProtectedRoute allowedRoles={["student"]}>
              <StudentTimetable />
            </TeacherProtectedRoute>
          }
        />
        <Route
          path="/student/announcements"
          element={
            <TeacherProtectedRoute allowedRoles={["student"]}>
              <StudentAnnouncements />
            </TeacherProtectedRoute>
          }
        />
        <Route
          path="/student/annual-calendar"
          element={
            <TeacherProtectedRoute allowedRoles={["student"]}>
              <StudentAnnualCalendar />
            </TeacherProtectedRoute>
          }
        />
        <Route
          path="/student/homework"
          element={
            <TeacherProtectedRoute allowedRoles={["student"]}>
              <StudentHomework />
            </TeacherProtectedRoute>
          }
        />
        <Route
          path="/student/fees"
          element={
            <TeacherProtectedRoute allowedRoles={["student"]}>
              <StudentFees />
            </TeacherProtectedRoute>
          }
        />

        {/* Teacher Portal Routes */}
        <Route
          path="/teacher/dashboard"
          element={
            <TeacherProtectedRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </TeacherProtectedRoute>
          }
        />
        <Route
          path="/teacher/announcements"
          element={
            <TeacherProtectedRoute allowedRoles={["teacher"]}>
              <TeacherAnnouncements />
            </TeacherProtectedRoute>
          }
        />
        <Route
          path="/teacher/classes"
          element={
            <TeacherProtectedRoute allowedRoles={["teacher"]}>
              <TeacherClasses />
            </TeacherProtectedRoute>
          }
        />
        <Route
          path="/teacher/classes/:classId"
          element={
            <TeacherProtectedRoute allowedRoles={["teacher"]}>
              <TeacherClassDetails />
            </TeacherProtectedRoute>
          }
        />
        <Route
          path="/teacher/attendance"
          element={
            <TeacherProtectedRoute allowedRoles={["teacher"]}>
              <TeacherAttendance />
            </TeacherProtectedRoute>
          }
        />
        <Route
          path="/teacher/timetable"
          element={
            <TeacherProtectedRoute allowedRoles={["teacher"]}>
              <TeacherTimetable />
            </TeacherProtectedRoute>
          }
        />
        <Route
          path="/teacher/annual-calendar"
          element={
            <TeacherProtectedRoute allowedRoles={["teacher"]}>
              <TeacherAnnualCalendar />
            </TeacherProtectedRoute>
          }
        />
        <Route
          path="/teacher/profile"
          element={
            <TeacherProtectedRoute allowedRoles={["teacher"]}>
              <TeacherProfile />
            </TeacherProtectedRoute>
          }
        />
        <Route
          path="/teacher/homework"
          element={
            <TeacherProtectedRoute allowedRoles={["teacher"]}>
              <TeacherHomework />
            </TeacherProtectedRoute>
          }
        />

        {/* Admin/Management System Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute>
              <TeacherManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes"
          element={
            <ProtectedRoute>
              <ClassManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes/:classId"
          element={
            <ProtectedRoute>
              <ClassDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes/:classId/add-student"
          element={
            <ProtectedRoute>
              <AddStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/fees"
          element={
            <ProtectedRoute>
              <FeeManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute>
              <Announcements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/timetable-outlines"
          element={
            <ProtectedRoute>
              <TimetableOutlineManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/annual-calendar"
          element={
            <ProtectedRoute>
              <AnnualCalendarAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/calendar"
          element={
            <ProtectedRoute>
              <AnnualCalendarView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/student-demo"
          element={
            <ProtectedRoute>
              <StudentDemo />
            </ProtectedRoute>
          }
        />

        {/* Legacy routes - redirect to new admin paths */}
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/users" element={<Navigate to="/admin/users" replace />} />
        <Route path="/teachers" element={<Navigate to="/admin/teachers" replace />} />
        <Route path="/classes" element={<Navigate to="/admin/classes" replace />} />
        <Route path="/fees" element={<Navigate to="/admin/fees" replace />} />
        <Route path="/announcements" element={<Navigate to="/admin/announcements" replace />} />
        <Route path="/timetable-outlines" element={<Navigate to="/admin/timetable-outlines" replace />} />
        <Route path="/annual-calendar" element={<Navigate to="/admin/annual-calendar" replace />} />
        <Route path="/calendar" element={<Navigate to="/admin/calendar" replace />} />
        <Route path="/student-demo" element={<Navigate to="/admin/student-demo" replace />} />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Show password change modal when required */}
      {requirePasswordChange && <ChangePassword />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <TeacherAuthProvider>
        <Router>
          <AppContent />
        </Router>
      </TeacherAuthProvider>
    </AuthProvider>
  );
}

export default App;

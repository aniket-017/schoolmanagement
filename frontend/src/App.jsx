import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import ClassManagement from "./pages/ClassManagement";
import ClassDetails from "./pages/ClassDetails";
import AddStudent from "./pages/AddStudent";
import FeeManagement from "./pages/FeeManagement";
import Announcements from "./pages/Announcements";

import StudentDemo from "./pages/StudentDemo";
import ProtectedRoute from "./components/ProtectedRoute";
import ChangePassword from "./components/ChangePassword";

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
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classes"
          element={
            <ProtectedRoute>
              <ClassManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classes/:classId"
          element={
            <ProtectedRoute>
              <ClassDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classes/:classId/add-student"
          element={
            <ProtectedRoute>
              <AddStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fees"
          element={
            <ProtectedRoute>
              <FeeManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/announcements"
          element={
            <ProtectedRoute>
              <Announcements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-demo"
          element={
            <ProtectedRoute>
              <StudentDemo />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Show password change modal when required */}
      {requirePasswordChange && <ChangePassword />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

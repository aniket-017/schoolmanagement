import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/apiService";

const TeacherAuthContext = createContext();

export const useTeacherAuth = () => {
  const context = useContext(TeacherAuthContext);
  if (!context) {
    throw new Error("useTeacherAuth must be used within a TeacherAuthProvider");
  }
  return context;
};

export const TeacherAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("userRole");

      if (!token || !userRole) {
        setLoading(false);
        return;
      }

      // Verify token with backend
      let profileData;
      if (userRole === "student") {
        profileData = await apiService.studentAuth.getProfile();
      } else {
        profileData = await apiService.auth.getProfile();
      }

      if (profileData.success) {
        setUser(profileData.user);
        setIsAuthenticated(true);
      } else {
        // Token invalid, clear storage
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
    } finally {
      setLoading(false);
    }
  };

  const login = async (role, identifier, password) => {
    try {
      setLoading(true);
      let response;

      if (role === "student") {
        response = await apiService.studentAuth.login(identifier, password);
      } else {
        response = await apiService.auth.login(identifier, password);
      }

      if (response.success) {
        // Store token and user info
        localStorage.setItem("token", response.token);
        localStorage.setItem("userRole", role);
        localStorage.setItem("user", JSON.stringify(response.user));

        setUser(response.user);
        setIsAuthenticated(true);

        return { success: true, user: response.user, requirePasswordChange: response.requirePasswordChange };
      }

      return { success: false, message: response.message };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: error.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return <TeacherAuthContext.Provider value={value}>{children}</TeacherAuthContext.Provider>;
};

export default TeacherAuthContext;

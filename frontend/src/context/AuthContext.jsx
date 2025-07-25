import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { appConfig } from "../config/environment";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const API_BASE_URL = appConfig.API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Verify token and get user data
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const userRole = localStorage.getItem("userRole");
      const endpoint = userRole === "student"
        ? `${appConfig.API_BASE_URL}/student-auth/profile`
        : `${appConfig.API_BASE_URL}/auth/profile`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        // Store userRole for future reference
        localStorage.setItem("userRole", data.user.role);
        // Check if user needs to change password
        setRequirePasswordChange(data.user.isFirstLogin || false);
      } else {
        // Only remove token if response indicates it's invalid
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userRole");
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Only remove token on network errors if response is 401
      if (error.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${appConfig.API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        // Store userRole for future reference
        localStorage.setItem("userRole", data.user.role);
        setRequirePasswordChange(data.requirePasswordChange || false);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setRequirePasswordChange(false);
  };

  const clearPasswordChangeRequirement = () => {
    setRequirePasswordChange(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        requirePasswordChange,
        clearPasswordChangeRequirement,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showMessage } from "react-native-flash-message";
import apiService from "../services/apiService";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);

        // Verify token is still valid
        try {
          const response = await apiService.student.getProfile();
          if (response.user) {
            setUser(response.user);
            await AsyncStorage.setItem("user", JSON.stringify(response.user));
          }
        } catch (error) {
          console.log("Token verification failed:", error);
          // Token might be expired, clear storage
          await clearAuthData();
        }
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "user"]);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await apiService.auth.login(email, password);

      if (response.success && response.user && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);

        // Store auth data
        await AsyncStorage.setItem("token", response.token);
        await AsyncStorage.setItem("user", JSON.stringify(response.user));

        showMessage({
          message: "Login Successful",
          description: `Welcome back, ${response.user.name}!`,
          type: "success",
          duration: 3000,
        });

        return { success: true, user: response.user };
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      const errorMessage = apiService.handleError(error);

      showMessage({
        message: "Login Failed",
        description: errorMessage,
        type: "danger",
        duration: 4000,
      });

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await apiService.auth.register(userData);

      if (response.success) {
        showMessage({
          message: "Registration Successful",
          description: response.message || "Account created successfully",
          type: "success",
          duration: 3000,
        });

        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      const errorMessage = apiService.handleError(error);

      showMessage({
        message: "Registration Failed",
        description: errorMessage,
        type: "danger",
        duration: 4000,
      });

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Call logout API
      try {
        await apiService.auth.logout();
      } catch (error) {
        console.log("Logout API error:", error);
      }

      // Clear local storage
      await clearAuthData();

      showMessage({
        message: "Logged Out",
        description: "You have been successfully logged out",
        type: "info",
        duration: 2000,
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Force clear even if API call fails
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setIsLoading(true);
      const response = await apiService.student.updateProfile(profileData);

      if (response.success && response.user) {
        setUser(response.user);
        await AsyncStorage.setItem("user", JSON.stringify(response.user));

        showMessage({
          message: "Profile Updated",
          description: "Your profile has been updated successfully",
          type: "success",
          duration: 3000,
        });

        return { success: true, user: response.user };
      } else {
        throw new Error(response.message || "Profile update failed");
      }
    } catch (error) {
      const errorMessage = apiService.handleError(error);

      showMessage({
        message: "Update Failed",
        description: errorMessage,
        type: "danger",
        duration: 4000,
      });

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.student.getProfile();
      if (response.user) {
        setUser(response.user);
        await AsyncStorage.setItem("user", JSON.stringify(response.user));
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  };

  // Helper functions
  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission);
  };

  const isStudent = () => hasRole("student");
  const isTeacher = () => hasRole("teacher");
  const isAdmin = () => hasRole("admin");
  const isPrincipal = () => hasRole("principal");
  const isStaff = () => ["cleaner", "bus_driver", "accountant"].includes(user?.role);

  const value = {
    // State
    user,
    isLoading,
    isAuthenticated,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    refreshUser,

    // Helpers
    hasRole,
    hasPermission,
    isStudent,
    isTeacher,
    isAdmin,
    isPrincipal,
    isStaff,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

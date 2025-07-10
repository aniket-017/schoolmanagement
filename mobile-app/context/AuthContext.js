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
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");
      const passwordChangeRequired = await AsyncStorage.getItem("requirePasswordChange");

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setRequirePasswordChange(passwordChangeRequired === "true");

        // Verify token is still valid
        try {
          const response = await apiService.student.getProfile();
          if (response.user) {
            setUser(response.user);
            await AsyncStorage.setItem("user", JSON.stringify(response.user));
          }
        } catch (error) {
          console.log("Token verification failed:", error);
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
      await AsyncStorage.multiRemove(["token", "user", "requirePasswordChange"]);
      setUser(null);
      setIsAuthenticated(false);
      setRequirePasswordChange(false);
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
        setRequirePasswordChange(response.requirePasswordChange || false);

        // Store auth data
        await AsyncStorage.setItem("token", response.token);
        await AsyncStorage.setItem("user", JSON.stringify(response.user));
        await AsyncStorage.setItem("requirePasswordChange", String(response.requirePasswordChange || false));

        showMessage({
          message: "Login Successful",
          description: response.requirePasswordChange
            ? "Please change your password to continue"
            : `Welcome back, ${response.user.name}!`,
          type: "success",
          duration: 3000,
        });

        return {
          success: true,
          user: response.user,
          requirePasswordChange: response.requirePasswordChange,
        };
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

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setIsLoading(true);
      const response = await apiService.auth.changePassword(currentPassword, newPassword);

      if (response.success) {
        setRequirePasswordChange(false);
        await AsyncStorage.setItem("requirePasswordChange", "false");

        showMessage({
          message: "Password Changed",
          description: "Your password has been updated successfully",
          type: "success",
          duration: 3000,
        });

        return { success: true };
      } else {
        throw new Error(response.message || "Password change failed");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to change password";

      showMessage({
        message: "Password Change Failed",
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
    requirePasswordChange,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    changePassword,

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

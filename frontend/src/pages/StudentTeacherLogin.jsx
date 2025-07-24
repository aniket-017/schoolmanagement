import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  UserIcon,
  AcademicCapIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import logo from "../assets/logo.jpeg";

const StudentTeacherLogin = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const roles = [
    {
      id: "student",
      title: "Student",
      icon: AcademicCapIcon,
      description: "Access your student portal",
      placeholder: "Student ID or Admission Number",
    },
    {
      id: "teacher",
      title: "Teacher",
      icon: UserIcon,
      description: "Access your teacher portal",
      placeholder: "Employee ID or Email",
    },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setLoginData({ identifier: "", password: "" });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!loginData.identifier.trim()) {
      newErrors.identifier = `${selectedRole === "student" ? "Student ID" : "Employee ID"} is required`;
    }

    if (!loginData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (loginData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // TODO: Replace with actual API call
      console.log("Login attempt:", { role: selectedRole, ...loginData });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Navigate to appropriate dashboard
      if (selectedRole === "student") {
        navigate("/student/dashboard");
      } else {
        navigate("/teacher/dashboard");
      }
    } catch (error) {
      setErrors({ general: "Login failed. Please check your credentials." });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Home
            </Link>

            <div className="flex justify-center mb-4">
              <img src={logo} alt="Dnyanbhavan Logo" className="h-16 w-auto" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Portal</h1>
            <p className="text-gray-600">Choose your role to continue</p>
          </div>

          {/* Role Selection */}
          <div className="space-y-4">
            {roles.map((role, index) => (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleRoleSelect(role.id)}
                className="w-full bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <role.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{role.title}</h3>
                    <p className="text-gray-600 text-sm">{role.description}</p>
                  </div>
                  <div className="text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Admin Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm mb-2">Looking for admin access?</p>
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Go to Admin Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedRoleData = roles.find((role) => role.id === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => setSelectedRole("")}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Change Role
          </button>

          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <selectedRoleData.icon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedRoleData.title} Login</h1>
          <p className="text-gray-600">{selectedRoleData.description}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Identifier Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{selectedRoleData.placeholder}</label>
              <input
                type="text"
                name="identifier"
                value={loginData.identifier}
                onChange={handleInputChange}
                placeholder={selectedRoleData.placeholder}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none ${
                  errors.identifier ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                }`}
              />
              {errors.identifier && <p className="text-red-600 text-sm mt-1">{errors.identifier}</p>}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 pr-12 rounded-lg border-2 transition-colors focus:outline-none ${
                    errors.password ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <button type="button" className="text-sm text-blue-600 hover:text-blue-700">
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                `Sign in as ${selectedRoleData.title}`
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Need help? Contact{" "}
              <a href="tel:+918379868456" className="text-blue-600 hover:text-blue-700">
                +91 83798 68456
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentTeacherLogin;

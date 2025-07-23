import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import Layout from "../components/Layout";
import { cn } from "../utils/cn";
import appConfig from "../config/environment";
import { toast } from "react-toastify";

const StudentDemo = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setClasses(data.data);
        if (data.data.length > 0) {
          setSelectedClass(data.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: UserPlus,
      title: "Individual Student Creation",
      description:
        "Add students one by one with comprehensive information including personal details, parent information, and contact details.",
      color: "blue",
    },
    {
      icon: Upload,
      title: "Bulk Upload",
      description:
        "Upload multiple students at once using Excel files. Download templates and upload filled data efficiently.",
      color: "green",
    },
    {
      icon: Users,
      title: "Student Management",
      description: "View, search, and manage students within classes. Remove students and track enrollment status.",
      color: "purple",
    },
    {
      icon: BookOpen,
      title: "Class Integration",
      description:
        "Students are automatically assigned to classes with proper capacity management and enrollment tracking.",
      color: "orange",
    },
  ];

  const steps = [
    {
      step: 1,
      title: "Navigate to Class Details",
      description: "Go to Class Management and click on any class to view its details.",
      action: "View Classes",
    },
    {
      step: 2,
      title: "Add Individual Student",
      description: "Click 'Add Student' button to create a new student with form-based input.",
      action: "Add Student",
    },
    {
      step: 3,
      title: "Bulk Upload Students",
      description: "Download Excel template, fill it with student data, and upload for bulk creation.",
      action: "Bulk Upload",
    },
    {
      step: 4,
      title: "Manage Students",
      description: "View all students, search by name/email, and remove students as needed.",
      action: "Manage",
    },
  ];

  const benefits = [
    "Automatic student ID generation",
    "Temporary password creation for new students",
    "Duplicate email prevention",
    "Class capacity management",
    "Excel template download",
    "Detailed upload results",
    "Real-time validation",
    "Responsive design for all devices",
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Student Management System</h1>
            <p className="text-xl text-gray-600 mb-6">Comprehensive student creation and management functionality</p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                Backend API Ready
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                Frontend Integrated
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                Testing Complete
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                    feature.color === "blue" && "bg-blue-100 text-blue-600",
                    feature.color === "green" && "bg-green-100 text-green-600",
                    feature.color === "purple" && "bg-purple-100 text-purple-600",
                    feature.color === "orange" && "bg-orange-100 text-orange-600"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* How to Use */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use</h2>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-600 mb-2">{step.description}</p>
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {step.action}
                  </span>
                </div>
                {index < steps.length - 1 && <ArrowRight className="w-5 h-5 text-gray-400 mt-1" />}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center space-x-3"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">API Endpoints</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">GET</span>
                <code className="text-sm font-mono">/classes/{selectedClass?._id || ":classId"}/students</code>
              </div>
              <p className="text-gray-600 text-sm">Get all students in a class</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">POST</span>
                <code className="text-sm font-mono">/classes/{selectedClass?._id || ":classId"}/students</code>
              </div>
              <p className="text-gray-600 text-sm">Add individual student to class</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">POST</span>
                <code className="text-sm font-mono">/classes/{selectedClass?._id || ":classId"}/students/bulk</code>
              </div>
              <p className="text-gray-600 text-sm">Bulk upload students via Excel</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">DELETE</span>
                <code className="text-sm font-mono">
                  /classes/{selectedClass?._id || ":classId"}/students/:studentId
                </code>
              </div>
              <p className="text-gray-600 text-sm">Remove student from class</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">GET</span>
                <code className="text-sm font-mono">
                  /classes/{selectedClass?._id || ":classId"}/students/excel-template
                </code>
              </div>
              <p className="text-gray-600 text-sm">Download Excel template for bulk upload</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => (window.location.href = "/classes")}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>View Classes</span>
            </button>
            <button
              onClick={() => (window.location.href = "/users")}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              <span>Teacher Management</span>
            </button>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDemo;

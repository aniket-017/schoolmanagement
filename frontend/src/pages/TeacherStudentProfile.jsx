import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  AcademicCapIcon,
  MapPinIcon,
  IdentificationIcon,
  ChevronLeftIcon,
  UsersIcon,
  BookOpenIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useTeacherAuth } from "../context/TeacherAuthContext";
import apiService from "../services/apiService";

const TeacherStudentProfile = () => {
  const { studentId, classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: teacher } = useTeacherAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get student data from location state if available (passed from class details)
  const studentFromState = location.state?.student;

  useEffect(() => {
    if (studentFromState) {
      setStudent(studentFromState);
      setLoading(false);
    } else {
      loadStudentProfile();
    }
  }, [studentId, studentFromState]);

  const loadStudentProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get student details from the API
      let studentResponse;

      if (apiService.students && apiService.students.getById) {
        studentResponse = await apiService.students.getById(studentId);
      } else {
        // Fallback: try direct fetch
        const fetchResponse = await fetch(`${apiService.baseURL}/students/${studentId}`, {
          headers: apiService.getAuthHeaders(),
        });
        studentResponse = await apiService.handleResponse(fetchResponse);
      }

      if (studentResponse.success) {
        setStudent(studentResponse.data);
      } else {
        setError("Failed to load student profile");
      }
    } catch (error) {
      console.error("Error loading student profile:", error);
      setError("Error loading student profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (classId) {
      navigate(`/teacher/classes/${classId}`);
    } else {
      navigate("/teacher/classes");
    }
  };

  const formatStudentName = (student) => {
    if (student.firstName && student.lastName) {
      return `${student.firstName} ${student.middleName ? student.middleName + " " : ""}${student.lastName}`.trim();
    }
    return student.name || student.email || "Unknown Student";
  };

  const formatAddress = (address) => {
    if (!address) return "Not provided";
    if (typeof address === "string") return address;
    if (typeof address === "object") {
      return (
        [address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean).join(", ") ||
        "Address not available"
      );
    }
    return String(address);
  };

  const formatDate = (date) => {
    if (!date) return "Not provided";
    if (typeof date === "string") {
      return new Date(date).toLocaleDateString();
    }
    if (typeof date === "object") {
      return new Date(date).toLocaleDateString();
    }
    return String(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Student Not Found</h3>
          <p className="text-gray-600 mb-4">
            {error || "The student profile you're looking for doesn't exist or you don't have access to it."}
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={handleBack} className="text-blue-100 hover:text-white transition-colors">
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-1">Student Profile</h1>
              <p className="text-blue-100 text-sm">View Student Information</p>
              {classId && (
                <p className="text-blue-100 text-xs mt-1">
                  Class: {student.class?.grade || "N/A"} - {student.class?.division || "N/A"}
                </p>
              )}
            </div>
            <div className="w-5"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Student Header Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{formatStudentName(student)}</h2>
                <p className="text-gray-600">Student ID: {student.studentId || student.admissionNumber || "N/A"}</p>
                {student.rollNumber && <p className="text-gray-600">Roll No: {student.rollNumber}</p>}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                Personal Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900">{formatStudentName(student)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-gray-900">{formatDate(student.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-gray-900">{student.gender || "Not provided"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{student.email || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{student.phone || student.mobileNumber || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900">{formatAddress(student.address || student.currentAddress)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-600" />
                Academic Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Class</label>
                    <p className="text-gray-900">{student.class?.grade || student.class?.name || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Division</label>
                    <p className="text-gray-900">
                      {student.class?.division || student.class?.section || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Roll Number</label>
                    <p className="text-gray-900">{student.rollNumber || "Not provided"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Admission Number</label>
                    <p className="text-gray-900">{student.admissionNumber || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Student ID</label>
                    <p className="text-gray-900">{student.studentId || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Admission Date</label>
                    <p className="text-gray-900">{formatDate(student.admissionDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {student.emergencyContact && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <PhoneIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Emergency Contact
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contact Person</label>
                    <p className="text-gray-900">
                      {typeof student.emergencyContact === "object"
                        ? student.emergencyContact.name || student.emergencyContact.person || "Not provided"
                        : student.emergencyContact}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contact Number</label>
                    <p className="text-gray-900">
                      {typeof student.emergencyContact === "object"
                        ? student.emergencyContact.phone || student.emergencyContact.number || "Not provided"
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Relationship</label>
                    <p className="text-gray-900">
                      {typeof student.emergencyContact === "object"
                        ? student.emergencyContact.relationship || "Not provided"
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <IdentificationIcon className="w-5 h-5 mr-2 text-blue-600" />
                Additional Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Blood Group</label>
                    <p className="text-gray-900">{student.bloodGroup || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Religion</label>
                    <p className="text-gray-900">{student.religion || "Not provided"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="text-gray-900">{student.category || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nationality</label>
                    <p className="text-gray-900">{student.nationality || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherStudentProfile;

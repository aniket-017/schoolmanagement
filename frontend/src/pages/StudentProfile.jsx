import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  PencilIcon,
  FolderIcon,
  HeartIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
// Use TeacherAuthContext for student profile
import { useTeacherAuth } from "../context/TeacherAuthContext";

const StudentProfile = () => {
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { user, loading, logout } = useTeacherAuth();

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "Not provided";
    if (typeof address === "string") return address;
    if (typeof address === "object") {
      // Try common address fields
      return [address.street, address.city, address.state, address.zipCode, address.country]
        .filter(Boolean)
        .join(", ") || JSON.stringify(address);
    }
    return String(address);
  };

  // Format class for display
  const formatClass = (classObj) => {
    if (!classObj) return "Not provided";
    if (typeof classObj === "string") return classObj;
    if (typeof classObj === "object") {
      return [classObj.name, classObj.grade, classObj.section].filter(Boolean).join(" - ") || JSON.stringify(classObj);
    }
    return String(classObj);
  };

  // Format section for display
  const formatSection = (section) => {
    if (!section) return "Not provided";
    if (typeof section === "string" || typeof section === "number") return section;
    if (typeof section === "object") return JSON.stringify(section);
    return String(section);
  };

  // Defensive: show loading or error if user is not available
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user || user.role !== "student") {
    return <div className="text-red-500 p-4">Unable to load student profile. Please log in as a student.</div>;
  }



  // Mock data similar to the screenshots - will be replaced with real data from backend
  const studentData = {
    name: user?.name || "Prerna Thite",
    email: user?.email || "prerna@gmail.com",
    phone: user?.phone || user?.mobileNumber || "8745695875",
    dateOfBirth: typeof user?.dateOfBirth === "object"
      ? JSON.stringify(user.dateOfBirth)
      : user?.dateOfBirth || "4/1/2001",
    gender: user?.gender || "Female",
    address: formatAddress(user?.address || user?.currentAddress),
    emergencyContact: typeof user?.emergencyContact === "object"
      ? JSON.stringify(user.emergencyContact)
      : user?.emergencyContact || "Not provided",
    studentId: user?.studentId || "STU1753270452987",
    admissionNumber: user?.admissionNumber || "ADM1753270452987",
    class: formatClass(user?.class),
    section: formatSection(user?.section || (user?.class?.section ? user.class.section : "1st")),
  };

  if (mobileView) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center p-4">
            <Link to="/student/dashboard" className="p-2 -ml-2">
              <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 text-center flex-1">Profile</h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Main Content - Exact match to screenshots */}
        <div className="px-4 py-6 space-y-6 pb-24">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{studentData.name}</h2>
                <p className="text-gray-600">{studentData.email}</p>
              </div>
              <button className="p-2 text-blue-600">
                <PencilIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{studentData.email}</span>
              </div>

              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{studentData.phone}</span>
              </div>

              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{studentData.dateOfBirth}</span>
              </div>

              <div className="flex items-center space-x-3">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{studentData.gender}</span>
              </div>

              <div className="flex items-center space-x-3">
                <FolderIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{studentData.address}</span>
              </div>

              <div className="flex items-center space-x-3">
                <HeartIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{studentData.emergencyContact}</span>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FolderIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{studentData.studentId}</span>
              </div>

              <div className="flex items-center space-x-3">
                <FolderIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{studentData.admissionNumber}</span>
              </div>

              <div className="flex items-center space-x-3">
                <FolderIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{studentData.class}</span>
              </div>

              <div className="flex items-center space-x-3">
                <FolderIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{studentData.section}</span>
              </div>
            </div>
          </div>
        </div>


      </div>
    );
  }

  // Desktop View
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/student/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{studentData.name}</h2>
                <p className="text-gray-600">{studentData.email}</p>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{studentData.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{studentData.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{studentData.dateOfBirth}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{studentData.gender}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Student ID</p>
                <p className="font-medium text-gray-900">{studentData.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Admission Number</p>
                <p className="font-medium text-gray-900">{studentData.admissionNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Class</p>
                <p className="font-medium text-gray-900">{studentData.class}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Section</p>
                <p className="font-medium text-gray-900">{studentData.section}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <ArrowLeftOnRectangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Confirm Logout</h3>
              <p className="text-gray-600 text-center mb-6">Are you sure you want to logout from your account?</p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-3 rounded-lg text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;

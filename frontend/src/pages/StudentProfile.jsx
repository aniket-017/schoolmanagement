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
  MapPinIcon,
  AcademicCapIcon,
  IdentificationIcon,
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

  // Format date to dd-mm-yyyy
  const formatDate = (date) => {
    if (!date) return "Not provided";

    try {
      if (typeof date === "string") {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return "Invalid date";
        return dateObj.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }

      if (date instanceof Date) {
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }

      if (typeof date === "object" && date.$date) {
        const dateObj = new Date(date.$date);
        return dateObj.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }

      return "Invalid date format";
    } catch (error) {
      return "Invalid date";
    }
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "Not provided";
    if (typeof address === "string") return address;
    if (typeof address === "object") {
      // Try common address fields
      const addressParts = [address.street, address.city, address.state, address.zipCode, address.country].filter(
        Boolean
      );

      if (addressParts.length > 0) {
        return addressParts.join(", ");
      }

      // If no standard fields, try to extract any string values
      const values = Object.values(address).filter((val) => typeof val === "string" && val.trim().length > 0);

      if (values.length > 0) {
        return values.join(", ");
      }

      return "Address details incomplete";
    }
    return String(address);
  };

  // Format class for display
  const formatClass = (classObj) => {
    if (!classObj) return "Not provided";
    if (typeof classObj === "string") return classObj;
    if (typeof classObj === "object") {
      const classParts = [classObj.name, classObj.grade, classObj.section].filter(Boolean);

      if (classParts.length > 0) {
        return classParts.join(" - ");
      }

      return "Class details incomplete";
    }
    return String(classObj);
  };

  // Format section for display
  const formatSection = (section) => {
    if (!section) return "Not provided";
    if (typeof section === "string" || typeof section === "number") return section;
    if (typeof section === "object") {
      if (section.name) return section.name;
      if (section.section) return section.section;
      return "Section details incomplete";
    }
    return String(section);
  };

  // Format emergency contact for display
  const formatEmergencyContact = (contact) => {
    if (!contact) return "Not provided";
    if (typeof contact === "string") return contact;
    if (typeof contact === "object") {
      const contactParts = [contact.name, contact.relationship, contact.phone, contact.email].filter(Boolean);

      if (contactParts.length > 0) {
        return contactParts.join(" - ");
      }

      return "Emergency contact details incomplete";
    }
    return String(contact);
  };

  // Defensive: show loading or error if user is not available
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user || user.role !== "student") {
    return <div className="text-red-500 p-4">Unable to load student profile. Please log in as a student.</div>;
  }

  // Comprehensive student data with all possible fields
  const studentData = {
    // Personal Information
    name: user?.name || "Not provided",
    email: user?.email || "Not provided",
    phone: user?.phone || user?.mobileNumber || user?.contactNumber || "Not provided",
    dateOfBirth: formatDate(user?.dateOfBirth || user?.dob || user?.birthDate),
    gender: user?.gender || "Not provided",
    bloodGroup: user?.bloodGroup || user?.bloodType || "Not provided",
    nationality: user?.nationality || "Not provided",
    religion: user?.religion || "Not provided",

    // Address Information
    address: formatAddress(user?.address || user?.currentAddress || user?.permanentAddress),
    city: user?.city || "Not provided",
    state: user?.state || "Not provided",
    country: user?.country || "Not provided",
    zipCode: user?.zipCode || user?.postalCode || "Not provided",

    // Emergency Contact
    emergencyContact: formatEmergencyContact(user?.emergencyContact || user?.emergencyContactPerson),
    emergencyPhone: user?.emergencyPhone || user?.emergencyContactPhone || "Not provided",

    // Academic Information
    studentId: user?.studentId || user?.studentID || user?.id || "Not provided",
    admissionNumber: user?.admissionNumber || user?.admissionNo || "Not provided",
    admissionDate: formatDate(user?.admissionDate || user?.admissionDate),
    class: formatClass(user?.class || user?.className),
    section: formatSection(user?.section || user?.classSection),
    grade: user?.grade || "Not provided",
    rollNumber: user?.rollNumber || user?.rollNo || "Not provided",

    // Parent Information
    fatherName: user?.fatherName || user?.father?.name || "Not provided",
    motherName: user?.motherName || user?.mother?.name || "Not provided",
    parentPhone: user?.parentPhone || user?.parentContact || "Not provided",
    parentEmail: user?.parentEmail || "Not provided",

    // Additional Information
    previousSchool: user?.previousSchool || "Not provided",
    transportMode: user?.transportMode || user?.transportType || "Not provided",
    busRoute: user?.busRoute || "Not provided",
    medicalConditions: user?.medicalConditions || user?.healthIssues || "Not provided",
    allergies: user?.allergies || "Not provided",
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

        {/* Main Content - Comprehensive Information */}
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

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Personal Information
            </h3>

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
                <HeartIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Blood Group: {studentData.bloodGroup}</span>
              </div>

              <div className="flex items-center space-x-3">
                <IdentificationIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Nationality: {studentData.nationality}</span>
              </div>

              <div className="flex items-center space-x-3">
                <IdentificationIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Religion: {studentData.religion}</span>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2" />
              Address Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{studentData.address}</span>
              </div>

              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">City: {studentData.city}</span>
              </div>

              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">State: {studentData.state}</span>
              </div>

              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Country: {studentData.country}</span>
              </div>

              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">ZIP Code: {studentData.zipCode}</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HeartIcon className="w-5 h-5 mr-2" />
              Emergency Contact
            </h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <HeartIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{studentData.emergencyContact}</span>
              </div>

              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{studentData.emergencyPhone}</span>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AcademicCapIcon className="w-5 h-5 mr-2" />
              Academic Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <IdentificationIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Student ID: {studentData.studentId}</span>
              </div>

              <div className="flex items-center space-x-3">
                <IdentificationIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Admission No: {studentData.admissionNumber}</span>
              </div>

              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Admission Date: {studentData.admissionDate}</span>
              </div>

              <div className="flex items-center space-x-3">
                <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Class: {studentData.class}</span>
              </div>

              <div className="flex items-center space-x-3">
                <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Section: {studentData.section}</span>
              </div>

              <div className="flex items-center space-x-3">
                <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Grade: {studentData.grade}</span>
              </div>

              <div className="flex items-center space-x-3">
                <IdentificationIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Roll Number: {studentData.rollNumber}</span>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Parent Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Father: {studentData.fatherName}</span>
              </div>

              <div className="flex items-center space-x-3">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Mother: {studentData.motherName}</span>
              </div>

              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Parent Contact: {studentData.parentPhone}</span>
              </div>

              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Parent Email: {studentData.parentEmail}</span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FolderIcon className="w-5 h-5 mr-2" />
              Additional Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Previous School: {studentData.previousSchool}</span>
              </div>

              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Transport Mode: {studentData.transportMode}</span>
              </div>

              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Bus Route: {studentData.busRoute}</span>
              </div>

              <div className="flex items-center space-x-3">
                <HeartIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Medical Conditions: {studentData.medicalConditions}</span>
              </div>

              <div className="flex items-center space-x-3">
                <HeartIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Allergies: {studentData.allergies}</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
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

            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Personal Information
            </h3>
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
              <div className="flex items-center space-x-3">
                <HeartIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Blood Group: {studentData.bloodGroup}</span>
              </div>
              <div className="flex items-center space-x-3">
                <IdentificationIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Nationality: {studentData.nationality}</span>
              </div>
              <div className="flex items-center space-x-3">
                <IdentificationIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Religion: {studentData.religion}</span>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AcademicCapIcon className="w-5 h-5 mr-2" />
              Academic Information
            </h3>
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
                <p className="text-sm text-gray-600">Admission Date</p>
                <p className="font-medium text-gray-900">{studentData.admissionDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Class</p>
                <p className="font-medium text-gray-900">{studentData.class}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Section</p>
                <p className="font-medium text-gray-900">{studentData.section}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Grade</p>
                <p className="font-medium text-gray-900">{studentData.grade}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Roll Number</p>
                <p className="font-medium text-gray-900">{studentData.rollNumber}</p>
              </div>
            </div>
          </div>

          {/* Address & Contact */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2" />
              Address & Contact
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium text-gray-900">{studentData.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">City</p>
                <p className="font-medium text-gray-900">{studentData.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">State</p>
                <p className="font-medium text-gray-900">{studentData.state}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Country</p>
                <p className="font-medium text-gray-900">{studentData.country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ZIP Code</p>
                <p className="font-medium text-gray-900">{studentData.zipCode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Emergency Contact */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HeartIcon className="w-5 h-5 mr-2" />
              Emergency Contact
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Emergency Contact</p>
                <p className="font-medium text-gray-900">{studentData.emergencyContact}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Emergency Phone</p>
                <p className="font-medium text-gray-900">{studentData.emergencyPhone}</p>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Parent Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Father's Name</p>
                <p className="font-medium text-gray-900">{studentData.fatherName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mother's Name</p>
                <p className="font-medium text-gray-900">{studentData.motherName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Parent Contact</p>
                <p className="font-medium text-gray-900">{studentData.parentPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Parent Email</p>
                <p className="font-medium text-gray-900">{studentData.parentEmail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FolderIcon className="w-5 h-5 mr-2" />
            Additional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Previous School</p>
              <p className="font-medium text-gray-900">{studentData.previousSchool}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Transport Mode</p>
              <p className="font-medium text-gray-900">{studentData.transportMode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bus Route</p>
              <p className="font-medium text-gray-900">{studentData.busRoute}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Medical Conditions</p>
              <p className="font-medium text-gray-900">{studentData.medicalConditions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Allergies</p>
              <p className="font-medium text-gray-900">{studentData.allergies}</p>
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

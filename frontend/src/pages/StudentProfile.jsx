import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  HomeIcon,
  ChartBarIcon,
  ClockIcon,
  PencilIcon,
  FolderIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { useTeacherAuth } from "../context/TeacherAuthContext";

const StudentProfile = () => {
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);

  const { user } = useTeacherAuth();

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const bottomNavItems = [
    { title: "Dashboard", icon: HomeIcon, href: "/student/dashboard" },
    { title: "Attendance", icon: CalendarIcon, href: "/student/attendance" },
    { title: "Grades", icon: ChartBarIcon, href: "/student/grades" },
    { title: "Timetable", icon: ClockIcon, href: "/student/timetable" },
  ];

  // Mock data similar to the screenshots - will be replaced with real data from backend
  const studentData = {
    name: user?.name || "Prerna Thite",
    email: user?.email || "prerna@gmail.com",
    phone: user?.phone || "8745695875",
    dateOfBirth: user?.dateOfBirth || "4/1/2001",
    gender: user?.gender || "Female",
    address: user?.address || "Not provided",
    emergencyContact: user?.emergencyContact || "Not provided",
    studentId: user?.studentId || "STU1753270452987",
    admissionNumber: user?.admissionNumber || "ADM1753270452987",
    class: user?.class?.name || "1st Class - undefined",
    section: user?.section || "1st",
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

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around">
            {bottomNavItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.title}</span>
              </Link>
            ))}
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
    </div>
  );
};

export default StudentProfile;

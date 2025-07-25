import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  CalendarIcon,
  HomeIcon,
  ChartBarIcon,
  ClockIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { useTeacherAuth } from "../context/TeacherAuthContext";

const StudentGrades = () => {
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
    { title: "Grades", icon: ChartBarIcon, href: "/student/grades", active: true },
    { title: "Timetable", icon: ClockIcon, href: "/student/timetable" },
  ];

  if (mobileView) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex items-center p-4">
            <Link to="/student/dashboard" className="p-2 -ml-2">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <h1 className="text-lg font-semibold text-center flex-1">Grades</h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 space-y-6 pb-24">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Grades Coming Soon</h3>
              <p className="text-gray-600">
                Your academic grades and reports will be available here once published by your teachers.
              </p>
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
                className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                  item.active ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
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
          <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center py-12">
            <AcademicCapIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Grades Coming Soon</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Your academic grades and reports will be available here once published by your teachers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGrades;

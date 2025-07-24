import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MegaphoneIcon,
  UserGroupIcon,
  ArrowRightIcon,
  Bars3Icon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import logo from "../assets/logo.jpeg";

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data - replace with actual API calls
  const [student] = useState({
    name: "Arjun Mehta",
    class: "X-A",
    rollNumber: "15",
    admissionNumber: "DN2024001",
  });

  const [todaySchedule] = useState([
    {
      id: 1,
      subject: "Mathematics",
      teacher: "Mrs. Sharma",
      time: "09:00 - 09:45",
      period: 1,
      room: "Room 101",
      type: "theory",
    },
    {
      id: 2,
      subject: "English",
      teacher: "Mr. Patel",
      time: "09:45 - 10:30",
      period: 2,
      room: "Room 102",
      type: "theory",
    },
    {
      id: 3,
      subject: "Physics Lab",
      teacher: "Dr. Kumar",
      time: "11:00 - 11:45",
      period: 3,
      room: "Physics Lab",
      type: "practical",
    },
  ]);

  const [todayAttendance] = useState({
    status: "present",
    timeIn: "08:30 AM",
    remarks: "On time",
  });

  const [announcements] = useState([
    {
      id: 1,
      title: "Sports Day Practice",
      content: "All students are required to attend sports day practice sessions starting from tomorrow.",
      date: "2024-12-10",
      author: "Sports Department",
    },
    {
      id: 2,
      title: "Parent-Teacher Meeting",
      content: "PTM scheduled for this Saturday. Parents are requested to meet class teachers.",
      date: "2024-12-09",
      author: "Academic Office",
    },
  ]);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const getAttendanceColor = (status) => {
    switch (status) {
      case "present":
        return "text-green-600 bg-green-50";
      case "absent":
        return "text-red-600 bg-red-50";
      case "late":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getAttendanceIcon = (status) => {
    switch (status) {
      case "present":
        return CheckCircleIcon;
      case "absent":
        return XCircleIcon;
      case "late":
        return ExclamationTriangleIcon;
      default:
        return ClockIcon;
    }
  };

  const getPeriodTypeColor = (type) => {
    switch (type) {
      case "theory":
        return "bg-blue-100 text-blue-800";
      case "practical":
        return "bg-green-100 text-green-800";
      case "lab":
        return "bg-purple-100 text-purple-800";
      case "sports":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const quickActions = [
    { title: "Attendance", icon: CalendarIcon, href: "/student/attendance", color: "bg-blue-500" },
    { title: "Timetable", icon: ClockIcon, href: "/student/timetable", color: "bg-green-500" },
    { title: "Assignments", icon: AcademicCapIcon, href: "/student/assignments", color: "bg-purple-500" },
    { title: "Results", icon: CheckCircleIcon, href: "/student/results", color: "bg-orange-500" },
    { title: "Fees", icon: UserIcon, href: "/student/fees", color: "bg-red-500" },
    { title: "Library", icon: UserGroupIcon, href: "/student/library", color: "bg-indigo-500" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-3">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold">Student Portal</h1>
            </div>
          </div>

          <Link to="/student-teacher-login" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <ArrowLeftOnRectangleIcon className="w-6 h-6" />
          </Link>
        </div>

        {/* Welcome Section */}
        <div className="px-4 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Welcome back,</p>
              <h2 className="text-xl font-bold">{student.name}</h2>
              <p className="text-white/90 text-sm">
                Class {student.class} • Roll No. {student.rollNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Today's Attendance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
            <Link to="/student/attendance" className="text-blue-600 text-sm font-medium hover:text-blue-700">
              View Details
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {React.createElement(getAttendanceIcon(todayAttendance.status), {
              className: `w-8 h-8 ${getAttendanceColor(todayAttendance.status).split(" ")[0]}`,
            })}
            <div>
              <p className={`font-semibold capitalize ${getAttendanceColor(todayAttendance.status)}`}>
                {todayAttendance.status}
              </p>
              <p className="text-gray-600 text-sm">Time In: {todayAttendance.timeIn}</p>
              {todayAttendance.remarks && <p className="text-gray-500 text-xs">Remarks: {todayAttendance.remarks}</p>}
            </div>
          </div>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
            <Link to="/student/timetable" className="text-blue-600 text-sm font-medium hover:text-blue-700">
              View Full
            </Link>
          </div>

          <div className="space-y-4">
            {todaySchedule.map((period, index) => (
              <div key={period.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center min-w-[80px]">
                  <p className="text-blue-600 font-semibold text-sm">{period.time}</p>
                  <p className="text-gray-500 text-xs">Period {period.period}</p>
                </div>

                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{period.subject}</h4>
                  <p className="text-gray-600 text-sm">{period.teacher}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-gray-500 text-xs">{period.room}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPeriodTypeColor(period.type)}`}>
                      {period.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Announcements</h3>
            <Link to="/student/announcements" className="text-blue-600 text-sm font-medium hover:text-blue-700">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {announcements.slice(0, 2).map((announcement) => (
              <div key={announcement.id} className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
                <MegaphoneIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{announcement.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{announcement.content}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{announcement.author}</span>
                    <span>•</span>
                    <span>{new Date(announcement.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                to={action.href}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div
                  className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center">{action.title}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <img src={logo} alt="Logo" className="h-8 w-auto" />
                <span className="font-semibold">Student Portal</span>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-2">
                <Link
                  to="/student/dashboard"
                  className="block px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium"
                >
                  Dashboard
                </Link>
                <Link to="/student/attendance" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  Attendance
                </Link>
                <Link to="/student/timetable" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  Timetable
                </Link>
                <Link to="/student/assignments" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  Assignments
                </Link>
                <Link to="/student/results" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  Results
                </Link>
                <Link to="/student/profile" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

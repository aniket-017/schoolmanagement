import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  UserGroupIcon,
  MegaphoneIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Bars3Icon,
  ArrowLeftOnRectangleIcon,
  BookOpenIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";
import logo from "../assets/logo.jpeg";

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data - replace with actual API calls
  const [teacher] = useState({
    name: "Mrs. Priya Sharma",
    employeeId: "EMP001",
    subjects: ["Mathematics", "Physics"],
    classes: ["X-A", "X-B", "XI-Science"],
  });

  const [todaySchedule] = useState([
    {
      id: 1,
      subject: "Mathematics",
      class: "X-A",
      time: "09:00 - 09:45",
      period: 1,
      room: "Room 101",
      type: "theory",
      studentsCount: 45,
    },
    {
      id: 2,
      subject: "Physics",
      class: "X-B",
      time: "10:00 - 10:45",
      period: 2,
      room: "Room 203",
      type: "theory",
      studentsCount: 42,
    },
    {
      id: 3,
      subject: "Physics Lab",
      class: "XI-Science",
      time: "11:00 - 11:45",
      period: 3,
      room: "Physics Lab",
      type: "practical",
      studentsCount: 38,
    },
    {
      id: 4,
      subject: "Mathematics",
      class: "X-A",
      time: "12:00 - 12:45",
      period: 4,
      room: "Room 101",
      type: "theory",
      studentsCount: 45,
    },
  ]);

  const [announcements] = useState([
    {
      id: 1,
      title: "Faculty Meeting Tomorrow",
      content:
        "All faculty members are requested to attend the monthly meeting tomorrow at 3:00 PM in the conference hall.",
      date: "2024-12-10",
      author: "Principal Office",
      priority: "high",
    },
    {
      id: 2,
      title: "Exam Schedule Update",
      content: "The mid-term examination schedule has been updated. Please check the revised timetable.",
      date: "2024-12-09",
      author: "Academic Office",
      priority: "medium",
    },
  ]);

  const [stats] = useState({
    todayClasses: 4,
    totalStudents: 170,
    pendingAssignments: 12,
    attendanceToday: "95%",
  });

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const quickActions = [
    { title: "Take Attendance", icon: ClipboardDocumentListIcon, href: "/teacher/attendance", color: "bg-blue-500" },
    { title: "My Classes", icon: UserGroupIcon, href: "/teacher/classes", color: "bg-green-500" },
    { title: "Assignments", icon: BookOpenIcon, href: "/teacher/assignments", color: "bg-purple-500" },
    { title: "Grade Students", icon: ChartBarIcon, href: "/teacher/grades", color: "bg-orange-500" },
    { title: "Announcements", icon: MegaphoneIcon, href: "/teacher/announcements", color: "bg-red-500" },
    { title: "Reports", icon: PresentationChartLineIcon, href: "/teacher/reports", color: "bg-indigo-500" },
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
      <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white">
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
              <h1 className="text-lg font-semibold">Teacher Portal</h1>
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
              <h2 className="text-xl font-bold">{teacher.name}</h2>
              <p className="text-white/90 text-sm">
                ID: {teacher.employeeId} • {teacher.subjects.join(", ")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.todayClasses}</p>
                <p className="text-gray-600 text-sm">Today's Classes</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                <p className="text-gray-600 text-sm">Total Students</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <BookOpenIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
                <p className="text-gray-600 text-sm">Pending Reviews</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.attendanceToday}</p>
                <p className="text-gray-600 text-sm">Attendance Today</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
            <Link to="/teacher/timetable" className="text-green-600 text-sm font-medium hover:text-green-700">
              View Full Timetable
            </Link>
          </div>

          <div className="space-y-4">
            {todaySchedule.map((period, index) => (
              <div
                key={period.id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="text-center min-w-[80px]">
                  <p className="text-green-600 font-semibold text-sm">{period.time}</p>
                  <p className="text-gray-500 text-xs">Period {period.period}</p>
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{period.subject}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPeriodTypeColor(period.type)}`}>
                      {period.type}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Class {period.class} • {period.room}
                  </p>
                  <p className="text-gray-500 text-xs">{period.studentsCount} students</p>
                </div>

                <Link
                  to={`/teacher/attendance/${period.id}`}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  Take Attendance
                </Link>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Announcements</h3>
            <Link to="/teacher/announcements" className="text-green-600 text-sm font-medium hover:text-green-700">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`border-l-4 ${getPriorityColor(announcement.priority)} p-4 rounded-lg`}
              >
                <div className="flex items-start space-x-3">
                  <MegaphoneIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{announcement.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{announcement.content}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{announcement.author}</span>
                      <span>•</span>
                      <span>{new Date(announcement.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="capitalize">{announcement.priority} priority</span>
                    </div>
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
          transition={{ delay: 0.6 }}
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
                <span className="font-semibold">Teacher Portal</span>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-2">
                <Link
                  to="/teacher/dashboard"
                  className="block px-3 py-2 rounded-lg bg-green-50 text-green-700 font-medium"
                >
                  Dashboard
                </Link>
                <Link to="/teacher/classes" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  My Classes
                </Link>
                <Link to="/teacher/attendance" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  Attendance
                </Link>
                <Link to="/teacher/assignments" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  Assignments
                </Link>
                <Link to="/teacher/grades" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  Grades
                </Link>
                <Link to="/teacher/timetable" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  Timetable
                </Link>
                <Link to="/teacher/profile" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
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

export default TeacherDashboard;

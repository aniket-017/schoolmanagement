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
  XMarkIcon,
  BellIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useTeacherAuth } from "../context/TeacherAuthContext";
import apiService from "../services/apiService";
import logo from "../assets/logo.jpeg";

// Skeleton loading component
const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
  </div>
);

const SkeletonSchedule = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
            <div className="h-2 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Data states
  const [timetableData, setTimetableData] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [studentStats, setStudentStats] = useState({
    attendanceRate: "NaN%",
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    totalDays: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState([]);

  const { user, logout } = useTeacherAuth();

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadRecentAttendance();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Make all API calls in parallel for better performance
      const promises = [];

      // Load student timetable (class timetable)
      if (user?.class?._id || user?.class) {
        const classId = user.class._id || user.class;
        promises.push(
          apiService.timetable.getClassTimetable(classId)
            .then(response => response.success ? response.data : null)
            .catch(error => {
              console.log("Timetable not available:", error.message);
              return null;
            })
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      // Load today's attendance with better error handling
      if (user?._id || user?.id) {
        const today = new Date();
        const studentId = user._id || user.id;
        promises.push(
          apiService.attendance.getStudentAttendance(studentId, {
            startDate: today.toISOString().split("T")[0],
            endDate: today.toISOString().split("T")[0],
          })
            .then(response => {
              if (response.success && response.data?.attendance?.length > 0) {
                return response.data.attendance[0];
              }
              // Return default attendance data if no records exist
              return {
                status: "not_marked",
                date: today.toISOString().split("T")[0],
                timeIn: null,
                timeOut: null,
                remarks: "Attendance not marked yet"
              };
            })
            .catch(error => {
              console.log("Today's attendance not available:", error.message);
              // Return default attendance data on error
              return {
                status: "not_marked",
                date: today.toISOString().split("T")[0],
                timeIn: null,
                timeOut: null,
                remarks: "Attendance not marked yet"
              };
            })
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      // Load announcements for student
      const userId = user?._id || user?.id;
      if (userId) {
        promises.push(
          apiService.announcements.getAnnouncementsForStudent(userId, {
            activeOnly: true,
            limit: 5,
          })
            .then(response => response.success ? response.data || [] : [])
            .catch(error => {
              console.log("Announcements not available:", error.message);
              // Fallback to regular announcements
              return apiService.announcements.getTeacherAnnouncements({
                activeOnly: true,
                limit: 5,
              })
                .then(response => response.success ? response.data || [] : [])
                .catch(fallbackError => {
                  console.log("General announcements not available:", fallbackError.message);
                  return [];
                });
            })
        );
      } else {
        promises.push(Promise.resolve([]));
      }

      // Fetch monthly attendance stats with better error handling
      if (user?._id || user?.id) {
        const today = new Date();
        promises.push(
          apiService.attendance.getStudentAttendance(user._id || user.id, {
            month: today.getMonth() + 1,
            year: today.getFullYear(),
          })
            .then(response => {
              if (response.success && response.data?.statistics) {
                return {
                  attendanceRate: (response.data.statistics.attendancePercentage || 0) + "%",
                  presentDays: response.data.statistics.presentDays || 0,
                  absentDays: response.data.statistics.absentDays || 0,
                  lateDays: response.data.statistics.lateDays || 0,
                  totalDays: response.data.statistics.totalDays || 0,
                };
              } else {
                // Return default stats if no attendance records exist
                return {
                  attendanceRate: "0%",
                  presentDays: 0,
                  absentDays: 0,
                  lateDays: 0,
                  totalDays: 0,
                };
              }
            })
            .catch(error => {
              console.log("Monthly stats not available:", error.message);
              // Return default stats on error
              return {
                attendanceRate: "0%",
                presentDays: 0,
                absentDays: 0,
                lateDays: 0,
                totalDays: 0,
              };
            })
        );
      } else {
        promises.push(Promise.resolve({
          attendanceRate: "0%",
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
          totalDays: 0,
        }));
      }

      // Wait for all promises to resolve
      const [timetableData, todayAttendance, announcements, studentStats] = await Promise.all(promises);

      // Set state with all data at once
      setTimetableData(timetableData);
      setTodayAttendance(todayAttendance);
      setAnnouncements(announcements);
      setStudentStats(studentStats);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Set default values on complete failure
      setTimetableData(null);
      setTodayAttendance({
        status: "not_marked",
        date: new Date().toISOString().split("T")[0],
        timeIn: null,
        timeOut: null,
        remarks: "Unable to load attendance data"
      });
      setAnnouncements([]);
      setStudentStats({
        attendanceRate: "0%",
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        totalDays: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadRecentAttendance = async () => {
    try {
      if (user?.id) {
        const today = new Date();
        const response = await apiService.attendance.getStudentAttendance(user.id, {
          month: today.getMonth() + 1,
          year: today.getFullYear(),
        });
        if (response.success && response.data?.attendance) {
          setRecentAttendance(response.data.attendance.slice(0, 7));
        } else {
          // Set empty array if no attendance records exist
          setRecentAttendance([]);
        }
      }
    } catch (error) {
      console.log("Recent attendance not available:", error.message);
      // Set empty array on error
      setRecentAttendance([]);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getTodaySchedule = () => {
    if (!timetableData?.weeklyTimetable) {
      return [];
    }

    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return timetableData.weeklyTimetable[today] || [];
  };

  const getAttendanceColor = (status) => {
    switch (status) {
      case "present":
        return "text-green-600 bg-green-50";
      case "absent":
        return "text-red-600 bg-red-50";
      case "late":
        return "text-yellow-600 bg-yellow-50";
      case "not_marked":
        return "text-gray-600 bg-gray-50";
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
      case "not_marked":
        return ClockIcon;
      default:
        return ClockIcon;
    }
  };

  const getPeriodTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "theory":
        return "bg-blue-100 text-blue-800";
      case "practical":
        return "bg-green-100 text-green-800";
      case "lab":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

  const quickActions = [
    { title: "Attendance", icon: CalendarIcon, href: "/student/attendance", color: "bg-blue-500" },
    { title: "Announcements", icon: MegaphoneIcon, href: "/student/announcements", color: "bg-green-500" },
    { title: "Timetable", icon: ClockIcon, href: "/student/timetable", color: "bg-orange-500" },
    { title: "Annual Calendar", icon: CalendarIcon, href: "/student/annual-calendar", color: "bg-purple-500" },
    { title: "Profile", icon: UserIcon, href: "/student/profile", color: "bg-blue-600" },
  ];



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex items-center justify-between p-4">
            <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse"></div>
            <div className="w-20 h-8 bg-white/10 rounded animate-pulse"></div>
            <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse"></div>
          </div>
          <div className="px-4 pb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-3 bg-white/20 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-5 bg-white/20 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="px-4 py-6 space-y-6 pb-24">
          <SkeletonSchedule />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonCard />
          <div className="grid grid-cols-1 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (mobileView) {
    // Mobile View - Exact match to React Native app
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header - Matching the screenshots */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3">
              <img src={logo} alt="Logo" className="h-8 w-auto" />
            </div>

            <button onClick={handleLogout} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <ArrowLeftOnRectangleIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Welcome Section - Exactly like the screenshots */}
          <div className="px-4 pb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <p className="text-white/80 text-sm">Welcome back,</p>
                <h2 className="text-lg font-bold text-white">{user?.name?.toUpperCase() || "STUDENT"}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 space-y-6 pb-24">
          {/* Today's Schedule - Exact match */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm"
                onClick={() => window.location.href = '/student/timetable'}
              >
                View Full
              </button>
            </div>

            {getTodaySchedule().length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No classes scheduled for today</p>
                <p className="text-gray-400 text-sm">
                  Your timetable is loaded but no classes are scheduled for today.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {getTodaySchedule()
                  .slice(0, 3)
                  .map((period, index) => (
                    <div key={period.id || index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center min-w-[80px]">
                        <p className="text-blue-600 font-semibold text-sm">
                          {period.time || `${9 + index}:00 - ${10 + index}:00`}
                        </p>
                        <p className="text-gray-500 text-xs">Period {period.period || index + 1}</p>
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {period.subject?.name || `Subject ${index + 1}`}
                        </h4>
                        <p className="text-gray-600 text-sm">{period.teacher?.name || "Teacher"}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-gray-500 text-xs">{period.room || `Room ${101 + index}`}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPeriodTypeColor(
                              period.type || "theory"
                            )}`}
                          >
                            {period.type || "theory"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>

          {/* Recent Announcements - Exact match */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Announcements</h3>
              <button className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-1" onClick={() => window.location.href = '/student/announcements'}>
                <MegaphoneIcon className="w-4 h-4" />
                <span>View All</span>
              </button>
            </div>

            {announcements.length === 0 ? (
              <div className="text-center py-8">
                <MegaphoneIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No recent announcements</p>
                <p className="text-gray-400 text-sm">Check back later for updates</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.slice(0, 3).map((announcement, index) => (
                  <div key={announcement._id || index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <BellIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                        {announcement.title}
                      </h4>
                      <p className="text-gray-600 text-xs line-clamp-2 mt-1">
                        {announcement.content}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{announcement.createdBy?.name || "Class Teacher"}</span>
                        <span>{announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString() : ""}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Today's Attendance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
              <button className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-1" onClick={() => window.location.href = '/student/attendance'}>
                <CalendarIcon className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>

            {todayAttendance ? (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div
                  className={`w-3 h-3 rounded-full ${
                    todayAttendance.status === "present"
                      ? "bg-green-500"
                      : todayAttendance.status === "absent"
                      ? "bg-red-500"
                      : todayAttendance.status === "late"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                ></div>
                <div>
                  <p
                    className={`font-semibold capitalize ${
                      todayAttendance.status === "present"
                        ? "text-green-600"
                        : todayAttendance.status === "absent"
                        ? "text-red-600"
                        : todayAttendance.status === "late"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {todayAttendance.status}
                  </p>
                  <p className="text-gray-600 text-sm">Time In: {todayAttendance.timeIn || "N/A"}</p>
                  {todayAttendance.remarks && <p className="text-gray-500 text-xs">Remarks: {todayAttendance.remarks}</p>}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No attendance record found</p>
                <p className="text-gray-400 text-sm">Attendance may not have been marked for this date</p>
              </div>
            )}
          </motion.div>

          {/* Quick Actions Grid - Matching attendance page mobile view */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={action.title}
                  to={action.href}
                  className="flex flex-col items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
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

          {/* Recent Attendance Section - REMOVED */}
        </div>



        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
              <div className="p-4 border-b bg-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Student Portal</span>
                  <button onClick={() => setSidebarOpen(false)}>
                    <XMarkIcon className="w-6 h-6" />
                  </button>
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
                  <Link to="/student/announcements" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                    Announcements
                  </Link>
                  <Link to="/student/timetable" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                    Timetable
                  </Link>
                  <Link to="/student/annual-calendar" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                    Annual Calendar
                  </Link>
                  <Link to="/student/profile" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                    Profile
                  </Link>
                  
                  {/* Logout Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 font-medium"
                    >
                      <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
  }

  // Desktop View
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src={logo} alt="Logo" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <BellIcon className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <button onClick={handleLogout} className="text-sm text-gray-700 hover:text-gray-900">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
              <Link to="/student/timetable" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View Full Schedule
              </Link>
            </div>

            {getTodaySchedule().length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No classes scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getTodaySchedule().map((period, index) => (
                  <div key={period.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-blue-600">
                          {period.time || `${9 + index}:00-${10 + index}:00`}
                        </p>
                        <p className="text-xs text-gray-500">Period {period.period || index + 1}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{period.subject?.name || `Subject ${index + 1}`}</h4>
                        <p className="text-sm text-gray-600">
                          {period.teacher?.name || "Teacher"} • {period.room || `Room ${101 + index}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Attendance + Monthly Stats */}
          <div className="space-y-6">
            {/* Today's Attendance */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
                <Link to="/student/attendance" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Details
                </Link>
              </div>

              {todayAttendance ? (
                <div className="flex items-center space-x-4">
                  {React.createElement(getAttendanceIcon(todayAttendance.status), {
                    className: `w-8 h-8 ${getAttendanceColor(todayAttendance.status).split(" ")[0]}`,
                  })}
                  <div>
                    <p className={`font-semibold capitalize ${getAttendanceColor(todayAttendance.status)}`}>
                      {todayAttendance.status}
                    </p>
                    <p className="text-gray-600 text-sm">Time In: {todayAttendance.timeIn || "N/A"}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CalendarIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No attendance marked for today</p>
                </div>
              )}
            </div>

            {/* Monthly Attendance Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">This Month's Attendance</h3>

              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600">{studentStats.attendanceRate}</div>
                <p className="text-gray-600">Attendance Rate</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900">{studentStats.presentDays}</p>
                  <p className="text-gray-600 text-sm">PRESENT</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900">{studentStats.absentDays}</p>
                  <p className="text-gray-600 text-sm">ABSENT</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900">{studentStats.lateDays}</p>
                  <p className="text-gray-600 text-sm">LATE</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900">{studentStats.totalDays}</p>
                  <p className="text-gray-600 text-sm">TOTAL DAYS</p>
                </div>
              </div>
            </div>

            {/* Recent Attendance Section - REMOVED */}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Announcements</h3>
            <Link to="/student/announcements" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {announcements.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <MegaphoneIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent announcements</p>
              </div>
            ) : (
              announcements.map((announcement, index) => (
                <div
                  key={announcement._id || index}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <h4 className="font-medium text-gray-900 mb-2">{announcement.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{announcement.content || announcement.message}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>By {announcement.createdBy?.name || "School Administrator"}</span>
                    <span className="mx-2">•</span>
                    <span>
                      {announcement.createdAt
                        ? new Date(announcement.createdAt).toLocaleDateString()
                        : new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions for Desktop */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                to={action.href}
                className="flex flex-col items-center p-6 rounded-lg border border-gray-200 hover:shadow-md transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center">{action.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal for Desktop */}
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

export default StudentDashboard;

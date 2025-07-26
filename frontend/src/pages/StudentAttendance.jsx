import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, CalendarIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { useTeacherAuth } from "../context/TeacherAuthContext";
import apiService from "../services/apiService";

const StudentAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState({
    attendanceRate: "NaN%",
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    totalDays: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
      loadAttendanceData();
    }
    // eslint-disable-next-line
  }, [user, selectedDate]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        // Fetch today's attendance
        try {
          const dateStr = selectedDate.toISOString().split("T")[0];
          const attendanceResponse = await apiService.attendance.getStudentAttendance(user.id, {
            startDate: dateStr,
            endDate: dateStr,
          });
          if (attendanceResponse.success && attendanceResponse.data?.attendance?.length > 0) {
            setAttendanceData(attendanceResponse.data.attendance[0]);
          } else {
            setAttendanceData(null);
          }
        } catch (error) {
          setAttendanceData(null);
        }

        // Fetch this month's stats
        try {
          const today = new Date();
          const monthlyResponse = await apiService.attendance.getStudentAttendance(user.id, {
            month: today.getMonth() + 1,
            year: today.getFullYear(),
          });
          if (monthlyResponse.success && monthlyResponse.data?.statistics) {
            setMonthlyStats({
              attendanceRate: (monthlyResponse.data.statistics.attendancePercentage || 0) + "%",
              presentDays: monthlyResponse.data.statistics.presentDays || 0,
              absentDays: monthlyResponse.data.statistics.absentDays || 0,
              lateDays: monthlyResponse.data.statistics.lateDays || 0,
              totalDays: monthlyResponse.data.statistics.totalDays || 0,
            });
          } else {
            setMonthlyStats({
              attendanceRate: "0%",
              presentDays: 0,
              absentDays: 0,
              lateDays: 0,
              totalDays: 0,
            });
          }
        } catch (error) {
          setMonthlyStats({
            attendanceRate: "0%",
            presentDays: 0,
            absentDays: 0,
            lateDays: 0,
            totalDays: 0,
          });
        }
      }
    } catch (error) {
      setAttendanceData(null);
      setMonthlyStats({
        attendanceRate: "0%",
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        totalDays: 0,
      });
    } finally {
      setLoading(false);
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



  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Add a ref for the recent section
  const recentSectionRef = React.useRef(null);

  // Helper to scroll to recent section
  const handleViewDetails = () => {
    if (recentSectionRef.current) {
      recentSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (mobileView) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header - Matching screenshots */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex items-center p-4">
            <Link to="/student/dashboard" className="p-2 -ml-2">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <h1 className="text-lg font-semibold text-center flex-1">Attendance</h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 space-y-6 pb-24">
          {/* Today's Attendance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-1"
                onClick={handleViewDetails}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>

            {attendanceData ? (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div
                  className={`w-3 h-3 rounded-full ${
                    attendanceData.status === "present"
                      ? "bg-green-500"
                      : attendanceData.status === "absent"
                      ? "bg-red-500"
                      : attendanceData.status === "late"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                ></div>
                <div>
                  <p
                    className={`font-semibold capitalize ${
                      attendanceData.status === "present"
                        ? "text-green-600"
                        : attendanceData.status === "absent"
                        ? "text-red-600"
                        : attendanceData.status === "late"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {attendanceData.status}
                  </p>
                  <p className="text-gray-600 text-sm">Time In: {attendanceData.timeIn || "N/A"}</p>
                  {attendanceData.remarks && <p className="text-gray-500 text-xs">Remarks: {attendanceData.remarks}</p>}
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

          {/* This Month's Attendance - Exact match to screenshots */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">This Month's Attendance</h3>

            {/* Attendance Rate - Large display like in screenshots */}
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-blue-600 mb-2">{monthlyStats.attendanceRate}</div>
              <p className="text-gray-600 text-lg">Attendance Rate</p>
            </div>

            {/* Stats Grid - Exactly like screenshots */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">{monthlyStats.presentDays}</p>
                <p className="text-gray-600 text-sm font-medium">PRESENT</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">{monthlyStats.absentDays}</p>
                <p className="text-gray-600 text-sm font-medium">ABSENT</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">{monthlyStats.lateDays}</p>
                <p className="text-gray-600 text-sm font-medium">LATE</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">{monthlyStats.totalDays}</p>
                <p className="text-gray-600 text-sm font-medium">TOTAL DAYS</p>
              </div>
            </div>
          </motion.div>

          {/* Recent Attendance Section */}
          <motion.div
            ref={recentSectionRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Attendance</h3>
            {monthlyStats && Array.isArray(monthlyStats.attendance) && monthlyStats.attendance.length > 0 ? (
              <div className="space-y-4">
                {monthlyStats.attendance.slice(0, 7).map((record, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex flex-col items-center w-16">
                      <span className="text-xl font-bold text-blue-600">
                        {new Date(record.date).getDate()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(record.date).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="font-semibold text-gray-900">
                        {new Date(record.date).toLocaleDateString("en-US", { weekday: "long" })}
                      </div>
                      <div className="text-sm text-gray-600">
                        {record.timeIn ? `Time In: ${record.timeIn}` : "No time recorded"}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`font-bold capitalize ${
                        record.status === "present"
                          ? "text-green-600"
                          : record.status === "absent"
                          ? "text-red-600"
                          : record.status === "late"
                          ? "text-yellow-600"
                          : "text-gray-600"
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No recent attendance records found.</div>
            )}
          </motion.div>
        </div>


      </div>
    );
  }

  // Desktop View
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/student/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Attendance */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-1"
                onClick={handleViewDetails}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
            {attendanceData ? (
              <div className="flex items-center space-x-4">
                <div
                  className={`w-4 h-4 rounded-full ${
                    attendanceData.status === "present"
                      ? "bg-green-500"
                      : attendanceData.status === "absent"
                      ? "bg-red-500"
                      : attendanceData.status === "late"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                ></div>
                <div>
                  <p
                    className={`font-semibold capitalize ${
                      attendanceData.status === "present"
                        ? "text-green-600"
                        : attendanceData.status === "absent"
                        ? "text-red-600"
                        : attendanceData.status === "late"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {attendanceData.status}
                  </p>
                  <p className="text-gray-600 text-sm">Time In: {attendanceData.timeIn || "N/A"}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No attendance record found</p>
              </div>
            )}
          </div>

          {/* Monthly Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">This Month's Attendance</h3>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-blue-600">{monthlyStats.attendanceRate}</div>
              <p className="text-gray-600">Attendance Rate</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold text-gray-900">{monthlyStats.presentDays}</p>
                <p className="text-gray-600 text-sm">PRESENT</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold text-gray-900">{monthlyStats.absentDays}</p>
                <p className="text-gray-600 text-sm">ABSENT</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold text-gray-900">{monthlyStats.lateDays}</p>
                <p className="text-gray-600 text-sm">LATE</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold text-gray-900">{monthlyStats.totalDays}</p>
                <p className="text-gray-600 text-sm">TOTAL DAYS</p>
              </div>
            </div>
          </div>
        </div>
        {/* Recent Attendance Section */}
        <div ref={recentSectionRef} className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Attendance</h3>
          {monthlyStats && Array.isArray(monthlyStats.attendance) && monthlyStats.attendance.length > 0 ? (
            <div className="space-y-4">
              {monthlyStats.attendance.slice(0, 7).map((record, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex flex-col items-center w-16">
                    <span className="text-xl font-bold text-blue-600">
                      {new Date(record.date).getDate()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(record.date).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="font-semibold text-gray-900">
                      {new Date(record.date).toLocaleDateString("en-US", { weekday: "long" })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {record.timeIn ? `Time In: ${record.timeIn}` : "No time recorded"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`font-bold capitalize ${
                      record.status === "present"
                        ? "text-green-600"
                        : record.status === "absent"
                        ? "text-red-600"
                        : record.status === "late"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No recent attendance records found.</div>
          )}
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

export default StudentAttendance;

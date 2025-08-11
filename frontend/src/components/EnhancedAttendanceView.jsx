import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Download, Users, TrendingUp, BarChart3, Activity } from "lucide-react";
import { toast } from "react-toastify";
import appConfig from "../config/environment";
import StudentAttendancePeriodModal from "./StudentAttendancePeriodModal";

const EnhancedAttendanceView = ({ classId, className }) => {
  const [viewType, setViewType] = useState("week"); // week, month, year
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentPeriodModal, setShowStudentPeriodModal] = useState(false);

  useEffect(() => {
    // Set default current period based on view type
    const now = new Date();
    if (viewType === "week") {
      const year = now.getFullYear();
      const weekNum = getWeekNumber(now);
      setCurrentPeriod(`${year}-W${weekNum.toString().padStart(2, "0")}`);
    } else if (viewType === "month") {
      setCurrentPeriod(`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`);
    } else if (viewType === "year") {
      setCurrentPeriod(now.getFullYear().toString());
    }
  }, [viewType]);

  useEffect(() => {
    if (currentPeriod) {
      fetchAttendanceSummary();
    }
    // eslint-disable-next-line
  }, [currentPeriod, viewType]);

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  const fetchAttendanceSummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let queryParams = new URLSearchParams({ period: viewType });

      if (viewType === "week") {
        queryParams.append("week", currentPeriod);
      } else if (viewType === "month") {
        const [year, month] = currentPeriod.split("-");
        queryParams.append("year", year);
        queryParams.append("month", month);
      } else if (viewType === "year") {
        queryParams.append("year", currentPeriod);
      }

      const res = await fetch(`${appConfig.API_BASE_URL}/attendance/class-summary/${classId}?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setAttendanceSummary(data.data);
      } else {
        toast.error(data.message || "Failed to fetch attendance summary");
        setAttendanceSummary(null);
      }
    } catch (error) {
      console.error("Fetch attendance summary error:", error);
      toast.error("Error fetching attendance summary");
      setAttendanceSummary(null);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "text-green-600 bg-green-100";
      case "absent":
        return "text-red-600 bg-red-100";
      case "late":
        return "text-yellow-600 bg-yellow-100";
      case "leave":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const exportToCSV = () => {
    if (!attendanceSummary) return;

    // Sort students by roll number for consistent ordering
    const sortedStudents = [...attendanceSummary.students].sort((a, b) => {
      const rollA = a.student.rollNumber || "";
      const rollB = b.student.rollNumber || "";

      // If both are numbers, sort numerically
      if (!isNaN(rollA) && !isNaN(rollB)) {
        return parseInt(rollA) - parseInt(rollB);
      }

      // Otherwise, sort alphabetically
      return rollA.toString().localeCompare(rollB.toString());
    });

    const csvData = [
      ["Roll Number", "Student Name", "Present", "Absent", "Late", "Leave", "Total Days", "Attendance %"],
      ...sortedStudents.map((student) => [
        student.student.rollNumber || "N/A",
        student.student.name,
        student.present,
        student.absent,
        student.late,
        student.leave,
        student.total,
        `${student.attendancePercentage}%`,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${className}_attendance_${attendanceSummary.period.replace(/\s+/g, "_")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const navigatePeriod = (direction) => {
    if (viewType === "week") {
      const [year, weekStr] = currentPeriod.split("-W");
      const weekNum = parseInt(weekStr);
      const newWeek = direction === "prev" ? weekNum - 1 : weekNum + 1;

      if (newWeek < 1) {
        setCurrentPeriod(`${parseInt(year) - 1}-W52`);
      } else if (newWeek > 52) {
        setCurrentPeriod(`${parseInt(year) + 1}-W01`);
      } else {
        setCurrentPeriod(`${year}-W${newWeek.toString().padStart(2, "0")}`);
      }
    } else if (viewType === "month") {
      const [year, month] = currentPeriod.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      date.setMonth(date.getMonth() + (direction === "prev" ? -1 : 1));
      setCurrentPeriod(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`);
    } else if (viewType === "year") {
      const year = parseInt(currentPeriod);
      setCurrentPeriod((year + (direction === "prev" ? -1 : 1)).toString());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Enhanced Attendance View</h3>
        </div>

        <div className="flex items-center gap-4">
          {/* View Type Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {["week", "month", "year"].map((type) => (
              <button
                key={type}
                onClick={() => setViewType(type)}
                className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                  viewType === type ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Period Navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigatePeriod("prev")}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              disabled={loading}
            >
              ←
            </button>
            <div className="text-sm font-medium text-gray-900 min-w-[120px] text-center">
              {attendanceSummary?.period || "Loading..."}
            </div>
            <button
              onClick={() => navigatePeriod("next")}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              disabled={loading}
            >
              →
            </button>
          </div>

          {/* Export Button */}
          {attendanceSummary && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading attendance data...</span>
        </div>
      ) : attendanceSummary ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Students</p>
                  <p className="text-2xl font-bold text-blue-900">{attendanceSummary.summary.totalStudents}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-green-50 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Present</p>
                  <p className="text-2xl font-bold text-green-900">{attendanceSummary.summary.totalPresent}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-red-50 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-red-600 font-medium">Absent</p>
                  <p className="text-2xl font-bold text-red-900">{attendanceSummary.summary.totalAbsent}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-yellow-50 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Late</p>
                  <p className="text-2xl font-bold text-yellow-900">{attendanceSummary.summary.totalLate}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-purple-50 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Overall Rate</p>
                  <p
                    className={`text-2xl font-bold ${getAttendanceColor(
                      attendanceSummary.summary.overallAttendancePercentage
                    )}`}
                  >
                    {attendanceSummary.summary.overallAttendancePercentage}%
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Students Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">
                Student Attendance Details - {attendanceSummary.period}
              </h4>
              <p className="text-sm text-gray-600 mt-1">Working days in this period: {attendanceSummary.workingDays}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Present
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Absent
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Late
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceSummary.students.map((studentData, index) => (
                    <tr
                      key={studentData.student._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedStudent(studentData.student);
                        setShowStudentPeriodModal(true);
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {studentData.student.rollNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {studentData.student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {studentData.present}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          {studentData.absent}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {studentData.late}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {studentData.leave}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`text-sm font-semibold ${getAttendanceColor(studentData.attendancePercentage)}`}
                        >
                          {studentData.attendancePercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {attendanceSummary.students.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No attendance data available for this period.</p>
              </div>
            )}
          </motion.div>
          {/* Student period modal */}
          <StudentAttendancePeriodModal
            isOpen={showStudentPeriodModal}
            onClose={() => setShowStudentPeriodModal(false)}
            student={selectedStudent}
            viewType={viewType}
            currentPeriod={currentPeriod}
          />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No attendance data available for the selected period.</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedAttendanceView;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useTeacherAuth } from '../context/TeacherAuthContext';
import apiService from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const TeacherAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    leave: 0,
    unmarked: 0,
  });
  const { user } = useTeacherAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadTeacherClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadClassStudents();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && students.length > 0) {
      loadExistingAttendance();
    }
  }, [selectedClass, selectedDate, students.length]);

  const loadTeacherClasses = async () => {
    try {
      setLoading(true);
      const response = await apiService.attendance.getTeacherClasses();
      if (response.success) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClassStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.attendance.getClassStudents(selectedClass);
      
      if (response.success && response.data && response.data.students) {
        setStudents(response.data.students);
        // Initialize attendance data
        const initialAttendance = {};
        response.data.students.forEach((student) => {
          initialAttendance[student._id] = "unmarked";
        });
        setAttendanceData(initialAttendance);
        setSummary({
          total: response.data.students.length,
          present: 0,
          absent: 0,
          leave: 0,
          unmarked: response.data.students.length,
        });
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingAttendance = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      const dateString = selectedDate.toISOString().split("T")[0];
      const response = await apiService.attendance.getClassAttendanceByDate(selectedClass, dateString);
      if (response.success && response.data && response.data.attendance) {
        const existingData = {};
        response.data.attendance.forEach((item) => {
          if (item.student && item.student._id) {
            existingData[item.student._id] = item.status;
          }
        });
        setAttendanceData(existingData);
        if (response.data.summary) {
          setSummary(response.data.summary);
        }
      }
    } catch (error) {
      console.error('Error loading existing attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event) => {
    const newDate = new Date(event.target.value);
    setSelectedDate(newDate);
    if (selectedClass) {
      loadExistingAttendance();
    }
  };

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    setStudents([]);
    setAttendanceData({});
    setSummary({
      total: 0,
      present: 0,
      absent: 0,
      leave: 0,
      unmarked: 0,
    });
    
    // Load existing attendance for the selected date if class is selected
    if (classId) {
      // Use setTimeout to ensure state is updated before calling loadExistingAttendance
      setTimeout(() => {
        loadExistingAttendance();
      }, 100);
    }
  };

  const markAttendance = (studentId, status) => {
    const newAttendanceData = { ...attendanceData, [studentId]: status };
    setAttendanceData(newAttendanceData);

    // Update summary
    const newSummary = { ...summary };
    const oldStatus = attendanceData[studentId] || "unmarked";

    // Decrease old status count
    if (oldStatus !== "unmarked") {
      newSummary[oldStatus]--;
    } else {
      newSummary.unmarked--;
    }

    // Increase new status count
    if (status !== "unmarked") {
      newSummary[status]++;
    } else {
      newSummary.unmarked++;
    }

    setSummary(newSummary);
  };

  const saveAttendance = async () => {
    if (!selectedClass) {
      alert("Please select a class first.");
      return;
    }

    const markedStudents = Object.entries(attendanceData).filter(([_, status]) => status !== "unmarked");

    if (markedStudents.length === 0) {
      alert("Please mark attendance for at least one student.");
      return;
    }

    try {
      setSaving(true);
      const dateString = selectedDate.toISOString().split("T")[0];

      // Convert to the format expected by the API
      const attendancePayload = {};
      markedStudents.forEach(([studentId, status]) => {
        attendancePayload[studentId] = {
          status,
          markedBy: user.id,
          attendanceType: "daily",
        };
      });

      const response = await apiService.attendance.bulkMarkClassAttendance(
        selectedClass,
        dateString,
        attendancePayload
      );

      if (response.success) {
        // Show success message
        const successMessage = `✅ Attendance saved successfully!\n\n📊 Marked attendance for ${markedStudents.length} students.\n📅 Date: ${formatDate(selectedDate)}\n🏫 Class: ${classes.find(c => c._id === selectedClass)?.fullName || 'Selected Class'}`;
        alert(successMessage);
        // Refresh the attendance data
        loadExistingAttendance();
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error saving attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "text-green-600 bg-green-50";
      case "absent":
        return "text-red-600 bg-red-50";
      case "leave":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return CheckCircleIcon;
      case "absent":
        return XCircleIcon;
      case "leave":
        return ClockIcon;
      default:
        return ClockIcon;
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Back navigation handler
  const handleBack = () => {
    navigate('/teacher/dashboard');
  };

  if (loading && classes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Mobile Back Button */}
          {mobileView && (
            <div className="flex items-center mb-2">
              <button
                onClick={handleBack}
                className="flex items-center text-white hover:text-blue-100 transition-colors p-2"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold mb-1">Attendance Management</h1>
            <p className="text-blue-100 text-sm">Mark daily attendance for your classes</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Date Selection */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Select Date</h3>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={handleDateChange}
                max={new Date().toISOString().split('T')[0]}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">{formatDate(selectedDate)}</p>
          </div>

          {/* Class Selection */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Select Class</h3>
            <div className="relative">
              <select
                value={selectedClass || ""}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm sm:text-base"
                disabled={loading}
              >
                <option value="">Select a class...</option>
                {classes.map((classItem) => (
                  <option key={classItem._id} value={classItem._id}>
                    {classItem.fullName}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
            </div>
            {loading && (
              <div className="mt-2 flex items-center text-xs sm:text-sm text-gray-600">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading students...
              </div>
            )}
            
            {/* Mobile Quick Actions */}
            {selectedClass && students.length > 0 && (
              <div className="mt-4 sm:hidden">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const newAttendanceData = {};
                      students.forEach(student => {
                        newAttendanceData[student._id] = "present";
                      });
                      setAttendanceData(newAttendanceData);
                      setSummary({
                        total: students.length,
                        present: students.length,
                        absent: 0,
                        leave: 0,
                        unmarked: 0,
                      });
                    }}
                    className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                  >
                    All Present
                  </button>
                  <button
                    onClick={() => {
                      const newAttendanceData = {};
                      students.forEach(student => {
                        newAttendanceData[student._id] = "absent";
                      });
                      setAttendanceData(newAttendanceData);
                      setSummary({
                        total: students.length,
                        present: 0,
                        absent: students.length,
                        leave: 0,
                        unmarked: 0,
                      });
                    }}
                    className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                  >
                    All Absent
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Students List */}
          {students.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Mark Attendance</h3>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <span className="text-xs sm:text-sm text-gray-600">
                    {students.length} student{students.length !== 1 ? "s" : ""} in class
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <button
                    onClick={() => {
                      const newAttendanceData = {};
                      students.forEach(student => {
                        newAttendanceData[student._id] = "present";
                      });
                      setAttendanceData(newAttendanceData);
                      setSummary({
                        total: students.length,
                        present: students.length,
                        absent: 0,
                        leave: 0,
                        unmarked: 0,
                      });
                    }}
                    className="px-2 py-1 sm:px-3 sm:py-1 bg-green-100 text-green-700 rounded-lg text-xs sm:text-sm hover:bg-green-200 transition-colors"
                  >
                    Mark All Present
                  </button>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {students.map((student, index) => {
                  const StatusIcon = getStatusIcon(attendanceData[student._id] || "unmarked");
                  const currentStatus = attendanceData[student._id] || "unmarked";
                  return (
                    <motion.div
                      key={student._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-3 sm:p-4 border rounded-lg transition-all duration-200 ${
                        currentStatus === "present"
                          ? "border-green-200 bg-green-50"
                          : currentStatus === "absent"
                          ? "border-red-200 bg-red-50"
                          : currentStatus === "leave"
                          ? "border-yellow-200 bg-yellow-50"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          currentStatus === "present"
                            ? "bg-green-100"
                            : currentStatus === "absent"
                            ? "bg-red-100"
                            : currentStatus === "leave"
                            ? "bg-yellow-100"
                            : "bg-blue-100"
                        }`}>
                          <span className={`font-semibold text-xs sm:text-sm ${
                            currentStatus === "present"
                              ? "text-green-600"
                              : currentStatus === "absent"
                              ? "text-red-600"
                              : currentStatus === "leave"
                              ? "text-yellow-600"
                              : "text-blue-600"
                          }`}>
                            {student.rollNumber || student.name?.charAt(0) || "S"}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{student.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">Roll: {student.rollNumber || "N/A"}</p>
                          {/* Mobile status indicator */}
                          <div className="sm:hidden mt-1">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              currentStatus === "present"
                                ? "bg-green-100 text-green-700"
                                : currentStatus === "absent"
                                ? "bg-red-100 text-red-700"
                                : currentStatus === "leave"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {currentStatus === "present" ? "Present" : 
                               currentStatus === "absent" ? "Absent" : 
                               currentStatus === "leave" ? "Leave" : "Unmarked"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          onClick={() => markAttendance(student._id, "present")}
                          className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                            currentStatus === "present"
                              ? "bg-green-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
                          }`}
                          title="Mark Present"
                        >
                          <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => markAttendance(student._id, "absent")}
                          className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                            currentStatus === "absent"
                              ? "bg-red-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600"
                          }`}
                          title="Mark Absent"
                        >
                          <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => markAttendance(student._id, "leave")}
                          className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                            currentStatus === "leave"
                              ? "bg-yellow-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-400 hover:bg-yellow-100 hover:text-yellow-600"
                          }`}
                          title="Mark Leave"
                        >
                          <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary */}
          {students.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Attendance Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                <motion.div 
                  className="text-center p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-lg sm:text-2xl font-bold text-green-600">{summary.present}</div>
                  <div className="text-xs sm:text-sm text-green-700 font-medium">Present</div>
                  <div className="text-xs text-green-600 mt-1">
                    {summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0}%
                  </div>
                </motion.div>
                <motion.div 
                  className="text-center p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-lg sm:text-2xl font-bold text-red-600">{summary.absent}</div>
                  <div className="text-xs sm:text-sm text-red-700 font-medium">Absent</div>
                  <div className="text-xs text-red-600 mt-1">
                    {summary.total > 0 ? Math.round((summary.absent / summary.total) * 100) : 0}%
                  </div>
                </motion.div>
                <motion.div 
                  className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-lg sm:text-2xl font-bold text-yellow-600">{summary.leave}</div>
                  <div className="text-xs sm:text-sm text-yellow-700 font-medium">Leave</div>
                  <div className="text-xs text-yellow-600 mt-1">
                    {summary.total > 0 ? Math.round((summary.leave / summary.total) * 100) : 0}%
                  </div>
                </motion.div>
                <motion.div 
                  className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-lg sm:text-2xl font-bold text-gray-600">{summary.unmarked}</div>
                  <div className="text-xs sm:text-sm text-gray-700 font-medium">Unmarked</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {summary.total > 0 ? Math.round((summary.unmarked / summary.total) * 100) : 0}%
                  </div>
                </motion.div>
              </div>
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs sm:text-sm text-blue-800">
                  <span className="font-medium">Total:</span> {summary.total} | 
                  <span className="font-medium ml-1 sm:ml-2">Marked:</span> {summary.total - summary.unmarked} | 
                  <span className="font-medium ml-1 sm:ml-2">Rate:</span> {summary.total > 0 ? Math.round(((summary.total - summary.unmarked) / summary.total) * 100) : 0}%
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          {students.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm text-blue-800 font-medium">
                    Ready to save attendance for {summary.total - summary.unmarked} out of {summary.total} students
                  </span>
                </div>
              </div>
              <motion.button
                onClick={saveAttendance}
                disabled={saving || summary.unmarked === summary.total}
                className="w-full bg-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 sm:space-x-3 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl"
                whileHover={{ scale: summary.unmarked === summary.total ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base">Saving Attendance...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-sm sm:text-base">Save Attendance</span>
                  </>
                )}
              </motion.button>
              {summary.unmarked === summary.total && (
                <p className="text-center text-xs sm:text-sm text-gray-600 mt-2">
                  Please mark attendance for at least one student before saving
                </p>
              )}
            </div>
          )}

          {/* Empty State */}
          {!selectedClass && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-center">
              <UserGroupIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Select a Class</h3>
              <p className="text-xs sm:text-sm text-gray-600">Choose a class from the dropdown above to start marking attendance.</p>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Mobile Floating Action Button */}
      {students.length > 0 && (
        <div className="sm:hidden fixed bottom-6 right-6 z-50">
          <motion.button
            onClick={saveAttendance}
            disabled={saving || summary.unmarked === summary.total}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            whileHover={{ scale: summary.unmarked === summary.total ? 1 : 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {saving ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <CheckCircleIcon className="w-6 h-6" />
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance; 
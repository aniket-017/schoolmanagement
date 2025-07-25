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
} from '@heroicons/react/24/outline';
import { useTeacherAuth } from '../context/TeacherAuthContext';
import apiService from '../services/apiService';

const TeacherAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    leave: 0,
    unmarked: 0,
  });
  const { user } = useTeacherAuth();

  useEffect(() => {
    loadTeacherClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadClassStudents();
    }
  }, [selectedClass]);

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
        alert(`Attendance saved successfully!\n\nMarked attendance for ${markedStudents.length} students.`);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold mb-2">Attendance Management</h1>
            <p className="text-blue-100">Mark daily attendance for your classes</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Date Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
            <div className="flex items-center space-x-4">
              <CalendarIcon className="w-6 h-6 text-gray-400" />
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={handleDateChange}
                max={new Date().toISOString().split('T')[0]}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">{formatDate(selectedDate)}</p>
          </div>

          {/* Class Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Class</h3>
            <select
              value={selectedClass || ""}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Select a class...</option>
              {classes.map((classItem) => (
                <option key={classItem._id} value={classItem._id}>
                  {classItem.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Students List */}
          {students.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Mark Attendance</h3>
                <p className="text-sm text-gray-600">
                  {students.length} student{students.length !== 1 ? "s" : ""} in class
                </p>
              </div>

              <div className="space-y-4">
                {students.map((student, index) => {
                  const StatusIcon = getStatusIcon(attendanceData[student._id] || "unmarked");
                  return (
                    <motion.div
                      key={student._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {student.rollNumber || student.name?.charAt(0) || "S"}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{student.name}</h4>
                          <p className="text-sm text-gray-600">Roll: {student.rollNumber || "N/A"}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => markAttendance(student._id, "present")}
                          className={`p-2 rounded-lg transition-colors ${
                            attendanceData[student._id] === "present"
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600"
                          }`}
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => markAttendance(student._id, "absent")}
                          className={`p-2 rounded-lg transition-colors ${
                            attendanceData[student._id] === "absent"
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          }`}
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => markAttendance(student._id, "leave")}
                          className={`p-2 rounded-lg transition-colors ${
                            attendanceData[student._id] === "leave"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600"
                          }`}
                        >
                          <ClockIcon className="w-5 h-5" />
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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{summary.present}</div>
                  <div className="text-sm text-green-700">Present</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{summary.absent}</div>
                  <div className="text-sm text-red-700">Absent</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{summary.leave}</div>
                  <div className="text-sm text-yellow-700">Leave</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{summary.unmarked}</div>
                  <div className="text-sm text-gray-700">Unmarked</div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          {students.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <button
                onClick={saveAttendance}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Attendance</span>
                )}
              </button>
            </div>
          )}

          {/* Empty State */}
          {!selectedClass && (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Class</h3>
              <p className="text-gray-600">Choose a class from the dropdown above to start marking attendance.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherAttendance; 
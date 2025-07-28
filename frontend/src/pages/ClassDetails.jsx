import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Clock, Calendar, Plus, Upload, UserPlus, Download, Eye, Trash2, ChevronLeftIcon } from "lucide-react";
import Layout from "../components/Layout";
import { cn } from "../utils/cn";
import appConfig from "../config/environment";
import { toast } from "react-toastify";
import StudentDetailModal from "../components/StudentDetailModal";
import StudentEditModal from "../components/StudentEditModal";
import TimetableTab from "../components/TimetableTab";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TABS = [
  { id: "students", name: "Students", icon: Users },
  { id: "timetable", name: "Timetable", icon: Clock },
  { id: "attendance", name: "Attendance", icon: Calendar },
];

const ClassDetails = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("students");
  const [searchTerm, setSearchTerm] = useState("");

  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [uploadResults, setUploadResults] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  const [showStudentEditModal, setShowStudentEditModal] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    fetchClassDetails();
  }, [classId]);

  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendance();
    }
    // eslint-disable-next-line
  }, [attendanceDate, activeTab, classId]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const [classRes, studentsRes, teachersRes] = await Promise.all([
        fetch(`${appConfig.API_BASE_URL}/classes/${classId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${appConfig.API_BASE_URL}/classes/${classId}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${appConfig.API_BASE_URL}/users?role=teacher&status=approved`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const classData = await classRes.json();
      const studentsData = await studentsRes.json();
      const teachersData = await teachersRes.json();
      if (classData.success) setClassData(classData.data);
      if (studentsData.success) setStudents(studentsData.data || []);
      if (teachersData.success) setAvailableTeachers(teachersData.data || []);
    } catch (e) {
      toast.error("Error fetching class details");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    setAttendanceLoading(true);
    try {
      const token = localStorage.getItem("token");
      const dateString = attendanceDate.toISOString().split("T")[0];
      const res = await fetch(`${appConfig.API_BASE_URL}/attendance/class-attendance/${classId}/${dateString}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAttendanceSummary(data.data.summary);
        setAttendanceList(data.data.attendance);
      } else {
        setAttendanceSummary(null);
        setAttendanceList([]);
      }
    } catch (e) {
      setAttendanceSummary(null);
      setAttendanceList([]);
    }
    setAttendanceLoading(false);
  };

  // Filtering
  const filteredStudents = students.filter(
    (s) =>
      (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error("Please select a file");
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", uploadFile);

      const response = await fetch(`${appConfig.API_BASE_URL}/classes/${classId}/students/bulk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Successfully uploaded ${data.uploadedCount} students`);
        setShowBulkUploadModal(false);
        setUploadFile(null);
        fetchClassDetails();

        // Show detailed results if available
        if (data.results) {
          setUploadResults(data.results);
        }
      } else {
        toast.error(data.message || "Error uploading file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/classes/${classId}/students/excel-template`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "students_template.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Template downloaded successfully!");
      } else {
        toast.error("Error downloading template");
      }
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Error downloading template");
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!confirm("Are you sure you want to remove this student from the class?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${appConfig.API_BASE_URL}/classes/${classId}/students/${studentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Student removed successfully");
        fetchClassDetails();
      } else {
        toast.error(data.message || "Error removing student");
      }
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Error removing student");
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowStudentDetailModal(true);
  };

  const handleStudentEdit = (student) => {
    setSelectedStudent(student);
    setShowStudentEditModal(true);
    setShowStudentDetailModal(false);
  };

  const handleStudentSave = (updatedStudent) => {
    setStudents((prev) => prev.map((s) => (s._id === updatedStudent._id ? updatedStudent : s)));
  };

  // Back navigation handler
  const handleBack = () => {
    navigate('/teacher/dashboard');
  };

  // UI
  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {classData?.grade}
              {getOrdinalSuffix(classData?.grade)} Class - {classData?.division}
            </h1>
            <p className="text-gray-500">
                              {classData?.classTeacher ? 
                  `Teacher: ${classData.classTeacher.name || classData.classTeacher.fullName || [classData.classTeacher.firstName, classData.classTeacher.middleName, classData.classTeacher.lastName].filter(Boolean).join(" ") || classData.classTeacher.email}` 
                  : "No teacher assigned"}
            </p>
          </div>
          <div className="flex items-center space-x-10 mt-6 md:mt-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{students.length}</div>
              <div className="text-sm text-gray-500">Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">8</div>
              <div className="text-sm text-gray-500">Periods/Day</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{classData?.classroom || "N/A"}</div>
              <div className="text-sm text-gray-500">Classroom</div>
            </div>
          </div>
        </div>

        {/* Tabs and Actions */}
        <div className="bg-white rounded-2xl shadow p-4 mb-8 sticky top-0 z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    activeTab === tab.id ? "bg-white text-blue-600 shadow" : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[220px] bg-gray-50"
              />
              {activeTab === "students" && (
                <>
                  <button
                    onClick={() => navigate(`/admin/classes/${classId}/add-student`)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Student
                  </button>
                  <button
                    onClick={() => setShowBulkUploadModal(true)}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium shadow"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Upload
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "students" && (
            <div>
              {filteredStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm">
                  <Users className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-600 mb-2 text-lg">No students in this class</p>
                  <p className="text-gray-400 mb-6">Add students individually or upload in bulk.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Roll No
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mobile
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mother's Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.map((student, index) => (
                          <tr
                            key={student._id}
                            className={`${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } hover:bg-gray-100 cursor-pointer transition-colors`}
                            onClick={() => handleStudentClick(student)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                  {(student.firstName || student.name || "S").charAt(0)}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {student.firstName && student.lastName
                                      ? `${student.firstName} ${student.middleName ? student.middleName + " " : ""}${
                                          student.lastName
                                        }`.trim()
                                      : student.name || "N/A"}
                                  </div>
                                  <div className="text-sm text-gray-500">{student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.rollNumber || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.mobileNumber || student.phone || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.mothersName || student.mother?.name || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.studentId || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  student.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : student.status === "inactive"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {student.status || "active"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStudentClick(student);
                                }}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "timetable" && <TimetableTab classId={classId} classData={classData} />}
          {activeTab === "attendance" && (
            <div className="bg-white rounded-2xl shadow-sm p-8 w-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <label className="font-medium">Select Date:</label>
                  <DatePicker
                    selected={attendanceDate}
                    onChange={setAttendanceDate}
                    maxDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    className="border border-gray-200 rounded-lg px-3 py-2"
                  />
                  <button
                    onClick={fetchAttendance}
                    className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow"
                  >
                    Refresh
                  </button>
                </div>
                {attendanceSummary && (
                  <div className="flex gap-6 mt-4 md:mt-0">
                    <div>
                      <span className="font-bold text-green-600">{attendanceSummary.present}</span>
                      <span className="ml-1 text-gray-600">Present</span>
                    </div>
                    <div>
                      <span className="font-bold text-red-600">{attendanceSummary.absent}</span>
                      <span className="ml-1 text-gray-600">Absent</span>
                    </div>
                    <div>
                      <span className="font-bold text-yellow-600">{attendanceSummary.leave}</span>
                      <span className="ml-1 text-gray-600">Leave</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500">{attendanceSummary.unmarked}</span>
                      <span className="ml-1 text-gray-600">Unmarked</span>
                    </div>
                  </div>
                )}
              </div>
              {attendanceLoading ? (
                <div className="text-center text-gray-500 py-8">Loading attendance...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Roll No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceList.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center text-gray-400 py-8">
                            No attendance data for this date.
                          </td>
                        </tr>
                      ) : (
                        attendanceList.map(({ student, status }) => (
                          <tr key={student._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.rollNumber || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                            <td
                              className="px-6 py-4 whitespace-nowrap text-sm font-semibold"
                              style={{
                                color:
                                  status === "present"
                                    ? "#16a34a"
                                    : status === "absent"
                                    ? "#dc2626"
                                    : status === "leave"
                                    ? "#f59e42"
                                    : "#6b7280",
                              }}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {showBulkUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl p-8 max-h-[90vh] overflow-y-auto border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Bulk Upload Students</h2>

              {/* Download Template Section */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Step 1: Download Template</h3>
                <p className="text-blue-700 mb-4">
                  Download the Excel template with the required format for student information.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Excel Template
                </button>
              </div>

              {/* Upload Section */}
              <form onSubmit={handleBulkUpload} className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Step 2: Upload Filled Template</h3>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excel File</label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    required
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    File should contain columns: FirstName, MiddleName, LastName, Email, MobileNumber, DateOfBirth,
                    Gender, CurrentAddress, MothersName, RollNumber. Download the template for
                    complete column list.
                  </p>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBulkUploadModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Upload Results Modal */}
        {uploadResults && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl w-full max-w-4xl mx-4 shadow-2xl p-8 max-h-[90vh] overflow-y-auto border border-gray-200"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upload Results</h2>
                <button onClick={() => setUploadResults(null)} className="text-gray-400 hover:text-gray-600">
                  <Plus className="w-6 h-6 transform rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Successful uploads */}
                {uploadResults.successful?.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-green-900 mb-4">
                      ✅ Successfully Created ({uploadResults.successful.length})
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {uploadResults.successful.map((item, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-green-900">{item.student.name}</div>
                              <div className="text-sm text-green-700">{item.student.email}</div>
                              <div className="text-xs text-green-600 mt-1">
                                Student ID: {item.student.studentId} | Roll No: {item.student.rollNumber}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Duplicate entries */}
                {uploadResults.duplicates?.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-yellow-900 mb-4">
                      ⚠️ Duplicate Entries ({uploadResults.duplicates.length})
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {uploadResults.duplicates.map((item, index) => (
                        <div key={index} className="text-sm text-yellow-700 bg-white p-2 rounded">
                          Row {item.row}: {item.data.Name} - {item.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Failed uploads */}
                {uploadResults.failed?.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-red-900 mb-4">
                      ❌ Failed Entries ({uploadResults.failed.length})
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {uploadResults.failed.map((item, index) => (
                        <div key={index} className="text-sm text-red-700 bg-white p-2 rounded">
                          Row {item.row}: {item.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setUploadResults(null)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Student Detail Modal */}
        <StudentDetailModal
          student={selectedStudent}
          isOpen={showStudentDetailModal}
          onClose={() => setShowStudentDetailModal(false)}
          onEdit={handleStudentEdit}
          onRefresh={fetchClassDetails}
        />

        {/* Student Edit Modal */}
        <StudentEditModal
          student={selectedStudent}
          isOpen={showStudentEditModal}
          onClose={() => setShowStudentEditModal(false)}
          onSave={handleStudentSave}
          onRefresh={fetchClassDetails}
        />
      </div>
    </Layout>
  );
};

function getOrdinalSuffix(num) {
  const j = num % 10,
    k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

export default ClassDetails;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Eye,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import Layout from "../components/Layout";
import { cn } from "../utils/cn";
import appConfig from "../config/environment";
import { toast } from "react-toastify";

// Helper function to get ordinal suffix
const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return "st";
  }
  if (j === 2 && k !== 12) {
    return "nd";
  }
  if (j === 3 && k !== 13) {
    return "rd";
  }
  return "th";
};

const TeacherClasses = () => {
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassDetails, setShowClassDetails] = useState(false);

  useEffect(() => {
    loadAssignedClasses();
  }, []);

  const loadAssignedClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${appConfig.API_BASE_URL}/classes/teacher/assigned`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAssignedClasses(data.data);
          setSummary(data.summary);
        } else {
          toast.error(data.message || "Failed to load classes");
        }
      } else {
        toast.error("Failed to load assigned classes");
      }
    } catch (error) {
      console.error("Error loading assigned classes:", error);
      toast.error("Failed to load your assigned classes");
    } finally {
      setLoading(false);
    }
  };

  const handleClassClick = (classItem) => {
    setSelectedClass(classItem);
    setShowClassDetails(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading your classes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">My Assigned Classes</h1>
              <p className="text-primary-100">
                You are the Class Teacher for {summary.totalClasses || 0} class(es)
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{summary.totalStudents || 0}</div>
              <div className="text-primary-200 text-sm">Total Students</div>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Classes</p>
                <p className="text-2xl font-bold text-secondary-900">{summary.totalClasses || 0}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Students</p>
                <p className="text-2xl font-bold text-secondary-900">{summary.totalStudents || 0}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Subjects Taught</p>
                <p className="text-2xl font-bold text-secondary-900">{summary.totalSubjects || 0}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Recent Assignments</p>
                <p className="text-2xl font-bold text-secondary-900">{summary.totalRecentAssignments || 0}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Classes Grid */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-secondary-200">
          <div className="p-6 border-b border-secondary-200">
            <h2 className="text-xl font-semibold text-secondary-900">Your Assigned Classes</h2>
            <p className="text-secondary-600 mt-1">Click on a class to view detailed information</p>
          </div>
          
          <div className="p-6">
            {assignedClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedClasses.map((classItem, index) => (
                  <motion.div
                    key={classItem._id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200 cursor-pointer transition-all duration-200 hover:shadow-lg"
                    onClick={() => handleClassClick(classItem)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {classItem.division}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                          {classItem.studentCount || 0} Students
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                      {classItem.grade}
                      {getOrdinalSuffix(classItem.grade)} Class - {classItem.division}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-secondary-600 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Academic Year: {classItem.academicYear}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Classroom: {classItem.classroom || "Not assigned"}
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {classItem.subjectsCount || 0} Subjects
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {classItem.recentAssignments || 0} Recent Assignments
                      </div>
                    </div>
                    
                    {classItem.subjects && classItem.subjects.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-secondary-700 mb-2">Subjects:</p>
                        <div className="flex flex-wrap gap-1">
                          {classItem.subjects.slice(0, 3).map((subject, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-md"
                            >
                              {subject.subject?.name || "Unknown"}
                            </span>
                          ))}
                          {classItem.subjects.length > 3 && (
                            <span className="px-2 py-1 bg-secondary-100 text-secondary-600 text-xs rounded-md">
                              +{classItem.subjects.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-primary-200">
                      <span className="text-xs text-primary-600 font-medium">Click to view details</span>
                      <ChevronRight className="w-4 h-4 text-primary-600" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <GraduationCap className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">No Classes Assigned</h3>
                <p className="text-secondary-600">
                  You haven't been assigned as a Class Teacher to any classes yet. Please contact the administration.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Class Details Modal */}
        {showClassDetails && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-secondary-900">
                  {selectedClass.grade}
                  {getOrdinalSuffix(selectedClass.grade)} Class - {selectedClass.division} Details
                </h2>
                <button
                  onClick={() => setShowClassDetails(false)}
                  className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <GraduationCap className="w-5 h-5 text-primary-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-secondary-700">Class Name</p>
                          <p className="text-secondary-900">
                            {selectedClass.grade}
                            {getOrdinalSuffix(selectedClass.grade)} Class - {selectedClass.division}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-primary-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-secondary-700">Academic Year</p>
                          <p className="text-secondary-900">{selectedClass.academicYear}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 text-primary-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-secondary-700">Classroom</p>
                          <p className="text-secondary-900">{selectedClass.classroom || "Not assigned"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Class Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedClass.studentCount || 0}</div>
                        <div className="text-sm text-secondary-600">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedClass.subjectsCount || 0}</div>
                        <div className="text-sm text-secondary-600">Subjects</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedClass.recentAssignments || 0}</div>
                        <div className="text-sm text-secondary-600">Recent Assignments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">95%</div>
                        <div className="text-sm text-secondary-600">Attendance Rate</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subjects and Students */}
                <div className="space-y-4">
                  {/* Subjects */}
                  {selectedClass.subjects && selectedClass.subjects.length > 0 && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-secondary-900 mb-4">Subjects Taught</h3>
                      <div className="space-y-2">
                        {selectedClass.subjects.map((subject, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div>
                              <p className="font-medium text-secondary-900">{subject.subject?.name || "Unknown Subject"}</p>
                              <p className="text-sm text-secondary-600">{subject.subject?.code || "No Code"}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-secondary-600">{subject.hoursPerWeek || 0} hrs/week</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Students Preview */}
                  {selectedClass.students && selectedClass.students.length > 0 && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-secondary-900 mb-4">Students ({selectedClass.students.length})</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedClass.students.slice(0, 5).map((student, index) => (
                          <div key={index} className="flex items-center p-2 bg-white rounded-lg">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                              {student.name?.charAt(0) || "S"}
                            </div>
                            <div>
                              <p className="font-medium text-secondary-900">{student.name}</p>
                              <p className="text-sm text-secondary-600">{student.studentId}</p>
                            </div>
                          </div>
                        ))}
                        {selectedClass.students.length > 5 && (
                          <div className="text-center py-2">
                            <p className="text-sm text-secondary-600">
                              +{selectedClass.students.length - 5} more students
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-6 border-t border-secondary-200">
                <button
                  onClick={() => setShowClassDetails(false)}
                  className="px-6 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default TeacherClasses; 
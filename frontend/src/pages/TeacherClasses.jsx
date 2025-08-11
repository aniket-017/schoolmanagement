import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  ChevronLeftIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useTeacherAuth } from "../context/TeacherAuthContext";
import apiService from "../services/apiService";

const TeacherClasses = () => {
  const [classes, setClasses] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const { user } = useTeacherAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    loadAssignedClasses();
  }, []);

  const loadAssignedClasses = async () => {
    try {
      setLoading(true);
      console.log("Loading assigned classes for teacher:", user);
      console.log("apiService:", apiService);
      console.log("apiService.classes:", apiService.classes);

      let response;

      if (!apiService.classes) {
        console.error("apiService.classes is undefined!");
        // Fallback: try direct fetch
        const fetchResponse = await fetch(`${apiService.baseURL}/classes/teacher/assigned`, {
          headers: apiService.getAuthHeaders(),
        });
        response = await apiService.handleResponse(fetchResponse);
      } else {
        response = await apiService.classes.getTeacherAssignedClasses();
      }

      console.log("API Response:", response);

      if (response.success) {
        setClasses(response.data);
        setSummary(response.summary);
      } else {
        console.error("Failed to load classes:", response.message);
      }
    } catch (error) {
      console.error("Error loading assigned classes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAssignedClasses();
  };

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  // Back navigation handler
  const handleBack = () => {
    navigate("/teacher/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your classes...</p>
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-2xl font-bold mb-1">My Assigned Classes</h1>
            <p className="text-blue-100 text-sm">You are assigned as Class Teacher for {classes.length} class(es)</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards - Mobile Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <AcademicCapIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
            <p className="text-sm text-gray-600">Classes</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <UsersIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {classes.reduce((total, classItem) => total + (classItem.studentCount || 0), 0)}
            </p>
            <p className="text-sm text-gray-600">Students</p>
          </div>
        </motion.div>

        {/* Classes List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-900 px-2">Your Assigned Classes</h2>

          {classes.length > 0 ? (
            <div className="space-y-4">
              {classes.map((classItem, index) => (
                <motion.div
                  key={classItem._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Class Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {classItem.grade}
                          {getOrdinalSuffix(classItem.grade)} Class - {classItem.division}
                        </h3>
                        <p className="text-sm text-gray-600">Academic Year: {classItem.academicYear}</p>
                        <p className="text-sm text-gray-600">Classroom: {classItem.classroom || "Not assigned"}</p>
                      </div>
                      <Link to={`/teacher/classes/${classItem._id}`} className="text-blue-600 hover:text-blue-700">
                        <ChevronRightIcon className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>

                  {/* Class Stats */}
                  <div className="flex justify-around p-4 bg-gray-50">
                    <div className="text-center">
                      <UsersIcon className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">{classItem.studentCount || 0} Students</p>
                    </div>
                    <div className="text-center">
                      <BookOpenIcon className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">{classItem.subjectsCount || 0} Subjects</p>
                    </div>
                    <div className="text-center">
                      <DocumentTextIcon className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">{classItem.recentAssignments || 0} Recent Assignments</p>
                    </div>
                  </div>

                  {/* Subjects */}
                  {classItem.subjects && classItem.subjects.length > 0 && (
                    <div className="p-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Subjects:</h4>
                      <div className="flex flex-wrap gap-2">
                        {classItem.subjects.slice(0, 3).map((subject, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {subject.subject?.name || "Unknown Subject"}
                          </span>
                        ))}
                        {classItem.subjects.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{classItem.subjects.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Assigned</h3>
              <p className="text-gray-600">
                You haven't been assigned as a Class Teacher to any classes yet. Please contact the administration.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherClasses;

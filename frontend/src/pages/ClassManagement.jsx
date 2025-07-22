import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  User,
  BookOpen,
  Calendar,
  X,
  Check,
  CheckCircle,
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

const ClassManagement = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [filterGrade, setFilterGrade] = useState("all");

  // Form states
  const [formData, setFormData] = useState({
    grade: "",
    division: "",
    academicYear: new Date().getFullYear().toString(),
    maxStudents: 40,
    classroom: "",
  });

  const [editFormData, setEditFormData] = useState({
    maxStudents: 40,
    classroom: "",
    isActive: true,
  });

  const [assignTeacherData, setAssignTeacherData] = useState({
    teacherId: "",
  });

  // Grades 1-10
  const grades = Array.from({ length: 10 }, (_, i) => i + 1);
  const divisions = ["A", "B", "C", "D", "E"];

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      // You might want to redirect to login here
      return;
    }

    fetchClasses();
    fetchAvailableTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      console.log("Fetching classes from:", `${appConfig.API_BASE_URL}/classes`);
      const response = await fetch(`${appConfig.API_BASE_URL}/classes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      if (data.success) {
        setClasses(data.data);
      } else {
        console.error("API returned error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTeachers = async () => {
    try {
      console.log("Fetching available teachers from:", `${appConfig.API_BASE_URL}/classes/available-teachers`);
      const response = await fetch(`${appConfig.API_BASE_URL}/classes/available-teachers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Teachers response status:", response.status);
      const data = await response.json();
      console.log("Teachers response data:", data);
      if (data.success) {
        setAvailableTeachers(data.data);
        console.log("Available teachers:", data.data);
      } else {
        console.error("API returned error for teachers:", data.message);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${appConfig.API_BASE_URL}/classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({
          grade: "",
          division: "",
          academicYear: new Date().getFullYear().toString(),
          maxStudents: 40,
          classroom: "",
        });
        fetchClasses();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error creating class:", error);
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${appConfig.API_BASE_URL}/classes/${selectedClass._id}/assign-teacher`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(assignTeacherData),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setShowAssignTeacherModal(false);
        setSelectedClass(null);
        setAssignTeacherData({ teacherId: "" });
        fetchClasses(); // Refresh the classes list

        // Show additional info if teacher has multiple assignments
        if (data.currentAssignments && data.currentAssignments.length > 1) {
          const assignmentList = data.currentAssignments
            .map((cls) => `${cls.grade}${getOrdinalSuffix(cls.grade)} Class - ${cls.division}`)
            .join(", ");
          toast.info(`Teacher is now assigned to: ${assignmentList}`);
        }
      } else {
        toast.error(data.message || "Failed to assign teacher");
      }
    } catch (error) {
      console.error("Error assigning teacher:", error);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;

    try {
      const response = await fetch(`${appConfig.API_BASE_URL}/classes/${classId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        fetchClasses();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${appConfig.API_BASE_URL}/classes/${selectedClass._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editFormData),
      });
      const data = await response.json();
      if (data.success) {
        setShowEditModal(false);
        setSelectedClass(null);
        setEditFormData({
          maxStudents: 40,
          classroom: "",
          isActive: true,
        });
        fetchClasses();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error updating class:", error);
    }
  };

  const openEditModal = (classItem) => {
    setSelectedClass(classItem);
    setEditFormData({
      maxStudents: classItem.maxStudents || 40,
      classroom: classItem.classroom || "",
      isActive: classItem.isActive !== false,
    });
    setShowEditModal(true);
  };

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.division.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === "all" || cls.grade.toString() === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const stats = [
    {
      name: "Total Classes",
      value: classes.length.toString(),
      icon: GraduationCap,
      color: "primary",
    },
    {
      name: "Total Students",
      value: classes.reduce((sum, cls) => sum + (cls.currentStrength || 0), 0).toString(),
      icon: Users,
      color: "success",
    },
    {
      name: "Classes with Teachers",
      value: classes.filter((cls) => cls.classTeacher).length.toString(),
      icon: User,
      color: "warning",
    },
    {
      name: "Active Classes",
      value: classes.filter((cls) => cls.isActive).length.toString(),
      icon: Calendar,
      color: "secondary",
    },
  ];

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Header */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Class Management</h1>
                <p className="text-xl text-gray-600 mb-6">Manage classes, divisions, and assign class teachers</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    {classes.length} Classes Created
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    {classes.filter((cls) => cls.classTeacher).length} Teachers Assigned
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    {classes.filter((cls) => cls.isActive).length} Active Classes
                  </div>
                </div>
              </div>
              <div className="mt-6 lg:mt-0 flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Class
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/timetable-outlines")}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Timetables
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.name}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={cn(
                        "p-3 rounded-xl",
                        stat.color === "primary" && "bg-blue-100",
                        stat.color === "success" && "bg-green-100",
                        stat.color === "warning" && "bg-orange-100",
                        stat.color === "secondary" && "bg-purple-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-6 h-6",
                          stat.color === "primary" && "text-blue-600",
                          stat.color === "success" && "text-green-600",
                          stat.color === "warning" && "text-orange-600",
                          stat.color === "secondary" && "text-purple-600"
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Search and Filter */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full sm:w-80 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                >
                  <option value="all">All Grades</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                      {getOrdinalSuffix(grade)} Class
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Classes Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((classItem) => (
              <motion.div
                key={classItem._id}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {classItem.division}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {classItem.grade}
                        {getOrdinalSuffix(classItem.grade)} Class - {classItem.division}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {classItem.classTeacher ? classItem.classTeacher.name : "No teacher assigned"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-full",
                        classItem.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      )}
                    >
                      {classItem.isActive ? "Active" : "Inactive"}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Students</p>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                          style={{ width: `${((classItem.currentStrength || 0) / classItem.maxStudents) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {classItem.currentStrength || 0}/{classItem.maxStudents}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Classroom</p>
                      <p className="text-sm text-gray-900">{classItem.classroom || "Not assigned"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Academic Year</p>
                      <p className="text-sm text-gray-900">{classItem.academicYear}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/classes/${classItem._id}`)}
                    className="flex items-center px-2 py-1 text-sm text-blue-600 rounded hover:bg-blue-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-300"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  {!classItem.classTeacher && (
                    <button
                      onClick={() => {
                        setSelectedClass(classItem);
                        setShowAssignTeacherModal(true);
                      }}
                      className="flex items-center px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign Teacher
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(classItem)}
                    className="flex items-center px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClass(classItem._id)}
                    className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredClasses.length === 0 && !loading && (
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <GraduationCap className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No classes found</h3>
              <p className="text-gray-600 mb-8 text-lg">
                {searchTerm || filterGrade !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first class to get started"}
              </p>
              {!searchTerm && filterGrade === "all" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddModal(true)}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-lg"
                >
                  Add First Class
                </motion.button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Add Class Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Class</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    required
                  >
                    <option value="">Select Grade</option>
                    {grades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                        {getOrdinalSuffix(grade)} Class
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
                  <select
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    required
                  >
                    <option value="">Select Division</option>
                    {divisions.map((division) => (
                      <option key={division} value={division}>
                        Division {division}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    placeholder="e.g., 2024-2025"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
                  <input
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    min="1"
                    max="50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Classroom</label>
                  <input
                    type="text"
                    value={formData.classroom}
                    onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    placeholder="e.g., Room 101"
                  />
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg"
                  >
                    Create Class
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Assign Teacher Modal */}
        {showAssignTeacherModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Assign Class Teacher</h2>
                <button
                  onClick={() => setShowAssignTeacherModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800">
                  Assigning teacher to:{" "}
                  <strong className="text-lg">
                    {selectedClass.grade}
                    {getOrdinalSuffix(selectedClass.grade)} Class - {selectedClass.division}
                  </strong>
                </p>
              </div>

              <form onSubmit={handleAssignTeacher} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Teacher</label>
                  <select
                    value={assignTeacherData.teacherId}
                    onChange={(e) => setAssignTeacherData({ teacherId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    required
                  >
                    <option value="">Select a teacher</option>
                    {availableTeachers.length === 0 ? (
                      <option value="" disabled>
                        No teachers available
                      </option>
                    ) : (
                      availableTeachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name}
                          {teacher.isClassTeacher
                            ? ` - Class Teacher of ${teacher.currentClassAssignment.className} (${
                                teacher.totalAssignments
                              } class${teacher.totalAssignments > 1 ? "es" : ""})`
                            : " - Available"}
                        </option>
                      ))
                    )}
                  </select>
                  {availableTeachers.length === 0 && (
                    <p className="text-sm text-red-600 mt-2">
                      No teachers found. Please create teachers first or check if teachers are approved.
                    </p>
                  )}
                </div>

                {/* Teacher Details Section */}
                {assignTeacherData.teacherId && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Teacher Details</h3>
                    {(() => {
                      const selectedTeacher = availableTeachers.find((t) => t._id === assignTeacherData.teacherId);
                      if (!selectedTeacher) return null;

                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Name</p>
                              <p className="text-sm text-gray-900">{selectedTeacher.name}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Email</p>
                              <p className="text-sm text-gray-900">{selectedTeacher.email}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Experience</p>
                              <p className="text-sm text-gray-900">{selectedTeacher.experience || 0} years</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Status</p>
                              <p className="text-sm text-gray-900">
                                {selectedTeacher.isClassTeacher ? "Class Teacher" : "Available"}
                              </p>
                            </div>
                          </div>

                          {/* Current Assignment */}
                          {selectedTeacher.isClassTeacher && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                              <p className="text-sm font-medium text-blue-800 mb-2">
                                📚 Current Class Assignments ({selectedTeacher.totalAssignments})
                              </p>
                              <p className="text-sm text-blue-700">
                                This teacher is currently the <strong>Class Teacher</strong> of:{" "}
                                <strong>{selectedTeacher.currentClassAssignment.className}</strong>
                              </p>
                              <p className="text-xs text-blue-600 mt-2">
                                Teachers can be assigned to multiple classes. This assignment will be added to their
                                current responsibilities.
                              </p>
                            </div>
                          )}

                          {/* Subjects */}
                          {selectedTeacher.subjects && selectedTeacher.subjects.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">Subjects</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedTeacher.subjects.map((subject, index) => (
                                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">
                                    {subject.name} ({subject.code})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Qualification */}
                          {selectedTeacher.qualification && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-700 mb-1">Qualification</p>
                              <p className="text-sm text-gray-900">{selectedTeacher.qualification}</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowAssignTeacherModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium shadow-lg"
                  >
                    Assign Teacher
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Class Modal */}
        {showEditModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Class</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditClass} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
                  <input
                    type="number"
                    value={editFormData.maxStudents}
                    onChange={(e) => setEditFormData({ ...editFormData, maxStudents: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    min="1"
                    max="50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Classroom</label>
                  <input
                    type="text"
                    value={editFormData.classroom}
                    onChange={(e) => setEditFormData({ ...editFormData, classroom: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    placeholder="e.g., Room 101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Active Status</label>
                  <select
                    value={editFormData.isActive ? "true" : "false"}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.value === "true" })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ClassManagement;

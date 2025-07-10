import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import Layout from "../components/Layout";
import { cn } from "../utils/cn";
import appConfig from "../config/environment";

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
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
      const response = await fetch(`${appConfig.API_BASE_URL}/classes/available-teachers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setAvailableTeachers(data.data);
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
        setShowAssignTeacherModal(false);
        setSelectedClass(null);
        setAssignTeacherData({ teacherId: "" });
        fetchClasses();
      } else {
        alert(data.message);
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

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
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
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">Class Management</h1>
            <p className="text-secondary-600">Manage classes, divisions, and assign class teachers</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Class
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.name}
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white rounded-2xl shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn(
                      "p-3 rounded-xl",
                      stat.color === "primary" && "bg-primary-100",
                      stat.color === "success" && "bg-success-100",
                      stat.color === "warning" && "bg-warning-100",
                      stat.color === "secondary" && "bg-secondary-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-6 h-6",
                        stat.color === "primary" && "text-primary-600",
                        stat.color === "success" && "text-success-600",
                        stat.color === "warning" && "text-warning-600",
                        stat.color === "secondary" && "text-secondary-600"
                      )}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary-900 mb-1">{stat.value}</p>
                  <p className="text-sm font-medium text-secondary-700">{stat.name}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Search and Filter */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-secondary-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 bg-secondary-50 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="px-3 py-2 text-sm border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {classItem.division}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">
                      {classItem.grade}
                      {getOrdinalSuffix(classItem.grade)} Class - {classItem.division}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      {classItem.classTeacher ? classItem.classTeacher.name : "No teacher assigned"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-full",
                      classItem.isActive ? "bg-success-100 text-success-700" : "bg-secondary-100 text-secondary-700"
                    )}
                  >
                    {classItem.isActive ? "Active" : "Inactive"}
                  </span>
                  <button className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-secondary-700 mb-1">Students</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-secondary-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((classItem.currentStrength || 0) / classItem.maxStudents) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-secondary-900">
                      {classItem.currentStrength || 0}/{classItem.maxStudents}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-secondary-700 mb-1">Classroom</p>
                  <p className="text-sm text-secondary-900">{classItem.classroom || "Not assigned"}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-secondary-700 mb-1">Academic Year</p>
                  <p className="text-sm text-secondary-900">{classItem.academicYear}</p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 mt-6 pt-4 border-t border-secondary-200">
                <button className="flex items-center px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </button>
                {!classItem.classTeacher && (
                  <button
                    onClick={() => {
                      setSelectedClass(classItem);
                      setShowAssignTeacherModal(true);
                    }}
                    className="flex items-center px-3 py-2 text-sm text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign Teacher
                  </button>
                )}
                <button className="flex items-center px-3 py-2 text-sm text-warning-600 hover:bg-warning-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClass(classItem._id)}
                  className="flex items-center px-3 py-2 text-sm text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredClasses.length === 0 && !loading && (
          <motion.div variants={itemVariants} className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No classes found</h3>
            <p className="text-secondary-600 mb-6">
              {searchTerm || filterGrade !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Create your first class to get started"}
            </p>
            {!searchTerm && filterGrade === "all" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add First Class
              </button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-secondary-900">Add New Class</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Grade</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-secondary-700 mb-2">Division</label>
                <select
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-secondary-700 mb-2">Academic Year</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 2024-2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Max Students</label>
                <input
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="1"
                  max="50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Classroom</label>
                <input
                  type="text"
                  value={formData.classroom}
                  onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Room 101"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-secondary-900">Assign Class Teacher</h2>
              <button
                onClick={() => setShowAssignTeacherModal(false)}
                className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-secondary-600">
                Assigning teacher to:{" "}
                <strong>
                  {selectedClass.grade}
                  {getOrdinalSuffix(selectedClass.grade)} Class - {selectedClass.division}
                </strong>
              </p>
            </div>

            <form onSubmit={handleAssignTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Select Teacher</label>
                <select
                  value={assignTeacherData.teacherId}
                  onChange={(e) => setAssignTeacherData({ teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a teacher</option>
                  {availableTeachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignTeacherModal(false)}
                  className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors"
                >
                  Assign Teacher
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default ClassManagement;

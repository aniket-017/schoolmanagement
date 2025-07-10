import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserPlus,
} from "lucide-react";
import Layout from "../components/Layout";
import { cn } from "../utils/cn";

const ClassManagement = () => {
  const [activeTab, setActiveTab] = useState("classes");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data
  const classes = [
    {
      id: 1,
      name: "Grade 10-A",
      grade: "Grade 10",
      section: "A",
      students: 35,
      capacity: 40,
      classTeacher: "Ms. Sarah Johnson",
      subjects: ["Mathematics", "Physics", "Chemistry", "English"],
      room: "Room 101",
      status: "active",
    },
    {
      id: 2,
      name: "Grade 9-B",
      grade: "Grade 9",
      section: "B",
      students: 38,
      capacity: 40,
      classTeacher: "Mr. David Wilson",
      subjects: ["Mathematics", "Biology", "History", "English"],
      room: "Room 205",
      status: "active",
    },
    {
      id: 3,
      name: "Grade 11-A",
      grade: "Grade 11",
      section: "A",
      students: 32,
      capacity: 35,
      classTeacher: "Dr. Emily Brown",
      subjects: ["Advanced Math", "Physics", "Chemistry", "Computer Science"],
      room: "Room 301",
      status: "active",
    },
    {
      id: 4,
      name: "Grade 8-C",
      grade: "Grade 8",
      section: "C",
      students: 28,
      capacity: 35,
      classTeacher: "Mrs. Lisa Davis",
      subjects: ["Mathematics", "Science", "English", "Social Studies"],
      room: "Room 105",
      status: "inactive",
    },
  ];

  const subjects = [
    {
      id: 1,
      name: "Advanced Mathematics",
      code: "MATH-ADV",
      department: "Mathematics",
      credits: 4,
      classes: ["Grade 11-A", "Grade 12-A"],
      teacher: "Dr. Robert Chen",
      totalStudents: 65,
    },
    {
      id: 2,
      name: "Physics",
      code: "PHY-101",
      department: "Science",
      credits: 3,
      classes: ["Grade 10-A", "Grade 11-A"],
      teacher: "Prof. Michael Taylor",
      totalStudents: 67,
    },
    {
      id: 3,
      name: "Computer Science",
      code: "CS-101",
      department: "Computer Science",
      credits: 3,
      classes: ["Grade 11-A", "Grade 12-B"],
      teacher: "Ms. Jennifer Lee",
      totalStudents: 42,
    },
  ];

  const stats = [
    {
      name: "Total Classes",
      value: "34",
      change: "+2",
      changeType: "increase",
      icon: GraduationCap,
      color: "primary",
    },
    {
      name: "Total Students",
      value: "1,385",
      change: "+45",
      changeType: "increase",
      icon: Users,
      color: "success",
    },
    {
      name: "Active Subjects",
      value: "28",
      change: "+3",
      changeType: "increase",
      icon: BookOpen,
      color: "warning",
    },
    {
      name: "Class Sessions Today",
      value: "156",
      change: "0",
      changeType: "neutral",
      icon: Calendar,
      color: "secondary",
    },
  ];

  const tabConfig = [
    { id: "classes", name: "Classes", icon: GraduationCap },
    { id: "subjects", name: "Subjects", icon: BookOpen },
    { id: "schedule", name: "Schedule", icon: Calendar },
  ];

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.classTeacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <Layout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">Class Management</h1>
            <p className="text-secondary-600">Manage classes, subjects, and academic schedules</p>
          </div>
          <div className="mt-4 lg:mt-0 flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors shadow-sm"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Add Subject
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
                  {stat.change !== "0" && (
                    <div
                      className={cn(
                        "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
                        stat.changeType === "increase"
                          ? "bg-success-100 text-success-700"
                          : "bg-error-100 text-error-700"
                      )}
                    >
                      <span>{stat.change}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary-900 mb-1">{stat.value}</p>
                  <p className="text-sm font-medium text-secondary-700">{stat.name}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tabs and Content */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-secondary-200">
          {/* Tab Navigation */}
          <div className="border-b border-secondary-200 p-6 pb-0">
            <nav className="flex space-x-1">
              {tabConfig.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                      activeTab === tab.id
                        ? "bg-primary-50 text-primary-700 border border-primary-200"
                        : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search and Filter Bar */}
          <div className="p-6 border-b border-secondary-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 bg-secondary-50 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button className="flex items-center px-3 py-2 text-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-lg transition-colors">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "classes" && (
              <div className="space-y-4">
                {filteredClasses.map((classItem) => (
                  <motion.div
                    key={classItem.id}
                    whileHover={{ scale: 1.01 }}
                    className="border border-secondary-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {classItem.section}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-secondary-900">{classItem.name}</h3>
                          <p className="text-sm text-secondary-600">Class Teacher: {classItem.classTeacher}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={cn(
                            "px-3 py-1 text-xs font-medium rounded-full",
                            classItem.status === "active"
                              ? "bg-success-100 text-success-700"
                              : "bg-secondary-100 text-secondary-700"
                          )}
                        >
                          {classItem.status}
                        </span>
                        <button className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm font-medium text-secondary-700 mb-2">Student Capacity</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-secondary-200 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(classItem.students / classItem.capacity) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-secondary-900">
                            {classItem.students}/{classItem.capacity}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-secondary-700 mb-2">Room</p>
                        <p className="text-sm text-secondary-900">{classItem.room}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-secondary-700 mb-2">Subjects</p>
                        <div className="flex flex-wrap gap-1">
                          {classItem.subjects.slice(0, 3).map((subject, index) => (
                            <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-md">
                              {subject}
                            </span>
                          ))}
                          {classItem.subjects.length > 3 && (
                            <span className="px-2 py-1 bg-secondary-100 text-secondary-600 text-xs rounded-md">
                              +{classItem.subjects.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 mt-6 pt-4 border-t border-secondary-200">
                      <button className="flex items-center px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      <button className="flex items-center px-3 py-2 text-sm text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Enroll Students
                      </button>
                      <button className="flex items-center px-3 py-2 text-sm text-warning-600 hover:bg-warning-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === "subjects" && (
              <div className="space-y-4">
                {filteredSubjects.map((subject) => (
                  <motion.div
                    key={subject.id}
                    whileHover={{ scale: 1.01 }}
                    className="border border-secondary-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-secondary-900">{subject.name}</h3>
                          <p className="text-sm text-secondary-600">Code: {subject.code}</p>
                        </div>
                      </div>
                      <button className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm font-medium text-secondary-700 mb-1">Department</p>
                        <p className="text-sm text-secondary-900">{subject.department}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-secondary-700 mb-1">Credits</p>
                        <p className="text-sm text-secondary-900">{subject.credits}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-secondary-700 mb-1">Teacher</p>
                        <p className="text-sm text-secondary-900">{subject.teacher}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-secondary-700 mb-1">Total Students</p>
                        <p className="text-sm text-secondary-900">{subject.totalStudents}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-secondary-700 mb-2">Classes</p>
                      <div className="flex flex-wrap gap-2">
                        {subject.classes.map((className, index) => (
                          <span key={index} className="px-3 py-1 bg-success-100 text-success-700 text-sm rounded-lg">
                            {className}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 mt-6 pt-4 border-t border-secondary-200">
                      <button className="flex items-center px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      <button className="flex items-center px-3 py-2 text-sm text-warning-600 hover:bg-warning-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === "schedule" && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">Schedule Management</h3>
                <p className="text-secondary-600 mb-6">
                  Create and manage class schedules, timetables, and academic calendar
                </p>
                <div className="flex justify-center space-x-4">
                  <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Create Schedule
                  </button>
                  <button className="px-6 py-3 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors">
                    Import Schedule
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default ClassManagement;

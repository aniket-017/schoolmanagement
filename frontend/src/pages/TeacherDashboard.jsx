import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
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

const TeacherDashboard = () => {
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch assigned classes
      const classesResponse = await fetch(`${appConfig.API_BASE_URL}/classes/teacher/assigned`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        if (classesData.success) {
          setAssignedClasses(classesData.data);
          setSummary(classesData.summary);
        }
      }

      // Mock data for notifications and events (in a real app, these would come from APIs)
      setRecentNotifications([
        {
          id: 1,
          type: "assignment",
          message: "New assignment submitted by John Doe in 9th Class A",
          time: "2 hours ago",
          read: false,
        },
        {
          id: 2,
          type: "announcement",
          message: "Staff meeting scheduled for tomorrow at 9 AM",
          time: "4 hours ago",
          read: true,
        },
        {
          id: 3,
          type: "attendance",
          message: "Attendance marked for 10th Class B",
          time: "1 day ago",
          read: true,
        },
      ]);

      setUpcomingEvents([
        {
          id: 1,
          title: "Parent-Teacher Meeting",
          date: "2024-01-15",
          time: "2:00 PM",
          class: "9th Class A",
        },
        {
          id: 2,
          title: "Exam Schedule Review",
          date: "2024-01-18",
          time: "10:00 AM",
          class: "All Classes",
        },
      ]);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
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
            <p className="text-secondary-600">Loading your dashboard...</p>
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
              <h1 className="text-2xl font-bold mb-2">{getGreeting()}, Teacher!</h1>
              <p className="text-primary-100">
                You are assigned to {summary.totalClasses || 0} class(es) with {summary.totalStudents || 0} students
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{summary.totalClasses || 0}</div>
              <div className="text-primary-200 text-sm">Active Classes</div>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Students</p>
                <p className="text-2xl font-bold text-secondary-900">{summary.totalStudents || 0}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Subjects Taught</p>
                <p className="text-2xl font-bold text-secondary-900">{summary.totalSubjects || 0}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Recent Assignments</p>
                <p className="text-2xl font-bold text-secondary-900">{summary.totalRecentAssignments || 0}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-secondary-900">95%</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Assigned Classes */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-secondary-200">
          <div className="p-6 border-b border-secondary-200">
            <h2 className="text-xl font-semibold text-secondary-900">Your Assigned Classes</h2>
            <p className="text-secondary-600 mt-1">Classes where you are the Class Teacher</p>
          </div>
          
          <div className="p-6">
            {assignedClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedClasses.map((classItem) => (
                  <motion.div
                    key={classItem._id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200"
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
                    
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                      {classItem.grade}
                      {getOrdinalSuffix(classItem.grade)} Class - {classItem.division}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-secondary-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Academic Year: {classItem.academicYear}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        {classItem.subjectsCount || 0} Subjects
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {classItem.recentAssignments || 0} Recent Assignments
                      </div>
                    </div>
                    
                    {classItem.subjects && classItem.subjects.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-medium text-secondary-700 mb-2">Subjects:</p>
                        <div className="flex flex-wrap gap-1">
                          {classItem.subjects.slice(0, 3).map((subject, index) => (
                            <span
                              key={index}
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

        {/* Recent Activity and Notifications */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Notifications */}
          <div className="bg-white rounded-2xl shadow-sm border border-secondary-200">
            <div className="p-6 border-b border-secondary-200">
              <h2 className="text-xl font-semibold text-secondary-900">Recent Notifications</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start space-x-3 p-3 rounded-lg",
                      notification.read ? "bg-secondary-50" : "bg-blue-50"
                    )}
                  >
                    <div className="flex-shrink-0">
                      {notification.type === "assignment" && (
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      )}
                      {notification.type === "announcement" && (
                        <Bell className="w-5 h-5 text-orange-600" />
                      )}
                      {notification.type === "attendance" && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-secondary-900">{notification.message}</p>
                      <p className="text-xs text-secondary-500 mt-1">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl shadow-sm border border-secondary-200">
            <div className="p-6 border-b border-secondary-200">
              <h2 className="text-xl font-semibold text-secondary-900">Upcoming Events</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg bg-secondary-50">
                    <div className="flex-shrink-0">
                      <Clock className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900">{event.title}</p>
                      <p className="text-xs text-secondary-600 mt-1">
                        {event.date} at {event.time} • {event.class}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default TeacherDashboard; 
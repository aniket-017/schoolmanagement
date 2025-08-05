import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Calendar,
  BookOpen,
  PlusCircle,
  FileText,
  BarChart3,
  UserCheck,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Layout from "../components/Layout";
import { cn } from "../utils/cn";
import apiService from "../services/apiService";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    monthlyRevenue: 0,
    attendancePercentage: 0,
  });
  const [feeData, setFeeData] = useState([]);
  const [attendanceData, setAttendanceData] = useState({
    overall: { attendancePercentage: 0, totalStudents: 0 },
    classStats: {},
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [studentsResponse, teachersResponse, classesResponse, feeOverviewResponse, attendanceStatsResponse] =
        await Promise.all([
          apiService.students.getAll().catch((err) => ({ data: [] })),
          apiService.users.getAll({ role: "teacher" }).catch((err) => ({ users: [] })),
          apiService.classes.getAll().catch((err) => ({ data: [] })),
          apiService.fees.getFeeOverview().catch((err) => ({ data: { totalCollection: 0, monthlyData: [] } })),
          apiService.attendance
            .getAttendanceStats()
            .catch((err) => ({ data: { overall: { attendancePercentage: 0, totalStudents: 0 }, classStats: {} } })),
        ]);

      // Calculate statistics
      const totalStudents = studentsResponse.data?.length || 0;
      const totalTeachers = teachersResponse.users?.length || 0;
      const totalClasses = classesResponse.data?.length || 0;

      // Extract fee data
      const monthlyRevenue = feeOverviewResponse.data?.totalCollection || 0;
      const feeChartData = feeOverviewResponse.data?.monthlyData || [];

      // Extract attendance data
      const attendancePercentage = attendanceStatsResponse.data?.overall?.attendancePercentage || 0;
      const classStats = attendanceStatsResponse.data?.classStats || {};

      setStats({
        totalStudents,
        totalTeachers,
        totalClasses,
        monthlyRevenue,
        attendancePercentage,
      });

      setFeeData(feeChartData);
      setAttendanceData({
        overall: attendanceStatsResponse.data?.overall || { attendancePercentage: 0, totalStudents: 0 },
        classStats,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    {
      name: "Total Students",
      value: stats.totalStudents.toLocaleString(),
      change: "+0%",
      changeType: "increase",
      icon: Users,
      color: "primary",
      description: "Active enrolled students",
    },
    {
      name: "Total Teachers",
      value: stats.totalTeachers.toLocaleString(),
      change: "+0%",
      changeType: "increase",
      icon: GraduationCap,
      color: "success",
      description: "Faculty members",
    },
    {
      name: "Monthly Revenue",
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      change: "+0%",
      changeType: "increase",
      icon: DollarSign,
      color: "warning",
      description: "This month's collection",
    },
    {
      name: "Attendance Rate",
      value: `${stats.attendancePercentage}%`,
      change: "+0%",
      changeType: "increase",
      icon: UserCheck,
      color: "info",
      description: "Overall attendance",
    },
  ];

  const quickActions = [
    {
      title: "Add New Student",
      description: "Register a new student",
      icon: PlusCircle,
      color: "primary",
      action: () => (window.location.href = "/add-student"),
    },
    {
      title: "Create Announcement",
      description: "Send school-wide announcement",
      icon: FileText,
      color: "success",
      action: () => (window.location.href = "/announcements"),
    },
    {
      title: "View Reports",
      description: "Access detailed reports",
      icon: BarChart3,
      color: "warning",
      action: () => (window.location.href = "/reports"),
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
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome back, Admin! 👋</h1>
              <p className="text-xl text-gray-600 mb-2">Here's what's happening at your school today.</p>
            </div>
            <div className="mt-6 lg:mt-0">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-50 px-4 py-2 rounded-xl shadow border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span className="text-base font-medium text-gray-700">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardStats.map((stat, index) => {
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
                        stat.color === "info" && "bg-blue-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-6 h-6",
                          stat.color === "primary" && "text-blue-600",
                          stat.color === "success" && "text-green-600",
                          stat.color === "warning" && "text-orange-600",
                          stat.color === "info" && "text-blue-600"
                        )}
                      />
                    </div>
                    <div
                      className={cn(
                        "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
                        stat.changeType === "increase" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}
                    >
                      <TrendingUp className={cn("w-3 h-3", stat.changeType === "decrease" && "rotate-180")} />
                      <span>{stat.change}</span>
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

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Fee Collection Chart */}
            {feeData.length > 0 ? (
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Fee Collection</h3>
                  <p className="text-sm text-gray-600">Monthly collection vs pending amounts</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={feeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="collected"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Collected"
                    />
                    <Area
                      type="monotone"
                      dataKey="pending"
                      stackId="1"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.6}
                      name="Pending"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            ) : (
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Fee Collection</h3>
                  <p className="text-sm text-gray-600">Monthly collection vs pending amounts</p>
                </div>
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No fee data available</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Attendance Overview */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Attendance Overview</h3>
                <p className="text-sm text-gray-600">Overall attendance statistics</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overall Attendance</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.attendancePercentage}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-lg font-semibold text-gray-900">{attendanceData.overall.totalStudents || 0}</p>
                  </div>
                </div>

                {/* Class-wise attendance */}
                {Object.keys(attendanceData.classStats).length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Class-wise Attendance</h4>
                    {Object.entries(attendanceData.classStats)
                      .slice(0, 5)
                      .map(([className, stats]) => (
                        <div key={className} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">{className}</span>
                          <span className="text-sm font-semibold text-green-600">{stats.attendancePercentage}%</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <UserCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No attendance data available</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
              <p className="text-sm text-gray-600">Commonly used features</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.action}
                    className={cn(
                      "flex items-center p-4 rounded-xl border-2 border-dashed transition-all duration-200 hover:border-solid",
                      action.color === "primary" && "border-blue-200 hover:border-blue-300 hover:bg-blue-50",
                      action.color === "success" && "border-green-200 hover:border-green-300 hover:bg-green-50",
                      action.color === "warning" && "border-orange-200 hover:border-orange-300 hover:bg-orange-50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 p-2 rounded-lg mr-4",
                        action.color === "primary" && "bg-blue-100",
                        action.color === "success" && "bg-green-100",
                        action.color === "warning" && "bg-orange-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          action.color === "primary" && "text-blue-600",
                          action.color === "success" && "text-green-600",
                          action.color === "warning" && "text-orange-600"
                        )}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 text-sm">{action.title}</p>
                      <p className="text-xs text-gray-600">{action.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

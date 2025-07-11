import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Calendar,
  BookOpen,
  PlusCircle,
  FileText,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Layout from "../components/Layout";
import { cn } from "../utils/cn";

const AdminDashboard = () => {
  // Sample data for charts
  const enrollmentData = [
    { month: "Jan", students: 1200, teachers: 85 },
    { month: "Feb", students: 1245, teachers: 87 },
    { month: "Mar", students: 1280, teachers: 89 },
    { month: "Apr", students: 1320, teachers: 92 },
    { month: "May", students: 1350, teachers: 94 },
    { month: "Jun", students: 1385, teachers: 96 },
  ];

  const feeCollectionData = [
    { month: "Jan", collected: 45000, pending: 8000 },
    { month: "Feb", collected: 52000, pending: 6000 },
    { month: "Mar", collected: 48000, pending: 12000 },
    { month: "Apr", collected: 55000, pending: 5000 },
    { month: "May", collected: 58000, pending: 7000 },
    { month: "Jun", collected: 62000, pending: 4000 },
  ];

  const subjectDistribution = [
    { name: "Science", students: 350, color: "#3b82f6" },
    { name: "Mathematics", students: 280, color: "#10b981" },
    { name: "English", students: 320, color: "#f59e0b" },
    { name: "Social Studies", students: 250, color: "#ef4444" },
    { name: "Arts", students: 185, color: "#8b5cf6" },
  ];

  const stats = [
    {
      name: "Total Students",
      value: "1,385",
      change: "+12%",
      changeType: "increase",
      icon: Users,
      color: "primary",
      description: "Active enrolled students",
    },
    {
      name: "Total Teachers",
      value: "96",
      change: "+8%",
      changeType: "increase",
      icon: GraduationCap,
      color: "success",
      description: "Faculty members",
    },
    {
      name: "Monthly Revenue",
      value: "$62,000",
      change: "+15%",
      changeType: "increase",
      icon: DollarSign,
      color: "warning",
      description: "This month's collection",
    },
    {
      name: "Pending Approvals",
      value: "24",
      change: "-5%",
      changeType: "decrease",
      icon: UserCheck,
      color: "error",
      description: "Awaiting approval",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: "New student registration",
      user: "John Doe",
      time: "2 minutes ago",
      type: "registration",
      icon: UserCheck,
    },
    {
      id: 2,
      action: "Fee payment received",
      user: "Jane Smith",
      time: "15 minutes ago",
      type: "payment",
      icon: DollarSign,
    },
    {
      id: 3,
      action: "Class schedule updated",
      user: "Prof. Johnson",
      time: "1 hour ago",
      type: "schedule",
      icon: Calendar,
    },
    {
      id: 4,
      action: "New announcement posted",
      user: "Admin",
      time: "2 hours ago",
      type: "announcement",
      icon: FileText,
    },
  ];

  const quickActions = [
    {
      title: "Add New Student",
      description: "Register a new student",
      icon: PlusCircle,
      color: "primary",
      action: () => {},
    },
    {
      title: "Create Announcement",
      description: "Send school-wide announcement",
      icon: FileText,
      color: "success",
      action: () => {},
    },
    {
      title: "Generate Report",
      description: "Create monthly report",
      icon: BarChart3,
      color: "warning",
      action: () => {},
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Header */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
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
                        stat.color === "error" && "bg-red-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-6 h-6",
                          stat.color === "primary" && "text-blue-600",
                          stat.color === "success" && "text-green-600",
                          stat.color === "warning" && "text-orange-600",
                          stat.color === "error" && "text-red-600"
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
            {/* Enrollment Trends */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Enrollment Trends</h3>
                <p className="text-sm text-gray-600">Student and teacher growth over time</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={enrollmentData}>
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
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    name="Students"
                  />
                  <Line
                    type="monotone"
                    dataKey="teachers"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    name="Teachers"
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Fee Collection */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fee Collection</h3>
                <p className="text-sm text-gray-600">Monthly collection vs pending amounts</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={feeCollectionData}>
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
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Activity</h3>
                <p className="text-sm text-gray-600">Latest updates and actions</p>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            activity.type === "registration" && "bg-blue-100",
                            activity.type === "payment" && "bg-green-100",
                            activity.type === "schedule" && "bg-orange-100",
                            activity.type === "announcement" && "bg-gray-100"
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-4 h-4",
                              activity.type === "registration" && "text-blue-600",
                              activity.type === "payment" && "text-green-600",
                              activity.type === "schedule" && "text-orange-600",
                              activity.type === "announcement" && "text-gray-600"
                            )}
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-600">
                          by <span className="font-medium">{activity.user}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
                <p className="text-sm text-gray-600">Commonly used features</p>
              </div>
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={action.action}
                      className={cn(
                        "w-full flex items-center p-4 rounded-xl border-2 border-dashed transition-all duration-200 hover:border-solid",
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
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

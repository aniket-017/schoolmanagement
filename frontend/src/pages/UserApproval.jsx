import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Phone,
  Calendar,
  School,
  User,
  Search,
  Filter,
  Users,
  AlertTriangle,
  FileText,
  Shield,
} from "lucide-react";
import Layout from "../components/Layout";
import { cn } from "../utils/cn";

const UserApproval = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // Sample data
  const stats = [
    {
      name: "Pending Approvals",
      value: "24",
      change: "+3",
      changeType: "increase",
      icon: Clock,
      color: "warning",
    },
    {
      name: "Approved Today",
      value: "12",
      change: "+12",
      changeType: "increase",
      icon: CheckCircle,
      color: "success",
    },
    {
      name: "Total Approved",
      value: "156",
      change: "+24",
      changeType: "increase",
      icon: UserCheck,
      color: "primary",
    },
    {
      name: "Rejected",
      value: "8",
      change: "-2",
      changeType: "decrease",
      icon: XCircle,
      color: "error",
    },
  ];

  const pendingUsers = [
    {
      id: 1,
      name: "Emily Johnson",
      email: "emily.johnson@email.com",
      phone: "+1 (555) 123-4567",
      role: "teacher",

      experience: "5 years",
      qualification: "M.Sc. Mathematics",
      appliedDate: "2024-01-15T09:30:00Z",
      status: "pending",
      documents: ["Resume", "Certificates", "ID Proof"],
      subjects: ["Algebra", "Calculus", "Statistics"],
    },
    {
      id: 2,
      name: "Michael Brown",
      email: "michael.brown@email.com",
      phone: "+1 (555) 234-5678",
      role: "teacher",

      experience: "8 years",
      qualification: "Ph.D. Physics",
      appliedDate: "2024-01-14T14:20:00Z",
      status: "pending",
      documents: ["Resume", "Certificates", "Research Papers"],
      subjects: ["Mechanics", "Thermodynamics", "Quantum Physics"],
    },
    {
      id: 3,
      name: "Sarah Davis",
      email: "sarah.davis@email.com",
      phone: "+1 (555) 345-6789",
      role: "admin",

      experience: "3 years",
      qualification: "MBA",
      appliedDate: "2024-01-13T11:15:00Z",
      status: "pending",
      documents: ["Resume", "Certificates"],
      subjects: [],
    },
    {
      id: 4,
      name: "David Wilson",
      email: "david.wilson@email.com",
      phone: "+1 (555) 456-7890",
      role: "teacher",

      experience: "6 years",
      qualification: "M.Tech Computer Science",
      appliedDate: "2024-01-12T16:45:00Z",
      status: "pending",
      documents: ["Resume", "Certificates", "Portfolio"],
      subjects: ["Programming", "Data Structures", "Algorithms"],
    },
  ];

  const recentActions = [
    {
      id: 1,
      userName: "Alice Smith",
      action: "approved",
      role: "teacher",
      timestamp: "2024-01-15T10:30:00Z",
      approvedBy: "Principal Davis",
    },
    {
      id: 2,
      userName: "John Anderson",
      action: "rejected",
      role: "teacher",
      timestamp: "2024-01-15T09:15:00Z",
      approvedBy: "Principal Davis",
    },
    {
      id: 3,
      userName: "Lisa Thompson",
      action: "approved",
      role: "admin",
      timestamp: "2024-01-14T15:20:00Z",
      approvedBy: "Admin Manager",
    },
  ];

  const tabConfig = [
    { id: "pending", name: "Pending", count: pendingUsers.length, icon: Clock },
    { id: "approved", name: "Approved", count: 156, icon: CheckCircle },
    { id: "rejected", name: "Rejected", count: 8, icon: XCircle },
  ];

  const filteredUsers = pendingUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApprove = (userId) => {
    console.log(`Approving user ${userId}`);
    // API call to approve user
  };

  const handleReject = (userId) => {
    console.log(`Rejecting user ${userId}`);
    // API call to reject user
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
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">User Approval</h1>
            <p className="text-secondary-600">Review and approve new user registrations for teachers and staff</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-secondary-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-warning-500" />
                <span className="text-sm font-medium text-secondary-700">
                  {pendingUsers.length} users awaiting approval
                </span>
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
                      stat.color === "error" && "bg-error-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-6 h-6",
                        stat.color === "primary" && "text-primary-600",
                        stat.color === "success" && "text-success-600",
                        stat.color === "warning" && "text-warning-600",
                        stat.color === "error" && "text-error-600"
                      )}
                    />
                  </div>
                  <div
                    className={cn(
                      "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
                      stat.changeType === "increase" ? "bg-success-100 text-success-700" : "bg-error-100 text-error-700"
                    )}
                  >
                    <span>{stat.change}</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
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
                        <span
                          className={cn(
                            "ml-2 px-2 py-1 text-xs rounded-full",
                            activeTab === tab.id
                              ? "bg-primary-100 text-primary-600"
                              : "bg-secondary-100 text-secondary-600"
                          )}
                        >
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Search Bar */}
              <div className="p-6 border-b border-secondary-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
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

              {/* Users List */}
              <div className="p-6">
                {activeTab === "pending" && (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <motion.div
                        key={user.id}
                        whileHover={{ scale: 1.01 }}
                        className="border border-secondary-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {user.name.charAt(0)}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-secondary-900">{user.name}</h3>
                                <span
                                  className={cn(
                                    "px-2 py-1 text-xs font-medium rounded-full",
                                    user.role === "teacher" && "bg-primary-100 text-primary-700",
                                    user.role === "admin" && "bg-success-100 text-success-700"
                                  )}
                                >
                                  {user.role}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <div className="flex items-center text-sm text-secondary-600">
                                    <Mail className="w-4 h-4 mr-2" />
                                    {user.email}
                                  </div>
                                  <div className="flex items-center text-sm text-secondary-600">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {user.phone}
                                  </div>
                                </div>

                                <div className="space-y-2">

                                  <div className="flex items-center text-sm text-secondary-600">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Applied {formatDate(user.appliedDate)}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-secondary-700 mb-1">
                                    <span className="font-medium">Qualification:</span> {user.qualification}
                                  </p>
                                  <p className="text-sm text-secondary-700">
                                    <span className="font-medium">Experience:</span> {user.experience}
                                  </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => setSelectedUser(user)}
                                    className="flex items-center px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </button>

                                  <button
                                    onClick={() => handleApprove(user.id)}
                                    className="flex items-center px-3 py-2 text-sm text-white bg-success-600 hover:bg-success-700 rounded-lg transition-colors"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </button>

                                  <button
                                    onClick={() => handleReject(user.id)}
                                    className="flex items-center px-3 py-2 text-sm text-white bg-error-600 hover:bg-error-700 rounded-lg transition-colors"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {(activeTab === "approved" || activeTab === "rejected") && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">
                      {activeTab === "approved" ? "Approved Users" : "Rejected Users"}
                    </h3>
                    <p className="text-secondary-600">
                      {activeTab === "approved"
                        ? "List of approved users will be displayed here."
                        : "List of rejected users will be displayed here."}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Actions */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-sm border border-secondary-200 p-6"
            >
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recent Actions</h3>
              <div className="space-y-4">
                {recentActions.map((action) => (
                  <div key={action.id} className="flex items-center space-x-3 p-3 rounded-lg bg-secondary-50">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        action.action === "approved" && "bg-success-100",
                        action.action === "rejected" && "bg-error-100"
                      )}
                    >
                      {action.action === "approved" ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-error-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900">{action.userName}</p>
                      <p className="text-xs text-secondary-600">
                        {action.action} as {action.role}
                      </p>
                      <p className="text-xs text-secondary-500">{formatDate(action.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-sm border border-secondary-200 p-6"
            >
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">This Week</span>
                  <span className="text-sm font-medium text-secondary-900">18 approved</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">This Month</span>
                  <span className="text-sm font-medium text-secondary-900">67 approved</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Avg. Processing Time</span>
                  <span className="text-sm font-medium text-secondary-900">2.3 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Approval Rate</span>
                  <span className="text-sm font-medium text-success-600">94.2%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default UserApproval;

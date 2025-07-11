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
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Header */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">User Approval</h1>
              <p className="text-xl text-gray-600 mb-2">Review and approve new user registrations for teachers and staff</p>
            </div>
            <div className="mt-6 lg:mt-0">
              <div className="bg-yellow-50 px-4 py-2 rounded-xl shadow border border-yellow-100 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="text-base font-medium text-yellow-800">
                  {pendingUsers.length} users awaiting approval
                </span>
              </div>
            </div>
          </motion.div>

          {/* Tabs and Search/Filter */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tabConfig.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-5 py-2 rounded-full font-medium text-sm shadow-sm transition-all duration-200
                    ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.name}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === tab.id ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}`}>{tab.count}</span>
                </button>
              ))}
            </div>
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                />
              </div>
              <button className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors border border-gray-200">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
            </div>
          </motion.div>

          {/* Main Content: User Cards & Side Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Cards */}
            <div className="lg:col-span-2 space-y-6">
              {filteredUsers.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-gray-900">{user.name}</span>
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">{user.role}</span>
                        </div>
                        <span className="text-xs text-gray-500">Applied {formatDate(user.appliedDate)}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center"><Mail className="w-4 h-4 mr-1" />{user.email}</span>
                        <span className="flex items-center"><Phone className="w-4 h-4 mr-1" />{user.phone}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>Qualification: <span className="font-medium text-gray-900">{user.qualification}</span></span>
                        <span>Experience: <span className="font-medium text-gray-900">{user.experience}</span></span>
                        {user.subjects && user.subjects.length > 0 && (
                          <span>Subjects: <span className="font-medium text-gray-900">{user.subjects.join(', ')}</span></span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.documents && user.documents.map((doc, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{doc}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <button onClick={() => handleApprove(user.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">Approve</button>
                      <button onClick={() => handleReject(user.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">Reject</button>
                      <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors">View Details</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Side Cards */}
            <div className="space-y-6">
              {/* Recent Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Actions</h3>
                <ul className="space-y-4">
                  {recentActions.map((action) => (
                    <li key={action.id} className="flex items-start gap-3">
                      {action.action === 'approved' ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold text-gray-800">{action.userName}</span>
                        <span className="text-gray-600"> {action.action} as {action.role}</span>
                        <div className="text-xs text-gray-500">{formatDate(action.timestamp)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="flex flex-col gap-2 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span>This Week</span>
                    <span className="font-semibold text-blue-600">18 approved</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>This Month</span>
                    <span className="font-semibold text-blue-600">56 approved</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rejected</span>
                    <span className="font-semibold text-red-600">8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default UserApproval;

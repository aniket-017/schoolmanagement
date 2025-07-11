import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  Users,
  Pin,
  Calendar,
  Send,
  Bell,
  AlertCircle,
  Info,
  CheckCircle,
  FileText,
} from "lucide-react";
import Layout from "../components/Layout";
import { cn } from "../utils/cn";

const Announcements = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sample data
  const stats = [
    {
      name: "Total Announcements",
      value: "47",
      change: "+5",
      changeType: "increase",
      icon: Megaphone,
      color: "primary",
    },
    {
      name: "Active Posts",
      value: "23",
      change: "+2",
      changeType: "increase",
      icon: Bell,
      color: "success",
    },
    {
      name: "Draft Posts",
      value: "8",
      change: "-1",
      changeType: "decrease",
      icon: FileText,
      color: "warning",
    },
    {
      name: "Views This Month",
      value: "2,847",
      change: "+324",
      changeType: "increase",
      icon: Eye,
      color: "secondary",
    },
  ];

  const announcements = [
    {
      id: 1,
      title: "Important: Final Exam Schedule Released",
      content:
        "The final examination schedule for all grades has been released. Students are advised to check their exam dates and prepare accordingly. The exams will begin from March 15, 2024.",
      priority: "high",
      status: "published",
      targetAudience: "Students",
      createdBy: "Dr. Sarah Wilson",
      createdAt: "2024-01-15T10:30:00Z",
      publishedAt: "2024-01-15T10:30:00Z",
      views: 1247,
      isPinned: true,
    },
    {
      id: 2,
      title: "New Library Hours - Effective Immediately",
      content:
        "Due to increased demand, the library will now be open until 9 PM on weekdays and 6 PM on weekends. New study rooms have also been added to accommodate more students.",
      priority: "medium",
      status: "published",
      targetAudience: "All",
      createdBy: "Ms. Jennifer Lee",
      createdAt: "2024-01-14T14:20:00Z",
      publishedAt: "2024-01-14T14:20:00Z",
      views: 892,
      isPinned: false,
    },
    {
      id: 3,
      title: "Sports Day Registration Open",
      content:
        "Registration for the annual sports day is now open. Students can register for various events through the student portal. Last date for registration is January 25, 2024.",
      priority: "medium",
      status: "published",
      targetAudience: "Students",
      createdBy: "Coach Michael Brown",
      createdAt: "2024-01-13T09:15:00Z",
      publishedAt: "2024-01-13T09:15:00Z",
      views: 654,
      isPinned: false,
    },
    {
      id: 4,
      title: "Faculty Meeting - Staff Only",
      content:
        "All faculty members are required to attend the monthly faculty meeting scheduled for January 20, 2024, at 3:00 PM in the main conference room.",
      priority: "high",
      status: "published",
      targetAudience: "Staff",
      createdBy: "Principal Davis",
      createdAt: "2024-01-12T16:45:00Z",
      publishedAt: "2024-01-12T16:45:00Z",
      views: 234,
      isPinned: true,
    },
    {
      id: 5,
      title: "New Scholarship Program Announcement",
      content:
        "We are pleased to announce a new merit-based scholarship program for deserving students. Applications will be accepted starting February 1, 2024.",
      priority: "low",
      status: "draft",
      targetAudience: "Students",
      createdBy: "Dr. Sarah Wilson",
      createdAt: "2024-01-10T11:30:00Z",
      publishedAt: null,
      views: 0,
      isPinned: false,
    },
  ];

  const tabConfig = [
    { id: "all", name: "All Announcements", count: announcements.length },
    { id: "published", name: "Published", count: announcements.filter((a) => a.status === "published").length },
    { id: "draft", name: "Drafts", count: announcements.filter((a) => a.status === "draft").length },
    { id: "pinned", name: "Pinned", count: announcements.filter((a) => a.isPinned).length },
  ];

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());

    switch (activeTab) {
      case "published":
        return matchesSearch && announcement.status === "published";
      case "draft":
        return matchesSearch && announcement.status === "draft";
      case "pinned":
        return matchesSearch && announcement.isPinned;
      default:
        return matchesSearch;
    }
  });

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return AlertCircle;
      case "medium":
        return Info;
      case "low":
        return CheckCircle;
      default:
        return Info;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Announcements</h1>
              <p className="text-xl text-gray-600 mb-2">Create, manage, and share important announcements with your school community</p>
            </div>
            <div className="mt-6 lg:mt-0 flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Announcement
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Notification
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
                    <div
                      className={cn(
                        "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
                        stat.changeType === "increase" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}
                    >
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

          {/* Announcements Section */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 p-6 pb-0">
              <nav className="flex space-x-1">
                {tabConfig.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {tab.name}
                    <span
                      className={cn(
                        "ml-2 px-2 py-1 text-xs rounded-full",
                        activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Search and Filter Bar */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full sm:w-64 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Announcements List */}
            <div className="p-6">
              <div className="space-y-4">
                {filteredAnnouncements.map((announcement) => {
                  const PriorityIcon = getPriorityIcon(announcement.priority);
                  const priorityColor = getPriorityColor(announcement.priority);

                  return (
                    <motion.div
                      key={announcement.id}
                      whileHover={{ scale: 1.01 }}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div
                            className={cn(
                              "p-2 rounded-lg flex-shrink-0",
                              priorityColor === "error" && "bg-red-100",
                              priorityColor === "warning" && "bg-orange-100",
                              priorityColor === "success" && "bg-green-100",
                              priorityColor === "secondary" && "bg-purple-100"
                            )}
                          >
                            <PriorityIcon
                              className={cn(
                                "w-5 h-5",
                                priorityColor === "error" && "text-red-600",
                                priorityColor === "warning" && "text-orange-600",
                                priorityColor === "success" && "text-green-600",
                                priorityColor === "secondary" && "text-purple-600"
                              )}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">{announcement.title}</h3>
                              {announcement.isPinned && <Pin className="w-4 h-4 text-orange-500 flex-shrink-0" />}
                            </div>

                            <p className="text-gray-600 mb-3 line-clamp-2">{announcement.content}</p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(announcement.createdAt)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{announcement.targetAudience}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>{announcement.views} views</span>
                              </div>
                              <span>by {announcement.createdBy}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <span
                            className={cn(
                              "px-3 py-1 text-xs font-medium rounded-full",
                              announcement.status === "published" && "bg-green-100 text-green-700",
                              announcement.status === "draft" && "bg-orange-100 text-orange-700"
                            )}
                          >
                            {announcement.status}
                          </span>

                          <div className="flex items-center space-x-1">
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredAnnouncements.length === 0 && (
                <div className="text-center py-12">
                  <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
                  <p className="text-gray-600 mb-6">
                    {activeTab === "all"
                      ? "Create your first announcement to get started."
                      : `No ${activeTab} announcements match your search.`}
                  </p>
                  {activeTab === "all" && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Announcement
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Announcements;

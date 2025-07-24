import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
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
  AlertCircle,
  Info,
  CheckCircle,
  FileText,
  MoreVertical,
} from "lucide-react";
import Layout from "../components/Layout";
import AnnouncementModal from "../components/AnnouncementModal";
import { cn } from "../utils/cn";
import appConfig from "../config/environment";
import { useAuth } from "../context/AuthContext";

const Announcements = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnnouncements: 0,
    publishedAnnouncements: 0,
    draftAnnouncements: 0,
    pinnedAnnouncements: 0,
  });
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAnnouncements, setTotalAnnouncements] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchAnnouncements(1, true);
    fetchStats();
    fetchClasses();
    fetchUsers();
  }, []);



  const fetchAnnouncements = async (page = 1, reset = false) => {
    try {
      if (reset || page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const limit = 10; // Number of announcements per page
      let url = `${appConfig.API_BASE_URL}/announcements?page=${page}&limit=${limit}`;
      
      // Add status filter if not on "all" tab
      if (activeTab !== "all") {
        if (activeTab === "published") {
          url += `&status=published`;
        } else if (activeTab === "draft") {
          url += `&status=draft`;
        } else if (activeTab === "pinned") {
          url += `&isPinned=true`;
        } else if (activeTab === "mine" && isTeacher) {
          // For "mine" tab, we'll filter on the client side since we need to check createdBy
        }
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // The API returns: { success: true, data: [...], pagination: {...} }
        const announcementsData = data.data || [];
        const pagination = data.pagination || {};
        

        
        if (reset || page === 1) {
          setAnnouncements(announcementsData);
          setCurrentPage(page);
        } else {
          setAnnouncements(prev => [...prev, ...announcementsData]);
        }
        
        // Use the pagination data from API
        const total = pagination.count || announcementsData.length;
        const totalPages = pagination.total || 1;
        
        setTotalPages(totalPages);
        setTotalAnnouncements(total);
        setHasMore(page < totalPages && announcementsData.length === 10);
        

      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${appConfig.API_BASE_URL}/announcements/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setStats({
          totalAnnouncements: data.data.totalAnnouncements,
          publishedAnnouncements: data.data.publishedAnnouncements,
          draftAnnouncements: data.data.draftAnnouncements,
          pinnedAnnouncements: data.data.pinnedAnnouncements,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${appConfig.API_BASE_URL}/classes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setClasses(data.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${appConfig.API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSaveAnnouncement = async (formData) => {
    try {
      const url = editingAnnouncement 
        ? `${appConfig.API_BASE_URL}/announcements/${editingAnnouncement._id}`
        : `${appConfig.API_BASE_URL}/announcements`;
      
      const method = editingAnnouncement ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setShowCreateModal(false);
        setEditingAnnouncement(null);
        fetchAnnouncements(1, true);
        fetchStats();
        alert(editingAnnouncement ? 'Announcement updated successfully!' : 'Announcement created successfully!');
      } else {
        alert(data.message || 'Error saving announcement');
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Error saving announcement');
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowCreateModal(true);
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await fetch(`${appConfig.API_BASE_URL}/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        fetchAnnouncements(1, true);
        fetchStats();
        alert('Announcement deleted successfully!');
      } else {
        alert(data.message || 'Error deleting announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Error deleting announcement');
    }
  };

  const handleTogglePin = async (announcementId) => {
    try {
      const response = await fetch(`${appConfig.API_BASE_URL}/announcements/${announcementId}/pin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        fetchAnnouncements(1, true);
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleStatusChange = async (announcementId, newStatus) => {
    try {
      const response = await fetch(`${appConfig.API_BASE_URL}/announcements/${announcementId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        fetchAnnouncements(1, true);
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const statsData = [
    {
      name: "Total Announcements",
      value: stats.totalAnnouncements.toString(),
      change: "+5",
      changeType: "increase",
      icon: Bell,
      color: "primary",
    },
    {
      name: "Published Posts",
      value: stats.publishedAnnouncements.toString(),
      change: "+2",
      changeType: "increase",
      icon: Bell,
      color: "success",
    },
    {
      name: "Draft Posts",
      value: stats.draftAnnouncements.toString(),
      change: "-1",
      changeType: "decrease",
      icon: FileText,
      color: "warning",
    },
    {
      name: "Pinned Posts",
      value: stats.pinnedAnnouncements.toString(),
      change: "+1",
      changeType: "increase",
      icon: Pin,
      color: "secondary",
    },
  ];

  const isTeacher = user && user.role === 'teacher';
  const tabConfig = [
    { id: "all", name: "All Announcements", count: totalAnnouncements },
    ...(isTeacher ? [{ id: "mine", name: "My Announcements", count: announcements.filter(a => a.createdBy?._id === user._id).length }] : []),
    { id: "published", name: "Published", count: announcements.filter((a) => a.status === "published").length },
    { id: "draft", name: "Drafts", count: announcements.filter((a) => a.status === "draft").length },
    { id: "pinned", name: "Pinned", count: announcements.filter((a) => a.isPinned).length },
  ];

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTab = true;
    if (activeTab === "mine" && isTeacher) {
      matchesTab = announcement.createdBy?._id === user._id;
    } else {
      switch (activeTab) {
        case "published":
          matchesTab = announcement.status === "published";
          break;
        case "draft":
          matchesTab = announcement.status === "draft";
          break;
        case "pinned":
          matchesTab = announcement.isPinned;
          break;
        default:
          matchesTab = true;
      }
    }
    
    return matchesSearch && matchesTab;
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

  const getTargetAudienceLabel = (audience, targetClasses, targetIndividuals) => {
    switch (audience) {
      case "all":
        return "All Users";
      case "students":
        return "Students";
      case "teachers":
        return "Teachers";
      case "staff":
        return "Staff";
      case "class":
        return `Classes (${targetClasses?.length || 0})`;
      case "individual":
        return `Individuals (${targetIndividuals?.length || 0})`;
      default:
        return audience;
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

  const getTeacherName = (teacher) => {
    if (!teacher) return null;
    
    // Try different name formats
    if (teacher.name) return teacher.name;
    if (teacher.firstName || teacher.lastName) {
      return [teacher.firstName, teacher.middleName, teacher.lastName].filter(Boolean).join(" ");
    }
    if (teacher.email) return teacher.email.split('@')[0]; // Use email prefix as fallback
    return null;
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

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading announcements...</p>
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
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Announcements</h1>
              <p className="text-xl text-gray-600 mb-2">Create, manage, and share important announcements with your school community</p>
            </div>
            <div className="mt-6 lg:mt-0 flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setEditingAnnouncement(null);
                  setShowCreateModal(true);
                }}
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
            {statsData.map((stat, index) => {
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
                    onClick={() => {
                      setActiveTab(tab.id);
                      setCurrentPage(1);
                      fetchAnnouncements(1, true);
                    }}
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
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTerm(value);
                    }}
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
                  const priorityColor = getPriorityColor(announcement.priority);

                  return (
                    <motion.div
                      key={announcement._id}
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
                            <Bell
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
                                <span>{getTargetAudienceLabel(announcement.targetAudience, announcement.targetClasses, announcement.targetIndividuals)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>{announcement.views || 0} views</span>
                              </div>
                              <span>by {getTeacherName(announcement.createdBy) || 'Class Teacher'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <span
                            className={cn(
                              "px-3 py-1 text-xs font-medium rounded-full",
                              announcement.status === "published" && "bg-green-100 text-green-700",
                              announcement.status === "draft" && "bg-orange-100 text-orange-700",
                              announcement.status === "archived" && "bg-gray-100 text-gray-700"
                            )}
                          >
                            {announcement.status}
                          </span>

                          <div className="flex items-center space-x-1">
                            <button 
                              onClick={() => handleTogglePin(announcement._id)}
                              className={cn(
                                "p-2 rounded-lg transition-colors",
                                announcement.isPinned 
                                  ? "text-orange-600 bg-orange-50" 
                                  : "text-gray-400 hover:text-orange-600 hover:bg-orange-50"
                              )}
                            >
                              <Pin className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditAnnouncement(announcement)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteAnnouncement(announcement._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
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
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
                  <p className="text-gray-600 mb-6">
                    {activeTab === "all"
                      ? "Create your first announcement to get started."
                      : `No ${activeTab} announcements match your search.`}
                  </p>
                  {activeTab === "all" && (
                    <button
                      onClick={() => {
                        setEditingAnnouncement(null);
                        setShowCreateModal(true);
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Announcement
                    </button>
                  )}
                </div>
              )}

              {/* Pagination Controls */}
              {announcements.length > 0 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                  {/* Pagination Info */}
                  <div className="text-sm text-gray-600">
                    Showing {announcements.length} of {totalAnnouncements} announcements (Page {currentPage} of {totalPages})
                  </div>

                  {/* Pagination Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (currentPage > 1) {
                          const newPage = currentPage - 1;
                          setCurrentPage(newPage);
                          fetchAnnouncements(newPage, true);
                        }
                      }}
                      disabled={currentPage === 1}
                      className={cn(
                        "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        currentPage === 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => {
                              setCurrentPage(pageNum);
                              fetchAnnouncements(pageNum, true);
                            }}
                            className={cn(
                              "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                              currentPage === pageNum
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            )}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => {
                        if (currentPage < totalPages) {
                          const newPage = currentPage + 1;
                          setCurrentPage(newPage);
                          fetchAnnouncements(newPage, true);
                        }
                      }}
                      disabled={currentPage === totalPages}
                      className={cn(
                        "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        currentPage === totalPages
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      Next
                    </button>
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <button
                      onClick={() => {
                        const nextPage = currentPage + 1;
                        setCurrentPage(nextPage);
                        fetchAnnouncements(nextPage, false);
                      }}
                      disabled={loadingMore}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                  )}
                </div>
              )}

              {/* Loading More Indicator */}
              {loadingMore && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading more announcements...</p>
                </div>
              )}


            </div>
          </motion.div>
        </motion.div>

        {/* Announcement Modal */}
        <AnnouncementModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAnnouncement(null);
          }}
          announcement={editingAnnouncement}
          onSave={handleSaveAnnouncement}
          classes={classes}
          users={users}
        />
      </div>
    </Layout>
  );
};

export default Announcements;

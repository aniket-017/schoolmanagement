import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useTeacherAuth } from "../context/TeacherAuthContext";
import apiService from "../services/apiService";
import HomeworkCard from "../components/HomeworkCard";
import HomeworkModal from "../components/HomeworkModal";
import HomeworkStats from "../components/HomeworkStats";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import HomeworkDetailModal from "../components/HomeworkDetailModal";

const TeacherHomework = () => {
  const { user } = useTeacherAuth();
  const navigate = useNavigate();
  const [homework, setHomework] = useState([]);
  const [filteredHomework, setFilteredHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("list"); // 'list' or 'calendar'
  const [filter, setFilter] = useState("all"); // 'all', 'due_today', 'due_tomorrow', 'overdue', 'active'
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("dueDate"); // 'dueDate', 'assignedDate', 'subject', 'class'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);
  const [homeworkStats, setHomeworkStats] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingHomeworkId, setDeletingHomeworkId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [includeCompleted, setIncludeCompleted] = useState(false);

  useEffect(() => {
    loadHomework();
  }, []);

  useEffect(() => {
    filterAndSortHomework();
  }, [homework, filter, searchTerm, sortBy, sortOrder]);

  const loadHomework = async () => {
    try {
      setLoading(true);
      const [homeworkResponse, statsResponse] = await Promise.all([
        apiService.homework.getAll({ limit: 200, includeInactive: true }),
        apiService.homework.getStats(),
      ]);

      if (homeworkResponse.success) {
        setHomework(homeworkResponse.data || []);
      } else {
        setError("Failed to load homework");
      }

      if (statsResponse.success) {
        setHomeworkStats(statsResponse.data || {});
      }
    } catch (error) {
      console.error("Error loading homework:", error);
      setError("Error loading homework");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortHomework = () => {
    let filtered = [...homework];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (hw) =>
          hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hw.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hw.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hw.classId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (filter) {
      case "due_today":
        filtered = filtered.filter((hw) => {
          const today = new Date();
          const dueDate = new Date(hw.dueDate);
          return dueDate.toDateString() === today.toDateString();
        });
        break;
      case "due_tomorrow":
        filtered = filtered.filter((hw) => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dueDate = new Date(hw.dueDate);
          return dueDate.toDateString() === tomorrow.toDateString();
        });
        break;
      case "overdue":
        filtered = filtered.filter((hw) => {
          const now = new Date();
          const dueDate = new Date(hw.dueDate);
          return dueDate < now;
        });
        break;
      case "active":
        filtered = filtered.filter((hw) => hw.isActive !== false);
        break;
      default:
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "dueDate":
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        case "assignedDate":
          aValue = new Date(a.assignedDate);
          bValue = new Date(b.assignedDate);
          break;
        case "subject":
          aValue = a.subjectId?.name || "";
          bValue = b.subjectId?.name || "";
          break;
        case "class":
          aValue = a.classId?.name || "";
          bValue = b.classId?.name || "";
          break;
        default:
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredHomework(filtered);
  };

  const handleCreateHomework = () => {
    setEditingHomework(null);
    setShowHomeworkModal(true);
  };

  const handleEditHomework = (homework) => {
    setEditingHomework(homework);
    setShowHomeworkModal(true);
  };

  const handleDeleteHomework = (homeworkId) => {
    setDeletingHomeworkId(homeworkId);
    setShowDeleteModal(true);
  };

  // Mark homework as completed/archived so it doesn't count as overdue
  const handleCompleteHomework = async (homeworkId) => {
    try {
      const response = await apiService.homework.update(homeworkId, { isActive: false });
      if (response.success) {
        setHomework((prev) => prev.filter((hw) => hw._id !== homeworkId));
        // Refresh stats to reflect archive
        const statsResponse = await apiService.homework.getStats();
        if (statsResponse.success) {
          setHomeworkStats(statsResponse.data || {});
        }
      } else {
        alert("Failed to mark as completed");
      }
    } catch (error) {
      console.error("Error marking complete:", error);
      alert("Error marking homework as completed");
    }
  };

  const confirmDeleteHomework = async () => {
    if (!deletingHomeworkId) return;

    try {
      const response = await apiService.homework.delete(deletingHomeworkId);
      if (response.success) {
        setHomework((prev) => prev.filter((hw) => hw._id !== deletingHomeworkId));
        // Reload stats after deletion
        const statsResponse = await apiService.homework.getStats();
        if (statsResponse.success) {
          setHomeworkStats(statsResponse.data || {});
        }
      } else {
        alert("Failed to delete homework");
      }
    } catch (error) {
      console.error("Error deleting homework:", error);
      alert("Error deleting homework");
    } finally {
      setShowDeleteModal(false);
      setDeletingHomeworkId(null);
    }
  };

  const cancelDeleteHomework = () => {
    setShowDeleteModal(false);
    setDeletingHomeworkId(null);
  };

  const handleViewHomeworkDetails = (homework) => {
    setSelectedHomework(homework);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedHomework(null);
  };

  const handleHomeworkSuccess = (newHomework) => {
    if (editingHomework) {
      setHomework((prev) => prev.map((hw) => (hw._id === newHomework._id ? newHomework : hw)));
    } else {
      setHomework((prev) => [newHomework, ...prev]);
    }
    setShowHomeworkModal(false);
    setEditingHomework(null);

    // Reload stats after creation/update
    loadHomework();
  };

  const getFilterCount = (filterType) => {
    switch (filterType) {
      case "due_today":
        return homework.filter((hw) => {
          const today = new Date();
          const dueDate = new Date(hw.dueDate);
          return dueDate.toDateString() === today.toDateString();
        }).length;
      case "due_tomorrow":
        return homework.filter((hw) => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dueDate = new Date(hw.dueDate);
          return dueDate.toDateString() === tomorrow.toDateString();
        }).length;
      case "overdue":
        return homework.filter((hw) => {
          const now = new Date();
          const dueDate = new Date(hw.dueDate);
          return dueDate < now;
        }).length;
      case "active":
        return homework.filter((hw) => hw.isActive !== false).length;
      case "completed":
        return homework.filter((hw) => hw.isActive === false).length;
      default:
        return homework.length;
    }
  };

  const handleBack = () => {
    navigate("/teacher/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading homework...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpenIcon className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Error Loading Homework</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadHomework}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 text-white"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Homework Management</h1>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-blue-100 text-sm font-medium">Manage Assignments</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center sm:justify-end space-x-3">
                <button
                  onClick={handleCreateHomework}
                  className="flex items-center px-4 py-3 bg-white text-blue-600 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Homework
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Section */}
        <div className="mb-4 sm:mb-8">
          <HomeworkStats stats={homeworkStats} isTeacher={true} />
        </div>

        {/* Filters and Search */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-100 p-3 sm:p-4 mb-6 sm:mb-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters((v) => !v)}
                className="inline-flex items-center px-3 py-2 bg-white text-blue-600 rounded-xl font-semibold text-sm shadow-sm hover:shadow transition"
              >
                <FunnelIcon className="w-4 h-4 mr-2" />
                {showFilters ? "Hide Filters" : "Show Search & Filters"}
              </button>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-700 bg-white rounded-lg px-2 py-1 border">
                  <input
                    type="checkbox"
                    checked={includeCompleted}
                    onChange={(e) => setIncludeCompleted(e.target.checked)}
                  />
                  <span>Include Completed</span>
                </label>
              </div>
            </div>

            {showFilters && (
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search homework..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm sm:text-base font-medium placeholder-gray-400 transition-all duration-200 shadow-sm"
                  />
                </div>

                {/* Filters - Mobile Optimized */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center lg:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center space-x-2 sm:space-x-3 bg-white rounded-xl p-2 sm:p-3 shadow-sm border border-blue-100">
                    <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg">
                      <FunnelIcon className="w-4 h-4 sm:w-4 sm:h-4 text-blue-600" />
                    </div>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-transparent border-none focus:ring-0 focus:outline-none text-xs sm:text-sm font-medium text-gray-700"
                    >
                      <option value="all">All ({getFilterCount("all")})</option>
                      <option value="active">Active ({getFilterCount("active")})</option>
                      <option value="completed">Completed ({getFilterCount("completed")})</option>
                      <option value="due_today">Due Today ({getFilterCount("due_today")})</option>
                      <option value="due_tomorrow">Due Tomorrow ({getFilterCount("due_tomorrow")})</option>
                      <option value="overdue">Overdue ({getFilterCount("overdue")})</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 sm:space-x-3 bg-white rounded-xl p-2 sm:p-3 shadow-sm border border-blue-100">
                    <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-indigo-100 rounded-lg">
                      <span className="text-[10px] sm:text-xs font-bold text-indigo-600">S</span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-medium text-gray-500 whitespace-nowrap">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-transparent border-none focus:ring-0 focus:outline-none text-xs sm:text-sm font-medium text-gray-700"
                    >
                      <option value="dueDate">Due Date</option>
                      <option value="assignedDate">Assigned Date</option>
                      <option value="subject">Subject</option>
                      <option value="class">Class</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-xs sm:text-sm font-bold text-gray-600"
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 sm:space-y-6">
          {filteredHomework.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border p-8 sm:p-12 text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpenIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Homework Found</h3>
              <p className="text-sm sm:text-base text-gray-600 px-4 mb-6">
                {searchTerm || filter !== "all"
                  ? "No homework matches your current filters. Try adjusting your search or filters."
                  : "You haven't created any homework assignments yet."}
              </p>
              <button
                onClick={handleCreateHomework}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Your First Homework
              </button>
            </motion.div>
          ) : (
            <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredHomework
                .filter((hw) => (includeCompleted ? true : hw.isActive !== false))
                .map((hw) => (
                  <motion.div
                    key={hw._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <HomeworkCard
                      homework={hw}
                      isTeacher={true}
                      onEdit={handleEditHomework}
                      onDelete={handleDeleteHomework}
                      onComplete={handleCompleteHomework}
                      onViewDetails={() => handleViewHomeworkDetails(hw)}
                    />
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Homework Modal */}
      {showHomeworkModal && (
        <HomeworkModal
          isOpen={showHomeworkModal}
          onClose={() => setShowHomeworkModal(false)}
          onSuccess={handleHomeworkSuccess}
          homework={editingHomework}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteHomework}
        onConfirm={confirmDeleteHomework}
        title="Delete Homework"
        message="Are you sure you want to delete this homework? This action cannot be undone."
        itemName="homework"
      />

      {/* Homework Detail Modal */}
      <HomeworkDetailModal
        isOpen={showDetailModal}
        onClose={closeDetailModal}
        homework={selectedHomework}
        isTeacher={true}
        onEdit={handleEditHomework}
        onDelete={handleDeleteHomework}
        onComplete={(hw) => handleCompleteHomework(hw._id)}
      />
    </div>
  );
};

export default TeacherHomework;

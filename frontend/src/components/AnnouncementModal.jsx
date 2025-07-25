import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  User,
  GraduationCap,
  Calendar,
  Clock,
  Pin,
  Bell,
  FileText,
  AlertCircle,
  Info,
  CheckCircle,
  ChevronDown,
  Search,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "../utils/cn";

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

const AnnouncementModal = ({
  isOpen,
  onClose,
  announcement = null,
  onSave,
  classes = [],
  users = [],
}) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "medium",
    targetAudience: "all",
    targetClasses: [],
    targetIndividuals: [],
    expiryDate: "",
    attachments: [],
    images: [],
    sendNotification: true,
    isPinned: false,
    scheduledFor: "",
    isScheduled: false,
    status: "draft",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Use useMemo to prevent infinite re-renders
  const filteredUsers = useMemo(() => {
    if (searchTerm) {
      return users.filter(
        user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return users.slice(0, 10);
    }
  }, [searchTerm, users]);

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || "",
        content: announcement.content || "",
        priority: announcement.priority || "medium",
        targetAudience: announcement.targetAudience || "all",
        targetClasses: announcement.targetClasses?.map(c => c._id || c) || [],
        targetIndividuals: announcement.targetIndividuals?.map(u => u._id || u) || [],
        expiryDate: announcement.expiryDate ? new Date(announcement.expiryDate).toISOString().split('T')[0] : "",
        attachments: announcement.attachments || [],
        images: announcement.images || [],
        sendNotification: announcement.sendNotification !== false,
        isPinned: announcement.isPinned || false,
        scheduledFor: announcement.scheduledFor ? new Date(announcement.scheduledFor).toISOString().slice(0, 16) : "",
        isScheduled: announcement.isScheduled || false,
        status: announcement.status || "draft",
      });
      setSelectedUsers(announcement.targetIndividuals || []);
    } else {
      setFormData({
        title: "",
        content: "",
        priority: "medium",
        targetAudience: "all",
        targetClasses: [],
        targetIndividuals: [],
        expiryDate: "",
        attachments: [],
        images: [],
        sendNotification: true,
        isPinned: false,
        scheduledFor: "",
        isScheduled: false,
        status: "draft",
      });
      setSelectedUsers([]);
    }
  }, [announcement]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleTargetAudienceChange = useCallback((audience) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: audience,
      targetClasses: audience === "class" ? prev.targetClasses : [],
      targetIndividuals: audience === "individual" ? prev.targetIndividuals : [],
    }));
  }, []);

  const handleClassToggle = useCallback((classId) => {
    setFormData(prev => ({
      ...prev,
      targetClasses: prev.targetClasses.includes(classId)
        ? prev.targetClasses.filter(id => id !== classId)
        : [...prev.targetClasses, classId],
    }));
  }, []);

  const handleUserToggle = useCallback((user) => {
    const userId = user._id || user;
    setFormData(prev => ({
      ...prev,
      targetIndividuals: prev.targetIndividuals.includes(userId)
        ? prev.targetIndividuals.filter(id => id !== userId)
        : [...prev.targetIndividuals, userId],
    }));
    setSelectedUsers(prev =>
      prev.find(u => (u._id || u) === userId)
        ? prev.filter(u => (u._id || u) !== userId)
        : [...prev, user]
    );
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Title and content are required");
      return;
    }

    if (formData.targetAudience === "class" && formData.targetClasses.length === 0) {
      alert("Please select at least one class");
      return;
    }

    if (formData.targetAudience === "individual" && formData.targetIndividuals.length === 0) {
      alert("Please select at least one individual");
      return;
    }

    onSave(formData);
  }, [formData, onSave]);

  const getPriorityIcon = useCallback((priority) => {
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
  }, []);

  const getPriorityColor = useCallback((priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-orange-600 bg-orange-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  }, []);

  const getTargetAudienceIcon = useCallback((audience) => {
    switch (audience) {
      case "all":
        return Users;
      case "students":
        return GraduationCap;
      case "teachers":
        return User;
      case "staff":
        return Users;
      case "class":
        return GraduationCap;
      case "individual":
        return User;
      default:
        return Users;
    }
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {announcement ? "Edit Announcement" : "Create New Announcement"}
              </h2>
              <p className="text-gray-600 mt-1">
                {announcement ? "Update announcement details" : "Share important information with your school community"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Basic Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter announcement title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter announcement content"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["low", "medium", "high"].map((priority) => {
                        const Icon = getPriorityIcon(priority);
                        return (
                          <button
                            key={priority}
                            type="button"
                            onClick={() => handleInputChange("priority", priority)}
                            className={cn(
                              "flex items-center justify-center px-3 py-2 rounded-lg border transition-all",
                              formData.priority === priority
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-300 hover:border-gray-400"
                            )}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Targeting */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Target Audience
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: "all", label: "All Users", icon: Users },
                    { value: "students", label: "Students", icon: GraduationCap },
                    { value: "teachers", label: "Teachers", icon: User },
                    { value: "staff", label: "Staff", icon: Users },
                    { value: "class", label: "Specific Classes", icon: GraduationCap },
                    { value: "individual", label: "Individual Users", icon: User },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleTargetAudienceChange(option.value)}
                        className={cn(
                          "flex flex-col items-center p-4 rounded-lg border transition-all",
                          formData.targetAudience === option.value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 hover:border-gray-400"
                        )}
                      >
                        <Icon className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Class Selection */}
                {formData.targetAudience === "class" && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Classes
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
                      {classes.map((cls) => (
                        <button
                          key={cls._id}
                          type="button"
                          onClick={() => handleClassToggle(cls._id)}
                          className={cn(
                            "flex items-center p-3 rounded-lg border transition-all text-left",
                            formData.targetClasses.includes(cls._id)
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 hover:border-gray-400"
                          )}
                        >
                          <div>
                            <div className="font-medium">{cls.grade}{getOrdinalSuffix(cls.grade)} Class - {cls.division}</div>
                            <div className="text-sm text-gray-500">Section {cls.division}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Individual User Selection */}
                {formData.targetAudience === "individual" && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Individual Users
                    </label>
                    
                    <div className="relative">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <Search className="w-5 h-5 text-gray-400 ml-3" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search users..."
                          className="flex-1 px-3 py-3 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowUserSearch(!showUserSearch)}
                          className="p-3 hover:bg-gray-50"
                        >
                          <ChevronDown className={cn("w-5 h-5 transition-transform", showUserSearch && "rotate-180")} />
                        </button>
                      </div>

                      {showUserSearch && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                          {filteredUsers.map((user) => (
                            <button
                              key={user._id}
                              type="button"
                              onClick={() => handleUserToggle(user)}
                              className={cn(
                                "w-full flex items-center p-3 hover:bg-gray-50 transition-colors",
                                selectedUsers.find(u => (u._id || u) === user._id) && "bg-blue-50"
                              )}
                            >
                              <div className="flex-1 text-left">
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                              {selectedUsers.find(u => (u._id || u) === user._id) && (
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Selected Users ({selectedUsers.length})
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedUsers.map((user) => (
                            <div
                              key={user._id || user}
                              className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                            >
                              <span>{user.name}</span>
                              <button
                                type="button"
                                onClick={() => handleUserToggle(user)}
                                className="ml-2 hover:text-blue-900"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Scheduling & Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Scheduling & Options
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schedule For
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledFor}
                      onChange={(e) => handleInputChange("scheduledFor", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isScheduled}
                      onChange={(e) => handleInputChange("isScheduled", e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Schedule this announcement for later
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.sendNotification}
                      onChange={(e) => handleInputChange("sendNotification", e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Send push notification
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => handleInputChange("isPinned", e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Pin this announcement
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {announcement ? "Update Announcement" : "Create Announcement"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnnouncementModal; 
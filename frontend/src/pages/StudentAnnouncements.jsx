import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MegaphoneIcon,
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  BellIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/apiService";
import logo from "../assets/logo.png";

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);

  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      fetchAnnouncements();
    }
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const userId = user?._id || user?.id;
      if (userId) {
        const response = await apiService.announcements.getAnnouncementsForStudent(userId, {
          activeOnly: true,
        });
        if (response.success) {
          setAnnouncements(response.data || []);
        }
      }
    } catch (error) {
      console.log("Error fetching announcements:", error.message);
      setAnnouncements([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTargetAudienceLabel = (audience, targetClasses) => {
    switch (audience) {
      case "all":
        return "For All Students";
      case "students":
        return "For Students";
      case "class":
        return `For Class ${targetClasses?.[0]?.name || targetClasses?.[0]?.grade + targetClasses?.[0]?.division || "Unknown"}`;
      case "individual":
        return "For Specific Students";
      default:
        return `For ${audience || "Students"}`;
    }
  };

  const getTeacherName = (teacher) => {
    if (!teacher) return "Class Teacher";
    if (teacher.name) return teacher.name;
    if (teacher.firstName || teacher.lastName) {
      return [teacher.firstName, teacher.middleName, teacher.lastName].filter(Boolean).join(" ");
    }
    if (teacher.email) return teacher.email.split("@")[0];
    return "Class Teacher";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  if (mobileView) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex items-center justify-between p-4">
            <Link to="/student/dashboard" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>

            <div className="flex items-center space-x-3">
              <img src={logo} alt="Logo" className="h-8 w-auto" />
            </div>

            <div className="w-10"></div> {/* Spacer for centering */}
          </div>

          <div className="px-4 pb-6">
            <h1 className="text-xl font-bold text-white">Announcements</h1>
            <p className="text-white/80 text-sm">Stay updated with school news</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 space-y-4 pb-24">
          {announcements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <MegaphoneIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
              <p className="text-gray-500">Check back later for updates</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {announcements.map((announcement, index) => (
                <motion.div
                  key={announcement._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    setSelectedAnnouncement(announcement);
                    setShowAnnouncementModal(true);
                  }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <BellIcon className="w-5 h-5 text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {announcement.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {announcement.content}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <UserIcon className="w-3 h-3" />
                          <span>{getTeacherName(announcement.createdBy)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{formatDate(announcement.createdAt)}</span>
                        </div>
                      </div>

                      <div className="mt-2">
                        <span className="text-xs text-gray-500 italic">
                          {getTargetAudienceLabel(announcement.targetAudience, announcement.targetClasses)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Announcement Details Modal */}
        {showAnnouncementModal && selectedAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAnnouncementModal(false)}></div>
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto relative">
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 mb-2">{selectedAnnouncement.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedAnnouncement.content}</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>By {getTeacherName(selectedAnnouncement.createdBy)}</span>
                  <span>{formatDate(selectedAnnouncement.createdAt)}</span>
                </div>
                <p className="text-xs text-gray-500 italic">
                  {getTargetAudienceLabel(selectedAnnouncement.targetAudience, selectedAnnouncement.targetClasses)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop View
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/student/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-6 h-6" />
              </Link>
              <img src={logo} alt="Logo" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Announcements</h1>
                <p className="text-sm text-gray-600">Stay updated with school news</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {announcements.length === 0 ? (
          <div className="text-center py-16">
            <MegaphoneIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
            <p className="text-gray-500">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-6">
            {announcements.map((announcement, index) => (
              <motion.div
                key={announcement._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  setSelectedAnnouncement(announcement);
                  setShowAnnouncementModal(true);
                }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BellIcon className="w-6 h-6 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{announcement.content}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <UserIcon className="w-4 h-4" />
                          <span>{getTeacherName(announcement.createdBy)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{formatDate(announcement.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="text-xs text-gray-500 italic">
                        {getTargetAudienceLabel(announcement.targetAudience, announcement.targetClasses)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Announcement Details Modal for Desktop */}
        {showAnnouncementModal && selectedAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAnnouncementModal(false)}></div>
            <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedAnnouncement.title}</h2>
                <p className="text-gray-600 leading-relaxed">{selectedAnnouncement.content}</p>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>By {getTeacherName(selectedAnnouncement.createdBy)}</span>
                  <span>{formatDate(selectedAnnouncement.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-500 italic">
                  {getTargetAudienceLabel(selectedAnnouncement.targetAudience, selectedAnnouncement.targetClasses)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAnnouncements; 
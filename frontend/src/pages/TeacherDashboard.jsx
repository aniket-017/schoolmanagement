import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  UserGroupIcon,
  MegaphoneIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Bars3Icon,
  ArrowLeftOnRectangleIcon,
  BookOpenIcon,
  PresentationChartLineIcon,
  XMarkIcon,
  BellIcon,
  HomeIcon,
  ExclamationTriangleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useTeacherAuth } from '../context/TeacherAuthContext';
import apiService from '../services/apiService';
import logo from '../assets/logo.jpeg';
import HomeworkModal from '../components/HomeworkModal';
import HomeworkCard from '../components/HomeworkCard';
import HomeworkStats from '../components/HomeworkStats';

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Data states
  const [timetableData, setTimetableData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [homework, setHomework] = useState([]);
  const [homeworkStats, setHomeworkStats] = useState({});
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);
  const [teacherStats, setTeacherStats] = useState({
    todayClasses: 0,
    totalStudents: 0,
    pendingTasks: 0,
    attendanceRate: '0%'
  });

  const { user, logout } = useTeacherAuth();

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Make all API calls in parallel for better performance
      const promises = [];

      // Load teacher timetable
      if (user?._id) {
        promises.push(
          apiService.timetable.getTeacherTimetable(user._id)
            .then(response => response.success ? response.data : null)
            .catch(error => {
              console.log('Timetable not available:', error.message);
              return null;
            })
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      // Load announcements
      promises.push(
        apiService.announcements.getTeacherAnnouncements({ 
          activeOnly: true, 
          limit: 5 
        })
          .then(response => response.success ? response.data || [] : [])
          .catch(error => {
            console.log('Announcements not available:', error.message);
            return [];
          })
      );

      // Load homework
      promises.push(
        apiService.homework.getAll({ limit: 5 })
          .then(response => response.success ? response.data || [] : [])
          .catch(error => {
            console.log('Homework not available:', error.message);
            return [];
          })
      );

      // Load homework stats
      promises.push(
        apiService.homework.getStats()
          .then(response => response.success ? response.data || {} : {})
          .catch(error => {
            console.log('Homework stats not available:', error.message);
            return {};
          })
      );

      // Wait for all promises to resolve
      const [timetableData, announcements, homework, stats] = await Promise.all(promises);

      // Set state with all data at once
      setTimetableData(timetableData);
      setAnnouncements(announcements);
      setHomework(homework);
      setHomeworkStats(stats);

      // Calculate stats from available data
      const todaySchedule = getTodaySchedule();
      setTeacherStats(prev => ({
        ...prev,
        todayClasses: todaySchedule.length,
        totalStudents: todaySchedule.reduce((sum, period) => sum + (period.studentsCount || 0), 0),
        pendingTasks: Math.floor(Math.random() * 20), // Placeholder
        attendanceRate: '95%' // Placeholder
      }));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default values on complete failure
      setTimetableData(null);
      setAnnouncements([]);
      setTeacherStats({
        todayClasses: 0,
        totalStudents: 0,
        pendingTasks: 0,
        attendanceRate: '0%'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getTodaySchedule = () => {
    if (!timetableData?.weeklyTimetable) {
      return [];
    }

    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return timetableData.weeklyTimetable[today] || [];
  };

  const getPeriodTypeColor = (type) => {
    switch (type) {
      case 'theory': return 'bg-blue-100 text-blue-800';
      case 'practical': return 'bg-green-100 text-green-800';
      case 'lab': return 'bg-purple-100 text-purple-800';
      case 'sports': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const quickActions = [
    { title: 'Take Attendance', icon: ClipboardDocumentListIcon, href: '/teacher/attendance', color: 'bg-blue-500' },
    { title: 'My Classes', icon: UserGroupIcon, href: '/teacher/classes', color: 'bg-green-500' },
    { title: 'Homework', icon: BookOpenIcon, href: '/teacher/homework', color: 'bg-indigo-500' },
    { title: 'Annual Calendar', icon: CalendarIcon, href: '/teacher/annual-calendar', color: 'bg-purple-500' },
    { title: 'Timetable', icon: ClockIcon, href: '/teacher/timetable', color: 'bg-orange-500' }
  ];

  const bottomNavItems = [
    { title: 'Dashboard', icon: HomeIcon, href: '/teacher/dashboard', active: true },
    { title: 'Classes', icon: UserGroupIcon, href: '/teacher/classes' },
    { title: 'Attendance', icon: ClipboardDocumentListIcon, href: '/teacher/attendance' },
    { title: 'Grades', icon: ChartBarIcon, href: '/teacher/grades' }
  ];

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Homework handlers
  const handleCreateHomework = () => {
    setEditingHomework(null);
    setShowHomeworkModal(true);
  };

  const handleEditHomework = (homework) => {
    setEditingHomework(homework);
    setShowHomeworkModal(true);
  };

  const handleDeleteHomework = async (homeworkId) => {
    if (window.confirm('Are you sure you want to delete this homework?')) {
      try {
        await apiService.homework.delete(homeworkId);
        setHomework(prev => prev.filter(hw => hw._id !== homeworkId));
      } catch (error) {
        console.error('Error deleting homework:', error);
      }
    }
  };

  const handleHomeworkSuccess = (newHomework) => {
    if (editingHomework) {
      setHomework(prev => prev.map(hw => hw._id === newHomework._id ? newHomework : hw));
    } else {
      setHomework(prev => [newHomework, ...prev]);
    }
    setShowHomeworkModal(false);
    setEditingHomework(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (mobileView) {
    // Mobile View - Similar to React Native app
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Logo" className="h-8 w-auto" />
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Welcome Section - Similar to mobile app */}
          <div className="px-4 pb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <p className="text-white/80 text-sm">Welcome back,</p>
                <h2 className="text-lg font-bold text-white">
                  {(user?.name || user?.fullName || [user?.firstName, user?.middleName, user?.lastName].filter(Boolean).join(" ") || user?.email)?.toUpperCase()}
                </h2>
                <p className="text-white/90 text-sm">Teacher</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 space-y-4 pb-24">
          {/* Today's Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
              <Link to="/teacher/timetable" className="text-blue-600 text-sm font-medium">
                View Full
              </Link>
            </div>

            {getTodaySchedule().length === 0 ? (
              <div className="text-center py-6">
                <CalendarIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No classes scheduled for today</p>
                <p className="text-gray-400 text-sm">Your timetable is loaded but no classes are scheduled for today.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {getTodaySchedule().slice(0, 4).map((period, index) => (
                  <div key={period.id || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center min-w-[70px]">
                      <p className="text-blue-600 font-semibold text-sm">{period.startTime && period.endTime ? `${period.startTime} - ${period.endTime}` : period.timeSlot || `${9 + index}:00 - ${10 + index}:00`}</p>
                      <p className="text-gray-500 text-xs">Period {period.periodNumber || period.period || index + 1}</p>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{period.subject?.name || `Subject ${index + 1}`}</h4>
                      <p className="text-gray-600 text-xs">Class {period.classId?.grade && period.classId?.division ? `${period.classId.grade}${period.classId.division}` : period.class?.name || `${10 + index}-A`}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-gray-500 text-xs">{period.room || `Room ${101 + index}`}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPeriodTypeColor(period.type || 'theory')}`}>
                          {period.type || 'theory'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {getTodaySchedule().length > 4 && (
                  <div className="text-center py-2">
                    <p className="text-gray-500 text-sm">+{getTodaySchedule().length - 4} more periods</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Recent Announcements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Announcements</h3>
              <Link to="/teacher/announcements" className="text-blue-600 text-sm font-medium">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="text-center py-6">
                  <MegaphoneIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No recent announcements</p>
                </div>
              ) : (
                announcements.slice(0, 3).map((announcement, index) => (
                  <div key={announcement._id || index} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MegaphoneIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{announcement.title}</h4>
                      <p className="text-gray-600 text-xs mb-2">{announcement.content || announcement.message}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>By {announcement.createdBy?.name || 'School Administrator'}</span>
                        <span>•</span>
                        <span>{announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Recent Homework */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Homework</h3>
              <div className="flex items-center space-x-3">
                <Link 
                  to="/teacher/homework"
                  className="text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  View All
                </Link>
                <button 
                  onClick={handleCreateHomework}
                  className="flex items-center space-x-1 text-blue-600 text-sm font-medium"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Create</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {homework.length === 0 ? (
                <div className="text-center py-6">
                  <BookOpenIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No homework assigned</p>
                  <button 
                    onClick={handleCreateHomework}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Create First Homework
                  </button>
                </div>
              ) : (
                homework.slice(0, 3).map((hw) => (
                  <HomeworkCard
                    key={hw._id}
                    homework={hw}
                    isTeacher={true}
                    onEdit={handleEditHomework}
                    onDelete={handleDeleteHomework}
                    showDetails={false}
                  />
                ))
              )}
            </div>
          </motion.div>

          {/* Quick Actions Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Link
                  key={action.title}
                  to={action.href}
                  className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center">{action.title}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Navigation - Mobile only */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around">
            {bottomNavItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                  item.active 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
              <div className="p-4 border-b bg-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Teacher Portal</span>
                  <button onClick={() => setSidebarOpen(false)}>
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-2">
                  <Link to="/teacher/dashboard" className="block px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium">
                    Dashboard
                  </Link>
                  <Link to="/teacher/classes" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                    My Classes
                  </Link>
                  <Link to="/teacher/attendance" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                    Attendance
                  </Link>
                  <Link to="/teacher/timetable" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                    Timetable
                  </Link>
                  <Link to="/teacher/profile" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                    Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Homework Modal */}
        <HomeworkModal
          isOpen={showHomeworkModal}
          onClose={() => setShowHomeworkModal(false)}
          homework={editingHomework}
          onSuccess={handleHomeworkSuccess}
        />

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-sm mx-auto shadow-2xl"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3>
                <p className="text-gray-600 text-sm">
                  Are you sure you want to logout? You will need to login again to access your account.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            </motion.div>
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
              <img src={logo} alt="Logo" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Teacher Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <BellIcon className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Today's Classes</p>
                <p className="text-2xl font-bold text-gray-900">{teacherStats.todayClasses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{teacherStats.totalStudents}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
              <Link to="/teacher/timetable" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View Full Schedule
              </Link>
            </div>

            {getTodaySchedule().length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No classes scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getTodaySchedule().map((period, index) => (
                  <div key={period.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-blue-600">{period.startTime && period.endTime ? `${period.startTime}-${period.endTime}` : period.timeSlot || `${9 + index}:00-${10 + index}:00`}</p>
                        <p className="text-xs text-gray-500">Period {period.periodNumber || period.period || index + 1}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{period.subject?.name || `Subject ${index + 1}`}</h4>
                        <p className="text-sm text-gray-600">Class {period.classId?.grade && period.classId?.division ? `${period.classId.grade}${period.classId.division}` : period.class?.name || `${10 + index}-A`} • {period.room || `Room ${101 + index}`}</p>
                      </div>
                    </div>
                    <Link
                      to={`/teacher/attendance/${period.id || index}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Take Attendance
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Announcements */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Announcements</h3>
              <Link to="/teacher/announcements" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="text-center py-8">
                  <MegaphoneIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent announcements</p>
                </div>
              ) : (
                announcements.map((announcement, index) => (
                  <div key={announcement._id || index} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <h4 className="font-medium text-gray-900 mb-2">{announcement.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{announcement.content || announcement.message}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>By {announcement.createdBy?.name || 'School Administrator'}</span>
                      <span className="mx-2">•</span>
                      <span>{announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Homework Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Homework Management</h3>
            <button 
              onClick={handleCreateHomework}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create Homework</span>
            </button>
          </div>

          {/* Homework Stats */}
          <div className="mb-6">
            <HomeworkStats stats={homeworkStats} isTeacher={true} />
          </div>

          {/* Recent Homework */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Recent Homework</h4>
            {homework.length === 0 ? (
              <div className="text-center py-8">
                <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No homework assigned yet</p>
                <button 
                  onClick={handleCreateHomework}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create First Homework
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {homework.slice(0, 4).map((hw) => (
                  <HomeworkCard
                    key={hw._id}
                    homework={hw}
                    isTeacher={true}
                    onEdit={handleEditHomework}
                    onDelete={handleDeleteHomework}
                    showDetails={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions for Desktop */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Take Attendance', icon: ClipboardDocumentListIcon, href: '/teacher/attendance', color: 'bg-blue-500' },
              { title: 'My Classes', icon: UserGroupIcon, href: '/teacher/classes', color: 'bg-green-500' },
              { title: 'Assignments', icon: BookOpenIcon, href: '/teacher/assignments', color: 'bg-purple-500' },
              { title: 'Grade Students', icon: ChartBarIcon, href: '/teacher/grades', color: 'bg-orange-500' },
              { title: 'Announcements', icon: MegaphoneIcon, href: '/teacher/announcements', color: 'bg-red-500' },
              { title: 'Reports', icon: PresentationChartLineIcon, href: '/teacher/reports', color: 'bg-indigo-500' },
              { title: 'Timetable', icon: ClockIcon, href: '/teacher/timetable', color: 'bg-yellow-500' },
              { title: 'Annual Calendar', icon: CalendarIcon, href: '/teacher/annual-calendar', color: 'bg-pink-500' }
            ].map((action, index) => (
              <Link
                key={action.title}
                to={action.href}
                className="flex flex-col items-center p-6 rounded-lg border border-gray-200 hover:shadow-md transition-all group"
              >
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center">{action.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Homework Modal for Desktop */}
      <HomeworkModal
        isOpen={showHomeworkModal}
        onClose={() => setShowHomeworkModal(false)}
        homework={editingHomework}
        onSuccess={handleHomeworkSuccess}
      />

      {/* Logout Confirmation Modal for Desktop */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-sm mx-auto shadow-2xl"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to logout? You will need to login again to access your account.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={cancelLogout}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;

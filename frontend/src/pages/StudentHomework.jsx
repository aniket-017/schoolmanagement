import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpenIcon, 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import HomeworkCard from '../components/HomeworkCard';
import HomeworkCalendar from '../components/HomeworkCalendar';
import HomeworkDetailModal from '../components/HomeworkDetailModal';

  const StudentHomework = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [homework, setHomework] = useState([]);
    const [filteredHomework, setFilteredHomework] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
      const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [filter, setFilter] = useState('all'); // 'all', 'due_today', 'due_tomorrow', 'overdue', 'completed'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate'); // 'dueDate', 'assignedDate', 'subject'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);

      const handleBack = () => {
    navigate('/student/dashboard');
  };

  const handleViewHomeworkDetails = (homework) => {
    setSelectedHomework(homework);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedHomework(null);
  };

  useEffect(() => {
    loadHomework();
  }, []);

  useEffect(() => {
    filterAndSortHomework();
  }, [homework, filter, searchTerm, sortBy, sortOrder]);

  const loadHomework = async () => {
    try {
      setLoading(true);
      const response = await apiService.homework.getAll({ limit: 100 });
      
      if (response.success) {
        setHomework(response.data || []);
      } else {
        setError('Failed to load homework');
      }
    } catch (error) {
      console.error('Error loading homework:', error);
      setError('Error loading homework');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortHomework = () => {
    let filtered = [...homework];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(hw => 
        hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hw.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hw.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (filter) {
      case 'due_today':
        filtered = filtered.filter(hw => {
          const today = new Date();
          const dueDate = new Date(hw.dueDate);
          return dueDate.toDateString() === today.toDateString();
        });
        break;
      case 'due_tomorrow':
        filtered = filtered.filter(hw => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dueDate = new Date(hw.dueDate);
          return dueDate.toDateString() === tomorrow.toDateString();
        });
        break;
      case 'overdue':
        filtered = filtered.filter(hw => {
          const now = new Date();
          const dueDate = new Date(hw.dueDate);
          return dueDate < now;
        });
        break;
      case 'completed':
        filtered = filtered.filter(hw => {
          const studentProgress = hw.studentProgress?.find(p => p.studentId === user.id);
          return studentProgress?.status === 'completed';
        });
        break;
      default:
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'dueDate':
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        case 'assignedDate':
          aValue = new Date(a.assignedDate);
          bValue = new Date(b.assignedDate);
          break;
        case 'subject':
          aValue = a.subjectId?.name || '';
          bValue = b.subjectId?.name || '';
          break;
        default:
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredHomework(filtered);
  };

  const handleHomeworkProgressUpdate = async (homeworkId, progress) => {
    try {
      const response = await apiService.homework.updateProgress(homeworkId, {
        status: progress,
        studentId: user.id
      });

      if (response.success) {
        // Update local state
        setHomework(prev => prev.map(hw => {
          if (hw._id === homeworkId) {
            const updatedProgress = hw.studentProgress || [];
            const existingIndex = updatedProgress.findIndex(p => p.studentId === user.id);
            
            if (existingIndex >= 0) {
              updatedProgress[existingIndex] = { ...updatedProgress[existingIndex], status: progress };
            } else {
              updatedProgress.push({ studentId: user.id, status: progress });
            }
            
            return { ...hw, studentProgress: updatedProgress };
          }
          return hw;
        }));
      }
    } catch (error) {
      console.error('Error updating homework progress:', error);
    }
  };

  const getFilterCount = (filterType) => {
    switch (filterType) {
      case 'due_today':
        return homework.filter(hw => {
          const today = new Date();
          const dueDate = new Date(hw.dueDate);
          return dueDate.toDateString() === today.toDateString();
        }).length;
      case 'due_tomorrow':
        return homework.filter(hw => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dueDate = new Date(hw.dueDate);
          return dueDate.toDateString() === tomorrow.toDateString();
        }).length;
      case 'overdue':
        return homework.filter(hw => {
          const now = new Date();
          const dueDate = new Date(hw.dueDate);
          return dueDate < now;
        }).length;
      case 'completed':
        return homework.filter(hw => {
          const studentProgress = hw.studentProgress?.find(p => p.studentId === user.id);
          return studentProgress?.status === 'completed';
        }).length;
      default:
        return homework.length;
    }
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">My Homework</h1>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-blue-100 text-sm font-medium">Active Assignments</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center sm:justify-end">
                {/* Mobile View - Enhanced Buttons */}
                <div className="sm:hidden bg-white/10 rounded-2xl p-1 backdrop-blur-sm">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setView('list')}
                      className={`px-6 py-3 rounded-xl transition-all duration-300 text-sm font-bold flex items-center justify-center min-w-[80px] ${
                        view === 'list' 
                          ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                          : 'bg-transparent text-white hover:bg-white/20'
                      }`}
                    >
                      <EyeIcon className="w-4 h-4 mr-2" />
                      List
                    </button>
                    <button
                      onClick={() => setView('calendar')}
                      className={`px-6 py-3 rounded-xl transition-all duration-300 text-sm font-bold flex items-center justify-center min-w-[80px] ${
                        view === 'calendar' 
                          ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                          : 'bg-transparent text-white hover:bg-white/20'
                      }`}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Calendar
                    </button>
                  </div>
                </div>
                
                {/* Desktop View - Original Buttons */}
                <div className="hidden sm:flex items-center space-x-3">
                  <button
                    onClick={() => setView('list')}
                    className={`px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold ${
                      view === 'list' 
                        ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                        : 'bg-blue-500 text-white hover:bg-blue-400 shadow-md'
                    }`}
                  >
                    <EyeIcon className="w-4 h-4 inline mr-2" />
                    List View
                  </button>
                  <button
                    onClick={() => setView('calendar')}
                    className={`px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold ${
                      view === 'calendar' 
                        ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                        : 'bg-blue-500 text-white hover:bg-blue-400 shadow-md'
                    }`}
                  >
                    <CalendarIcon className="w-4 h-4 inline mr-2" />
                    Calendar View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Filters and Search */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-100 p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="w-5 h-5 text-blue-500" />
              </div>
              <input
                type="text"
                placeholder="Search homework..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm font-medium placeholder-gray-400 transition-all duration-200 shadow-sm"
              />
            </div>

            {/* Filters - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-3 bg-white rounded-xl p-3 shadow-sm border border-blue-100">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                  <FunnelIcon className="w-4 h-4 text-blue-600" />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="flex-1 px-3 py-2 bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-medium text-gray-700"
                >
                  <option value="all">All ({getFilterCount('all')})</option>
                  <option value="due_today">Due Today ({getFilterCount('due_today')})</option>
                  <option value="due_tomorrow">Due Tomorrow ({getFilterCount('due_tomorrow')})</option>
                  <option value="overdue">Overdue ({getFilterCount('overdue')})</option>
                  <option value="completed">Completed ({getFilterCount('completed')})</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 bg-white rounded-xl p-3 shadow-sm border border-blue-100">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg">
                  <span className="text-xs font-bold text-indigo-600">S</span>
                </div>
                <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-medium text-gray-700"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="assignedDate">Assigned Date</option>
                  <option value="subject">Subject</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-bold text-gray-600"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {view === 'list' ? (
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
                <p className="text-sm sm:text-base text-gray-600 px-4">
                  {searchTerm || filter !== 'all' 
                    ? 'No homework matches your current filters. Try adjusting your search or filters.'
                    : 'You have no homework assignments at the moment.'
                  }
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredHomework.map((hw) => (
                  <motion.div
                    key={hw._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <HomeworkCard
                      homework={hw}
                      onProgressUpdate={handleHomeworkProgressUpdate}
                      isStudent={true}
                      onViewDetails={() => handleViewHomeworkDetails(hw)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
            <HomeworkCalendar homework={filteredHomework} />
          </div>
        )}
      </div>

      {/* Homework Detail Modal */}
      <HomeworkDetailModal
        isOpen={showDetailModal}
        onClose={closeDetailModal}
        homework={selectedHomework}
        isTeacher={false}
        onProgressUpdate={handleHomeworkProgressUpdate}
      />
    </div>
  );
};

export default StudentHomework; 
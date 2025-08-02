import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  CalendarIcon, 
  ClockIcon, 
  BookOpenIcon, 
  UserGroupIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const HomeworkDetailModal = ({ 
  isOpen, 
  onClose, 
  homework, 
  isTeacher = false,
  onProgressUpdate,
  onEdit,
  onDelete
}) => {
  if (!homework) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'reading':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleSolid className="w-4 h-4" />;
      case 'reading':
        return <BookOpenIcon className="w-4 h-4" />;
      case 'assigned':
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getDueStatus = () => {
    const now = new Date();
    const dueDate = new Date(homework.dueDate);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'Overdue', color: 'text-red-600', bgColor: 'bg-red-50', icon: ExclamationTriangleIcon };
    } else if (diffDays === 0) {
      return { status: 'Due Today', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: ExclamationTriangleIcon };
    } else if (diffDays === 1) {
      return { status: 'Due Tomorrow', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: ClockIcon };
    } else if (diffDays <= 3) {
      return { status: `Due in ${diffDays} days`, color: 'text-blue-600', bgColor: 'bg-blue-50', icon: ClockIcon };
    } else {
      return { status: 'Assigned', color: 'text-gray-600', bgColor: 'bg-gray-50', icon: CalendarIcon };
    }
  };

  const dueStatus = getDueStatus();
  const DueIcon = dueStatus.icon;

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Invalid Time';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Time';
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Invalid Date at Invalid Time';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date at Invalid Time';
    
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  };



  const studentProgress = homework.studentProgress?.find(p => p.studentId === localStorage.getItem('userId')) || 
    { status: 'assigned' };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: homework.color || '#3B82F6' }}
                    />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{homework.title}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">{homework.subjectId?.name}</span>
                        <span className="text-sm text-gray-600">•</span>
                        <span className="text-sm text-gray-600">{homework.classId?.name}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Status and Due Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${dueStatus.bgColor}`}>
                    <div className="flex items-center space-x-2">
                      <DueIcon className={`w-5 h-5 ${dueStatus.color}`} />
                      <span className={`font-medium ${dueStatus.color}`}>{dueStatus.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDateTime(homework.dueDate)}
                    </p>
                  </div>

                  {/* Student Progress Status - Removed as requested */}
                </div>

                {/* Description */}
                {homework.description && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                    <p className="text-gray-700 leading-relaxed">{homework.description}</p>
                  </div>
                )}

                {/* Instructions */}
                {homework.instructions && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                      Instructions
                    </h4>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{homework.instructions}</p>
                    </div>
                  </div>
                )}

                {/* Resources */}
                {homework.resources && homework.resources.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <LinkIcon className="w-5 h-5 mr-2 text-green-600" />
                      Resources
                    </h4>
                    <div className="space-y-2">
                      {homework.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <LinkIcon className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-600 hover:text-blue-800 text-sm">
                            {resource}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assignment Details */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Assignment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Assigned by</p>
                        <p className="font-medium text-gray-900">
                          {homework.teacherId?.name || 
                           (homework.teacherId?.firstName && homework.teacherId?.lastName ? 
                             `${homework.teacherId.firstName} ${homework.teacherId.lastName}` : 
                             homework.teacherId?.firstName || 
                             homework.teacherId?.lastName || 
                             'Teacher'
                           )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Assigned on</p>
                        <p className="font-medium text-gray-900">{formatDate(homework.assignedDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BookOpenIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Subject</p>
                        <p className="font-medium text-gray-900">{homework.subjectId?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <UserGroupIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Class</p>
                                                        <p className="font-medium text-gray-900">
                                  {homework.classId?.name}
                                  {homework.classId?.grade && homework.classId?.division && 
                                    ` - Grade ${homework.classId.grade} ${homework.classId.division}`
                                  }
                                </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student Progress Actions - Removed as requested */}

                {/* Teacher Actions */}
                {isTeacher && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => onEdit(homework)}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      <BookOpenIcon className="w-4 h-4 mr-2" />
                      Edit Homework
                    </button>
                    <button
                      onClick={() => onDelete(homework._id)}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                    >
                      <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                      Delete Homework
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HomeworkDetailModal; 
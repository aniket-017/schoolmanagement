import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  ClockIcon, 
  BookOpenIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import apiService from '../services/apiService';

const HomeworkCard = ({ 
  homework, 
  isTeacher = false, 
  onEdit, 
  onDelete, 
  onProgressUpdate,
  onViewDetails
}) => {
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [studentProgress, setStudentProgress] = useState(
    homework.studentProgress?.find(p => p.studentId === localStorage.getItem('userId')) || 
    { status: 'assigned' }
  );

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
      return { status: 'overdue', color: 'text-red-600', icon: ExclamationTriangleIcon };
    } else if (diffDays === 0) {
      return { status: 'due_today', color: 'text-orange-600', icon: ExclamationTriangleIcon };
    } else if (diffDays === 1) {
      return { status: 'due_tomorrow', color: 'text-yellow-600', icon: ClockIcon };
    } else if (diffDays <= 3) {
      return { status: 'due_soon', color: 'text-blue-600', icon: ClockIcon };
    } else {
      return { status: 'assigned', color: 'text-gray-600', icon: CalendarIcon };
    }
  };

  const dueStatus = getDueStatus();
  const DueIcon = dueStatus.icon;

  const handleProgressUpdate = async (newStatus) => {
    if (!isTeacher) {
      setUpdatingProgress(true);
      try {
        const response = await apiService.homework.updateProgress(homework._id, {
          status: newStatus,
          notes: ''
        });
        
        if (response.success) {
          setStudentProgress({ status: newStatus });
          if (onProgressUpdate) {
            onProgressUpdate(homework._id, newStatus);
          }
        }
      } catch (error) {
        console.error('Error updating progress:', error);
      } finally {
        setUpdatingProgress(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onViewDetails}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: homework.color || '#3B82F6' }}
              />
              <h3 className="font-semibold text-gray-900 text-lg">{homework.title}</h3>
              {!isTeacher && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(studentProgress.status)}`}>
                  {getStatusIcon(studentProgress.status)}
                  <span className="capitalize">{studentProgress.status}</span>
                </span>
              )}
            </div>
            
            {isTeacher && (
              <div className="flex items-center space-x-2 mb-3">
                <button
                  onClick={() => onEdit(homework)}
                  className="flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all duration-200 hover:scale-105 text-sm font-medium"
                  title="Edit Homework"
                >
                  <PencilIcon className="w-3 h-3 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(homework._id)}
                  className="flex items-center px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-200 hover:scale-105 text-sm font-medium"
                  title="Delete Homework"
                >
                  <TrashIcon className="w-3 h-3 mr-1" />
                  Delete
                </button>
              </div>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center space-x-1">
                <BookOpenIcon className="w-4 h-4" />
                <span>{homework.subjectId?.name || 'Subject'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <UserGroupIcon className="w-4 h-4" />
                <span>{homework.classId?.name || 'Class'}</span>
              </div>
            </div>

            {/* Description, Instructions, and Resources are only shown in detail modal */}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm">
                <div className={`flex items-center space-x-1 ${dueStatus.color}`}>
                  <DueIcon className="w-4 h-4" />
                  <span>
                    {dueStatus.status === 'overdue' && 'Overdue'}
                    {dueStatus.status === 'due_today' && 'Due today'}
                    {dueStatus.status === 'due_tomorrow' && 'Due tomorrow'}
                    {dueStatus.status === 'due_soon' && `Due in ${Math.ceil((new Date(homework.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days`}
                    {dueStatus.status === 'assigned' && `Due ${formatDate(homework.dueDate)}`}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1 text-gray-500">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(homework.dueDate)} at {formatTime(homework.dueDate)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {!isTeacher && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleProgressUpdate('reading')}
                      disabled={updatingProgress || studentProgress.status === 'reading'}
                      className={`p-1 rounded ${
                        studentProgress.status === 'reading' 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'text-gray-400 hover:text-yellow-600'
                      }`}
                    >
                      <BookOpenIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleProgressUpdate('completed')}
                      disabled={updatingProgress || studentProgress.status === 'completed'}
                      className={`p-1 rounded ${
                        studentProgress.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'text-gray-400 hover:text-green-600'
                      }`}
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Expand button removed - details shown in modal */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details are now shown in the detail modal when clicking the card */}
    </motion.div>
  );
};

export default HomeworkCard; 
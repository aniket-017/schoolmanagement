import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CalendarIcon, BookOpenIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import apiService from '../services/apiService';

const HomeworkModal = ({ isOpen, onClose, homework = null, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    classId: '',
    dueDate: '',
    instructions: '',
    resources: '',
    color: '#3B82F6'
  });

  const subjectColors = [
    { name: 'Mathematics', color: '#3B82F6' },
    { name: 'English', color: '#10B981' },
    { name: 'Science', color: '#F59E0B' },
    { name: 'History', color: '#EF4444' },
    { name: 'Geography', color: '#8B5CF6' },
    { name: 'Literature', color: '#EC4899' },
    { name: 'Physics', color: '#06B6D4' },
    { name: 'Chemistry', color: '#84CC16' },
    { name: 'Biology', color: '#22C55E' },
    { name: 'Computer Science', color: '#6366F1' },
  ];

  useEffect(() => {
    if (isOpen) {
      loadSubjectsAndClasses();
      if (homework) {
        setFormData({
          title: homework.title || '',
          description: homework.description || '',
          subjectId: homework.subjectId?._id || homework.subjectId || '',
          classId: homework.classId?._id || homework.classId || '',
          dueDate: homework.dueDate ? new Date(homework.dueDate).toISOString().split('T')[0] : '',
          instructions: homework.instructions || '',
          resources: homework.resources?.join('\n') || '',
          color: homework.color || '#3B82F6'
        });
      } else {
        setFormData({
          title: '',
          description: '',
          subjectId: '',
          classId: '',
          dueDate: '',
          instructions: '',
          resources: '',
          color: '#3B82F6'
        });
      }
    }
  }, [isOpen, homework]);

  const loadSubjectsAndClasses = async () => {
    try {
      // Try to get teacher's assigned subjects and classes first
      let subjectsResponse, classesResponse;
      
      try {
        [subjectsResponse, classesResponse] = await Promise.all([
          apiService.subjects.getTeacherAssignedSubjects(),
          apiService.classes.getTeacherAssignedClasses()
        ]);
      } catch (error) {
        // Fallback to getting all subjects and classes if teacher-specific endpoints don't exist
        console.log('Teacher-specific endpoints not available, falling back to all data');
        [subjectsResponse, classesResponse] = await Promise.all([
          apiService.subjects.getAll(),
          apiService.classes.getAll()
        ]);
      }

      if (subjectsResponse?.success) {
        setSubjects(subjectsResponse.data || []);
      } else {
        console.log('No subjects found');
        setSubjects([]);
      }

      if (classesResponse?.success) {
        setClasses(classesResponse.data || []);
      } else {
        console.log('No classes found');
        setClasses([]);
      }
    } catch (error) {
      console.error('Error loading subjects and classes:', error);
      setSubjects([]);
      setClasses([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const homeworkData = {
        ...formData,
        resources: formData.resources.split('\n').filter(r => r.trim()),
        dueDate: new Date(formData.dueDate).toISOString()
      };

      let response;
      if (homework) {
        response = await apiService.homework.update(homework._id, homeworkData);
      } else {
        response = await apiService.homework.create(homeworkData);
      }

      if (response.success) {
        onSuccess(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error saving homework:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (subjectId) => {
    const subject = subjects.find(s => s._id === subjectId);
    const colorMatch = subjectColors.find(sc => 
      sc.name.toLowerCase().includes(subject?.name?.toLowerCase() || '')
    );
    
    setFormData(prev => ({
      ...prev,
      subjectId,
      color: colorMatch?.color || '#3B82F6'
    }));
  };

  const getSubjectColor = (subjectName) => {
    const colorMatch = subjectColors.find(sc => 
      sc.name.toLowerCase().includes(subjectName?.toLowerCase() || '')
    );
    return colorMatch?.color || '#3B82F6';
  };

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
              className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpenIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {homework ? 'Edit Homework' : 'Create New Homework'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {homework ? 'Update homework details' : 'Assign homework to your class'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Homework Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter homework title"
                    />
                  </div>

                                   {/* Subject */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Subject *
                   </label>
                   <select
                     required
                     value={formData.subjectId}
                     onChange={(e) => handleSubjectChange(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   >
                     <option value="">Select Subject</option>
                     {subjects.length === 0 ? (
                       <option value="" disabled>No subjects assigned to you</option>
                     ) : (
                       subjects.map((subject) => (
                         <option key={subject._id} value={subject._id}>
                           {subject.name}
                         </option>
                       ))
                     )}
                   </select>
                   {subjects.length === 0 && (
                     <p className="text-sm text-red-600 mt-1">
                       Please contact admin to assign subjects to your account
                     </p>
                   )}
                 </div>

                                   {/* Class */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Class *
                   </label>
                   <select
                     required
                     value={formData.classId}
                     onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   >
                     <option value="">Select Class</option>
                     {classes.length === 0 ? (
                       <option value="" disabled>No classes assigned to you</option>
                     ) : (
                       classes.map((cls) => (
                         <option key={cls._id} value={cls._id}>
                           {cls.name} - {cls.grade}{cls.section}
                         </option>
                       ))
                     )}
                   </select>
                   {classes.length === 0 && (
                     <p className="text-sm text-red-600 mt-1">
                       Please contact admin to assign classes to your account
                     </p>
                   )}
                 </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={formData.dueDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <CalendarIcon className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex space-x-2">
                      {subjectColors.slice(0, 8).map((color) => (
                        <button
                          key={color.color}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color: color.color }))}
                          className={`w-8 h-8 rounded-full border-2 ${
                            formData.color === color.color ? 'border-gray-800' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color.color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter homework description"
                  />
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter detailed instructions for students"
                  />
                </div>

                {/* Resources */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resources (one per line)
                  </label>
                  <textarea
                    value={formData.resources}
                    onChange={(e) => setFormData(prev => ({ ...prev, resources: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter resource links or references (one per line)"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                                     <button
                     type="submit"
                     disabled={loading || subjects.length === 0 || classes.length === 0}
                     className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   >
                     {loading ? 'Saving...' : (homework ? 'Update Homework' : 'Create Homework')}
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HomeworkModal; 
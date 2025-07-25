import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  UsersIcon,
  BookOpenIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import { useTeacherAuth } from '../context/TeacherAuthContext';
import apiService from '../services/apiService';

const TeacherClassDetails = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useTeacherAuth();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');

  useEffect(() => {
    loadClassDetails();
  }, [classId]);

  useEffect(() => {
    console.log('Students state updated:', students);
    console.log('Students length:', students.length);
  }, [students]);

  const loadClassDetails = async () => {
    try {
      setLoading(true);
      console.log('Loading class details for:', classId);
      console.log('apiService.classes:', apiService.classes);
      
      let classResponse, studentsResponse;
      
      // Load class details
      if (!apiService.classes) {
        console.error('apiService.classes is undefined!');
        // Fallback: try direct fetch
        const fetchResponse = await fetch(`${apiService.baseURL}/classes/${classId}`, {
          headers: apiService.getAuthHeaders(),
        });
        classResponse = await apiService.handleResponse(fetchResponse);
      } else {
        classResponse = await apiService.classes.getClassById(classId);
      }
      console.log('Class Response:', classResponse);
      
      if (classResponse.success) {
        setClassData(classResponse.data);
      }

      // Load students
      if (!apiService.classes) {
        // Fallback: try direct fetch
        const fetchResponse = await fetch(`${apiService.baseURL}/classes/${classId}/students`, {
          headers: apiService.getAuthHeaders(),
        });
        studentsResponse = await apiService.handleResponse(fetchResponse);
      } else {
        studentsResponse = await apiService.classes.getClassStudents(classId);
      }
      console.log('Students Response:', studentsResponse);
      console.log('Students data:', studentsResponse.data);
      console.log('Students array length:', studentsResponse.data?.length);
      
      if (studentsResponse.success) {
        setStudents(studentsResponse.data || []);
        console.log('Set students state to:', studentsResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading class details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  const formatStudentName = (student) => {
    if (student.firstName && student.lastName) {
      return `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`.trim();
    }
    return student.name || student.email || 'Unknown Student';
  };

  const handleBack = () => {
    navigate('/teacher/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Class Not Found</h3>
          <p className="text-gray-600 mb-4">The class you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/teacher/classes')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="text-blue-100 hover:text-white transition-colors sm:hidden"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/teacher/classes')}
                className="text-blue-100 hover:text-white transition-colors hidden sm:block"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-1">
                {classData.grade}{getOrdinalSuffix(classData.grade)} Class - {classData.division}
              </h1>
              <p className="text-blue-100 text-sm">Class Details & Management</p>
            </div>
            <div className="w-5"></div> {/* Smaller spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Class Overview Card - Mobile Style */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>
            </div>
          </div>

          {/* Students Section */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Class Students</h3>
                <span className="text-sm text-gray-500">{students.length} students</span>
              </div>
            </div>

            <div className="p-4">
              {students.length > 0 ? (
                <div className="space-y-3">
                  {students.map((student, index) => (
                    <motion.div
                      key={student._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{student.rollNumber || 'N/A'}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{formatStudentName(student)}</h4>
                            <p className="text-xs text-gray-500">Roll No: {student.rollNumber || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Students</h3>
                  <p className="text-gray-600 text-sm">No students are currently enrolled in this class.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherClassDetails; 
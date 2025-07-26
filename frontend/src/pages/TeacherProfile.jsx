import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  AcademicCapIcon,
  CalendarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useTeacherAuth } from '../context/TeacherAuthContext';
import apiService from '../services/apiService';

const TeacherProfile = () => {
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const [profile, setProfile] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const { user, logout } = useTeacherAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadTeacherProfile();
  }, []);

  const loadTeacherProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.teachers.getTeacherProfile();
      
      if (response.success) {
        setProfile(response.user);
      } else {
        console.error('Failed to load profile:', response.message);
        // Set a default profile to prevent errors
        setProfile({});
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Set a default profile to prevent errors
      setProfile({});
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long!');
      return;
    }

    try {
      const response = await apiService.teachers.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      if (response.success) {
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        alert('Password changed successfully!');
      } else {
        alert(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password. Please try again.');
    }
  };

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

  const handleBack = () => {
    navigate('/teacher/dashboard');
  };

  // Helper function to format address
  const formatAddress = (address) => {
    if (!address) return 'Not provided';
    
    if (typeof address === 'string') {
      return address;
    }
    
    if (typeof address === 'object') {
      const parts = [];
      if (address.street) parts.push(address.street);
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      if (address.zipCode) parts.push(address.zipCode);
      if (address.country) parts.push(address.country);
      
      return parts.length > 0 ? parts.join(', ') : 'Not provided';
    }
    
    return 'Not provided';
  };

  // Helper function to safely display any field value
  const safeDisplay = (value, fallback = 'Not provided') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string' || typeof value === 'number') return value;
    if (typeof value === 'object') {
      // If it's an object, try to convert it to a string representation
      try {
        return JSON.stringify(value);
      } catch {
        return fallback;
      }
    }
    return String(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Mobile Back Button */}
          {mobileView && (
            <div className="flex items-center mb-2">
              <button
                onClick={handleBack}
                className="flex items-center text-white hover:text-blue-100 transition-colors p-2"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold mb-1">My Profile</h1>
            <p className="text-blue-100 text-sm">View your account information</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      {!profile ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile ? (profile.name || profile.fullName || [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(" ") || 'Teacher Name') : 'Loading...'}
                  </h2>
                  <p className="text-gray-600">{safeDisplay(profile?.designation, 'Teacher')}</p>
                  <p className="text-sm text-gray-500">Employee ID: {safeDisplay(profile?.employeeId, 'N/A')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900">{safeDisplay(profile?.name)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{safeDisplay(profile?.email)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <p className="text-gray-900">{safeDisplay(profile?.phone)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <p className="text-gray-900">
                    {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-gray-900">{formatAddress(profile?.address)}</p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <p className="text-gray-900">{safeDisplay(profile?.employeeId, 'Not assigned')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <p className="text-gray-900">{safeDisplay(profile?.designation, 'Teacher')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <p className="text-gray-900">{safeDisplay(profile?.department, 'Not assigned')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                  <p className="text-gray-900">
                    {profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <p className="text-gray-900">{safeDisplay(profile?.qualification)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                  <p className="text-gray-900">{safeDisplay(profile?.experience)} years</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <KeyIcon className="w-4 h-4" />
                <span>Change Password</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      )}

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

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Change Password
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeacherProfile; 
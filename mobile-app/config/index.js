// Export environment configuration
export { default } from "./environment.js";
export { default as config } from "./environment.js";

// Development environment
const DEV_API_URL = 'http://10.0.2.2:5000/api'; // Android Emulator
// const DEV_API_URL = 'http://localhost:5000/api'; // iOS Simulator

// Production environment
const PROD_API_URL = 'https://your-production-api.com/api';

// Set the API URL based on environment
export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// Other configuration variables
export const APP_VERSION = '1.0.0';
export const BUILD_NUMBER = '1';

// API endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
  },
  // Add other endpoints as needed
};

// App settings
export const APP_SETTINGS = {
  TIMEOUT: 30000, // API request timeout in milliseconds
  CACHE_TTL: 3600, // Cache time to live in seconds
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  SUPPORTED_LANGUAGES: ['en', 'es', 'fr'],
  DEFAULT_LANGUAGE: 'en',
};

// Feature flags
export const FEATURES = {
  ENABLE_BIOMETRIC: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_ANALYTICS: __DEV__ ? false : true,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful.',
  REGISTER_SUCCESS: 'Registration successful.',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully.',
  PASSWORD_CHANGE_SUCCESS: 'Password changed successfully.',
};

// Validation rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s-]{10,}$/,
};

// Theme configuration
export const THEME = {
  DARK_MODE: false,
  PRIMARY_COLOR: '#007AFF',
  SECONDARY_COLOR: '#5856D6',
  SUCCESS_COLOR: '#34C759',
  WARNING_COLOR: '#FF9500',
  ERROR_COLOR: '#FF3B30',
  BACKGROUND_COLOR: '#FFFFFF',
  TEXT_COLOR: '#000000',
};

// Analytics events
export const ANALYTICS_EVENTS = {
  USER_LOGIN: 'user_login',
  USER_REGISTER: 'user_register',
  PROFILE_UPDATE: 'profile_update',
  PASSWORD_CHANGE: 'password_change',
  ERROR_OCCURRED: 'error_occurred',
};

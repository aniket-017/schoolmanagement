import { appConfig } from "../config/environment";

const API_BASE_URL = appConfig.API_BASE_URL;

// Simple cache implementation
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }
    return data;
  }

  // Cache helper methods
  getCacheKey(url, params = {}) {
    return `${url}?${JSON.stringify(params)}`;
  }

  getFromCache(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    cache.clear();
  }

  // Authentication APIs
  auth = {
    login: async (email, password) => {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email, password }),
      });
      return this.handleResponse(response);
    },

    getProfile: async () => {
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    changePassword: async (currentPassword, newPassword) => {
      const response = await fetch(`${this.baseURL}/auth/change-password`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return this.handleResponse(response);
    },
  };

  // Student Authentication APIs
  studentAuth = {
    login: async (identifier, password) => {
      const response = await fetch(`${this.baseURL}/student-auth/login`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ mobileNumber: identifier, password }),
      });
      return this.handleResponse(response);
    },

    getProfile: async () => {
      const response = await fetch(`${this.baseURL}/student-auth/profile`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },
  };

  // Announcements APIs
  announcements = {
    getTeacherAnnouncements: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const cacheKey = this.getCacheKey(`/announcements/teachers`, params);
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await fetch(`${this.baseURL}/announcements/teachers?${queryString}`, {
        headers: this.getAuthHeaders(),
      });
      const data = await this.handleResponse(response);
      this.setCache(cacheKey, data);
      return data;
    },

    getAnnouncementsForStudent: async (studentId, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const cacheKey = this.getCacheKey(`/announcements/student/${studentId}`, params);
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await fetch(`${this.baseURL}/announcements/student/${studentId}?${queryString}`, {
        headers: this.getAuthHeaders(),
      });
      const data = await this.handleResponse(response);
      this.setCache(cacheKey, data);
      return data;
    },

    create: async (announcementData) => {
      const response = await fetch(`${this.baseURL}/announcements`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(announcementData),
      });
      const data = await this.handleResponse(response);
      // Clear cache when new announcement is created
      this.clearCache();
      return data;
    },
  };

  // Timetable APIs
  timetable = {
    getTeacherTimetable: async (teacherId) => {
      const cacheKey = this.getCacheKey(`/timetables/teacher/${teacherId}`);
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await fetch(`${this.baseURL}/timetables/teacher/${teacherId}`, {
        headers: this.getAuthHeaders(),
      });
      const data = await this.handleResponse(response);
      this.setCache(cacheKey, data);
      return data;
    },

    getClassTimetable: async (classId) => {
      const cacheKey = this.getCacheKey(`/timetables/class/${classId}`);
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await fetch(`${this.baseURL}/timetables/class/${classId}`, {
        headers: this.getAuthHeaders(),
      });
      const data = await this.handleResponse(response);
      this.setCache(cacheKey, data);
      return data;
    },
  };

  // Teachers APIs
  teachers = {
    getTeacherById: async (teacherId) => {
      const response = await fetch(`${this.baseURL}/teachers/${teacherId}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    getTeacherProfile: async () => {
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    updateTeacherProfile: async (profileData) => {
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
      return this.handleResponse(response);
    },

    changePassword: async (passwordData) => {
      const response = await fetch(`${this.baseURL}/auth/change-password`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(passwordData),
      });
      return this.handleResponse(response);
    },

    getWorkload: async (teacherId) => {
      const response = await fetch(`${this.baseURL}/teachers/${teacherId}/workload`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },
  };

  // Subjects APIs
  subjects = {
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.baseURL}/subjects?${queryString}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    getById: async (id) => {
      const response = await fetch(`${this.baseURL}/subjects/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    getTeacherAssignedSubjects: async () => {
      const response = await fetch(`${this.baseURL}/subjects/teacher/assigned`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    getTeacherTimetableSubjects: async () => {
      const response = await fetch(`${this.baseURL}/subjects/teacher/timetable`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },
  };

  // Classes APIs
  classes = {
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.baseURL}/classes?${queryString}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    getById: async (id) => {
      const response = await fetch(`${this.baseURL}/classes/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    getTeacherAssignedClasses: async () => {
      const response = await fetch(`${this.baseURL}/classes/teacher/assigned`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    getTeacherTimetableClasses: async () => {
      const response = await fetch(`${this.baseURL}/classes/teacher/timetable`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    getClassStudents: async (classId) => {
      const response = await fetch(`${this.baseURL}/classes/${classId}/students`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },
  };

  // Attendance APIs
  attendance = {
    getStudentAttendance: async (studentId, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.baseURL}/attendance/student/${studentId}?${queryString}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    markAttendance: async (attendanceData) => {
      const response = await fetch(`${this.baseURL}/attendances/mark`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(attendanceData),
      });
      return this.handleResponse(response);
    },

    bulkMarkAttendance: async (attendanceData) => {
      const response = await fetch(`${this.baseURL}/attendances/bulk-mark`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(attendanceData),
      });
      return this.handleResponse(response);
    },

    getTeacherClasses: async () => {
      const response = await fetch(`${this.baseURL}/attendances/teacher-classes`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    getClassStudents: async (classId) => {
      const response = await fetch(`${this.baseURL}/attendances/class-students/${classId}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    getClassAttendanceByDate: async (classId, date) => {
      const response = await fetch(`${this.baseURL}/attendances/class-attendance/${classId}/${date}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    bulkMarkClassAttendance: async (classId, date, attendanceData) => {
      const response = await fetch(`${this.baseURL}/attendances/bulk-mark`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          classId,
          date,
          attendanceData,
        }),
      });
      return this.handleResponse(response);
    },

    getClassAttendance: async (classId, date) => {
      const response = await fetch(`${this.baseURL}/attendances/class/${classId}/${date}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    getAttendanceStats: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.baseURL}/attendances/stats?${queryString}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },
  };

  // Annual Calendar APIs
  annualCalendar = {
    getTeacherCalendar: async () => {
      const response = await fetch(`${this.baseURL}/annual-calendar/teacher`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },
    
    getStudentCalendar: async () => {
      const response = await fetch(`${this.baseURL}/annual-calendar`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },
  };

  // Homework APIs
  homework = {
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.baseURL}/homework?${queryString}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    getById: async (id) => {
      const response = await fetch(`${this.baseURL}/homework/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    create: async (data) => {
      const response = await fetch(`${this.baseURL}/homework`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    },

    update: async (id, data) => {
      const response = await fetch(`${this.baseURL}/homework/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    },

    delete: async (id) => {
      const response = await fetch(`${this.baseURL}/homework/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    getCalendar: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.baseURL}/homework/calendar?${queryString}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    getStats: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.baseURL}/homework/stats?${queryString}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    updateProgress: async (id, data) => {
      const response = await fetch(`${this.baseURL}/homework/${id}/progress`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    },
  };
}

export default new ApiService();

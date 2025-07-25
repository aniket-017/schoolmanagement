import { appConfig } from "../config/environment";

const API_BASE_URL = appConfig.API_BASE_URL;

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
        body: JSON.stringify({ email: identifier, password }),
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
      const response = await fetch(`${this.baseURL}/announcements/teachers?${queryString}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    getAnnouncementsForStudent: async (studentId, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.baseURL}/announcements/student/${studentId}?${queryString}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    create: async (announcementData) => {
      const response = await fetch(`${this.baseURL}/announcements`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(announcementData),
      });
      return this.handleResponse(response);
    },
  };

  // Timetable APIs
  timetable = {
    getTeacherTimetable: async (teacherId) => {
      const response = await fetch(`${this.baseURL}/timetables/teacher/${teacherId}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    getClassTimetable: async (classId) => {
      const response = await fetch(`${this.baseURL}/timetables/class/${classId}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
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

    getWorkload: async (teacherId) => {
      const response = await fetch(`${this.baseURL}/teachers/${teacherId}/workload`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },
  };

  // Attendance APIs
  attendance = {
    getStudentAttendance: async (studentId, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.baseURL}/attendances/student/${studentId}?${queryString}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    },

    markAttendance: async (attendanceData) => {
      const response = await fetch(`${this.baseURL}/attendances`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(attendanceData),
      });
      return this.handleResponse(response);
    },
  };
}

export default new ApiService();

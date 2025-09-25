import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";

const API_BASE_URL = config.API_BASE_URL;

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
const handleError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    return error.message;
  } else {
    return "An unexpected error occurred";
  }
};

export const apiService = {
  handleError,
  // Auth Service
  auth: {
    login: async (email, password) => {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.token) {
        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    },
    studentLogin: async (email, password) => {
      const response = await api.post("/student-auth/login", { mobileNumber: email, password });
      if (response.data.token) {
        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    },
    register: async (userData) => {
      const response = await api.post("/auth/register", userData);
      return response.data;
    },
    logout: async () => {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      return api.post("/auth/logout");
    },
    changePassword: async (currentPassword, newPassword, userType = "teacher") => {
      const endpoint = userType === "student" ? "/student-auth/change-password" : "/auth/change-password";
      const response = await api.put(endpoint, {
        currentPassword,
        newPassword,
      });
      return response.data;
    },
  },

  // User Services (works for all user types)
  user: {
    getProfile: async () => {
      const user = JSON.parse(await AsyncStorage.getItem("user") || "{}");
      const endpoint = user.role === "student" ? "/student-auth/profile" : "/auth/profile";
      const response = await api.get(endpoint);
      return response.data;
    },
    updateProfile: async (data) => {
      const user = JSON.parse(await AsyncStorage.getItem("user") || "{}");
      const endpoint = user.role === "student" ? "/student-auth/profile" : "/auth/profile";
      const response = await api.put(endpoint, data);
      return response.data;
    },
  },

  // Student Services
  student: {
    getDashboard: async () => {
      const response = await api.get("/users/dashboard");
      return response.data;
    },
    getProfile: async () => {
      const response = await api.get("/student-auth/profile");
      return response.data;
    },
    updateProfile: async (data) => {
      const response = await api.put("/student-auth/profile", data);
      return response.data;
    },
  },

  // Attendance Services
  attendance: {
    getStudentAttendance: async (studentId, params = {}) => {
      const response = await api.get(`/attendance/student/${studentId}`, { params });
      return response.data;
    },
    getClassAttendance: async (classId, date) => {
      const response = await api.get(`/attendance/class/${classId}/${date}`);
      return response.data;
    },
    markAttendance: async (attendanceData) => {
      const response = await api.post("/attendance", attendanceData);
      return response.data;
    },
    // Mobile attendance management
    getTeacherClasses: async () => {
      const response = await api.get("/attendance/teacher/classes");
      return response.data;
    },
    getClassStudents: async (classId) => {
      const response = await api.get(`/attendance/class/${classId}/students`);
      return response.data;
    },
    getClassAttendanceByDate: async (classId, date) => {
      const response = await api.get(`/attendance/class-attendance/${classId}/${date}`);
      return response.data;
    },
    bulkMarkClassAttendance: async (classId, date, attendanceData) => {
      const response = await api.post("/attendance/bulk", {
        classId,
        date,
        attendanceData,
      });
      return response.data;
    },
    getClassAttendanceSummary: async (classId, queryParams) => {
      try {
        const response = await api.get(`/attendance/class-summary/${classId}?${queryParams}`);
        return response.data;
      } catch (error) {
        // Check if this is a 500 error but with valid data
        if (error.response?.status === 500 && error.response?.data?.success) {
          return error.response.data;
        }
        throw error;
      }
    },
  },

  // Assignment Services
  assignments: {
    getAssignments: async (params = {}) => {
      const response = await api.get("/assignments-detailed", { params });
      return response.data;
    },
    getAssignmentById: async (id) => {
      const response = await api.get(`/assignments-detailed/${id}`);
      return response.data;
    },
    submitAssignment: async (assignmentId, submissionData) => {
      const response = await api.post(`/assignments-detailed/${assignmentId}/submit`, submissionData);
      return response.data;
    },
    getSubmissions: async (assignmentId) => {
      const response = await api.get(`/assignments-detailed/${assignmentId}/submissions`);
      return response.data;
    },
  },

  // Grade Services
  grades: {
    getStudentGrades: async (studentId, params = {}) => {
      const response = await api.get(`/grades/student/${studentId}`, { params });
      return response.data;
    },
    getClassGrades: async (examinationId) => {
      const response = await api.get(`/grades/examination/${examinationId}`);
      return response.data;
    },
  },

  // Timetable Services
  timetable: {
    getClassTimetable: async (classId) => {
      const response = await api.get(`/timetables/class/${classId}`);
      return response.data;
    },
    getTeacherTimetable: async (teacherId) => {
      try {
        const response = await api.get(`/timetables/teacher/${teacherId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  },

  // Examination Services
  examinations: {
    getExaminations: async (params = {}) => {
      const response = await api.get("/examinations", { params });
      return response.data;
    },
    getExaminationsByClass: async (classId, params = {}) => {
      const response = await api.get(`/examinations/class/${classId}`, { params });
      return response.data;
    },
    getExaminationResults: async (examinationId) => {
      const response = await api.get(`/examinations/${examinationId}/results`);
      return response.data;
    },
    getGrouped: async (params = {}) => {
      const response = await api.get("/examinations/grouped", { params });
      return response.data;
    },
    debugAll: async () => {
      const response = await api.get("/examinations/debug/all");
      return response.data;
    },
    // Teacher-specific exam services
    createExamination: async (examData) => {
      const response = await api.post("/examinations", examData);
      return response.data;
    },
    updateExamination: async (examId, examData) => {
      const response = await api.put(`/examinations/${examId}`, examData);
      return response.data;
    },
    deleteExamination: async (examId) => {
      const response = await api.delete(`/examinations/${examId}`);
      return response.data;
    },
    updateExaminationStatus: async (examId, status) => {
      const response = await api.put(`/examinations/${examId}/status`, { status });
      return response.data;
    },
    getTeacherExaminations: async (params = {}) => {
      // Get exams for all classes assigned to the teacher
      const response = await api.get("/examinations", { params });
      return response.data;
    },
    getExaminationsBySubject: async (subjectId, params = {}) => {
      const response = await api.get(`/examinations/subject/${subjectId}`, { params });
      return response.data;
    },
    getExaminationStats: async () => {
      const response = await api.get("/examinations/stats/overview");
      return response.data;
    },
  },

  // Fee Services
  fees: {
    getStudentFees: async (studentId, params = {}) => {
      const response = await api.get(`/fees-detailed/student/${studentId}`, { params });
      return response.data;
    },
    makePayment: async (feeId, paymentData) => {
      const response = await api.post(`/fees-detailed/${feeId}/pay`, paymentData);
      return response.data;
    },
    getPaymentHistory: async (studentId) => {
      const response = await api.get(`/fees-detailed/student/${studentId}/payments`);
      return response.data;
    },
  },

  // Communication Services
  communication: {
    getMessages: async (params = {}) => {
      const response = await api.get("/communications", { params });
      return response.data;
    },
    sendMessage: async (messageData) => {
      const response = await api.post("/communications", messageData);
      return response.data;
    },
    getConversation: async (participantId) => {
      const response = await api.get(`/communications/conversation/${participantId}`);
      return response.data;
    },
    markAsRead: async (messageId) => {
      const response = await api.put(`/communications/${messageId}/read`);
      return response.data;
    },
  },

  // Messages Services (for fee reminders and other messages)
  messages: {
    getUserMessages: async (params = {}) => {
      const response = await api.get("/messages", { params });
      return response.data;
    },
    markAsRead: async (messageId) => {
      const response = await api.put(`/messages/${messageId}/read`);
      return response.data;
    },
    getUnreadCount: async () => {
      const response = await api.get("/messages/unread-count");
      return response.data;
    },
  },

  // Announcement Services
  announcements: {
    getAnnouncements: async (params = {}) => {
      const response = await api.get("/announcements", { params });
      return response.data;
    },
    getAnnouncementsForUser: async (userId, params = {}) => {
      const response = await api.get(`/announcements/user/${userId}`, { params });
      return response.data;
    },
    getAnnouncementsForStudent: async (studentId, params = {}) => {
      const response = await api.get(`/announcements/student/${studentId}`, { params });
      return response.data;
    },
    getTeacherAnnouncements: async (params = {}) => {
      const response = await api.get("/announcements/teachers", { params });
      return response.data;
    },
    createAnnouncement: async (data) => {
      const response = await api.post("/announcements", data);
      return response.data;
    },
    markAsRead: async (announcementId, userId) => {
      const response = await api.put(`/announcements/${announcementId}/read`, { user_id: userId });
      return response.data;
    },
  },

  // Subject Services
  subjects: {
    getSubjects: async (params = {}) => {
      const response = await api.get("/subjects", { params });
      return response.data;
    },
    getSubjectById: async (id) => {
      const response = await api.get(`/subjects/${id}`);
      return response.data;
    },
  },

  // Classes Services
  classes: {
    getAllClasses: async (params = {}) => {
      const response = await api.get("/classes", { params });
      return response.data;
    },
    getClassById: async (id) => {
      const response = await api.get(`/classes/${id}`);
      return response.data;
    },
    getTeacherAssignedClasses: async () => {
      const response = await api.get("/classes/teacher/assigned");
      return response.data;
    },
    getClassStudents: async (classId) => {
      const response = await api.get(`/classes/${classId}/students`);
      return response.data;
    },
    getStudentCalendar: async (studentId, params = {}) => {
      const response = await api.get(`/students/${studentId}/calendar`, { params });
      return response.data;
    },
    getClassStudentCalendar: async (classId, params = {}) => {
      const response = await api.get(`/classes/${classId}/student-calendar`, { params });
      return response.data;
    },
  },

  // Library Services
  library: {
    getBooks: async (params = {}) => {
      const response = await api.get("/libraries", { params });
      return response.data;
    },
    getUserBorrowedBooks: async (userId) => {
      const response = await api.get(`/libraries/user/${userId}/borrowed`);
      return response.data;
    },
    getTransactions: async (params = {}) => {
      const response = await api.get("/libraries/transactions", { params });
      return response.data;
    },
  },

  // Transport Services
  transport: {
    getTransports: async (params = {}) => {
      const response = await api.get("/transports", { params });
      return response.data;
    },
    getStudentTransport: async (params = {}) => {
      const response = await api.get("/transports/assignments", { params });
      return response.data;
    },
  },

  // Syllabus Services
  syllabus: {
    getSyllabusProgress: async (classId, subjectId) => {
      const response = await api.get(`/syllabus/progress/${classId}/${subjectId}`);
      return response.data;
    },
    getTeacherProgress: async (teacherId, params = {}) => {
      const response = await api.get(`/syllabus/teacher/${teacherId}/progress`, { params });
      return response.data;
    },
  },

  // Annual Calendar Services
  annualCalendar: {
    getEvents: async () => {
      const response = await api.get("/annual-calendar");
      return response.data;
    },
    getTeacherCalendar: async () => {
      const response = await api.get("/annual-calendar/teacher");
      return response.data;
    },
    getStudentCalendar: async () => {
      const response = await api.get("/annual-calendar");
      return response.data;
    },
  },

  // Subjects APIs
  subjects: {
    getAll: async () => {
      const response = await api.get("/subjects");
      return response.data;
    },

    getTeacherAssignedSubjects: async () => {
      const response = await api.get("/subjects/teacher/assigned");
      return response.data;
    },

    getTeacherTimetableSubjects: async () => {
      const response = await api.get("/subjects/teacher/timetable");
      return response.data;
    },
  },

  // Classes APIs
  classes: {
    getAll: async () => {
      const response = await api.get("/classes");
      return response.data;
    },

    getTeacherAssignedClasses: async () => {
      const response = await api.get("/classes/teacher/assigned");
      return response.data;
    },

    getTeacherTimetableClasses: async () => {
      const response = await api.get("/classes/teacher/timetable");
      return response.data;
    },
    
    getClassById: async (id) => {
      const response = await api.get(`/classes/${id}`);
      return response.data;
    },
    
    getClassStudents: async (classId) => {
      const response = await api.get(`/classes/${classId}/students`);
      return response.data;
    },
    
    getStudentCalendar: async (studentId, params = {}) => {
      const response = await api.get(`/students/${studentId}/calendar`, { params });
      return response.data;
    },
    
    getClassStudentCalendar: async (classId, params = {}) => {
      const response = await api.get(`/classes/${classId}/student-calendar`, { params });
      return response.data;
    },
  },

  // Homework APIs
  homework: {
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/homework?${queryString}`);
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/homework/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await api.post("/homework", data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await api.put(`/homework/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(`/homework/${id}`);
      return response.data;
    },

    getCalendar: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/homework/calendar?${queryString}`);
      return response.data;
    },

    getStats: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/homework/stats?${queryString}`);
      return response.data;
    },

    updateProgress: async (id, data) => {
      const response = await api.put(`/homework/${id}/progress`, data);
      return response.data;
    },
  },

  // Fees APIs
  fees: {
    getStudentFeeInfo: async (studentId) => {
      const response = await api.get(`/fees/student/${studentId}/info`);
      return response.data;
    },

    getStudentPaymentHistory: async (studentId, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/fees/student/${studentId}/payment-history?${queryString}`);
      return response.data;
    },

    getStudentFees: async (studentId) => {
      const response = await api.get(`/fees/student/${studentId}`);
      return response.data;
    },
  },

  // Common utility functions
  uploadFile: async (file, type = "assignment") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Error handling helper
  handleError: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    return error.message || "An unexpected error occurred";
  },
};

export default apiService;

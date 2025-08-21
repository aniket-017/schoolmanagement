import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import { getAuthToken } from '../utils/auth';

const feeService = {
  // Get student's fee information
  getStudentFees: async (studentId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/fees/student/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get student's fee overview
  getStudentFeeInfo: async (studentId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/fees/student/${studentId}/info`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get student's payment history
  getPaymentHistory: async (studentId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/fees/student/${studentId}/payments`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default feeService;

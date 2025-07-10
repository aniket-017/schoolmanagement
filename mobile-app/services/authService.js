import axios from "../utils/axios";

class AuthService {
  async login(email, password) {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async register(userData) {
    try {
      const response = await axios.post("/api/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async logout() {
    try {
      const response = await axios.post("/api/auth/logout");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await axios.put("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getProfile() {
    try {
      const response = await axios.get("/api/auth/profile");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await axios.put("/api/auth/profile", profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export default new AuthService();

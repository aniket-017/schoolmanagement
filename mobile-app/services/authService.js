import axios from "axios";
import { config } from "../config/environment";

// Use environment-based API URL
const API_BASE_URL = config.API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.log("Logout error:", error);
    }
  },
};

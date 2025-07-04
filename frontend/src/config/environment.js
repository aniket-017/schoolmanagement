// Environment configuration for frontend
const config = {
  development: {
    API_BASE_URL: "http://localhost:1704/api",
    APP_NAME: "School Management (Development)",
  },
  production: {
    API_BASE_URL: "/api", // Relative path for production (served by same server)
    APP_NAME: "School Management",
  },
};

// Get current environment from Vite
const currentEnv = import.meta.env.MODE || "development";

export const appConfig = config[currentEnv];

export default appConfig;

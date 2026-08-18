import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081",
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================================
// ADD JWT TOKEN TO EVERY REQUEST
// =========================================================
api.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =========================================================
// HANDLE AUTHENTICATION ERRORS
// =========================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {

    if (error.response?.status === 401) {

      console.error(
        "Authentication failed. JWT may be expired or invalid."
      );

    }

    if (error.response?.status === 403) {

      console.error(
        "Access forbidden. Check JWT token and Spring Security configuration."
      );

    }

    return Promise.reject(error);
  }
);

export default api;
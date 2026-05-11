import axios from "axios";

const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "🔑 Sending request with token:",
        token.substring(0, 20) + "..."
      );
    } else {
      console.warn("⚠️ No token found in storage");
    }
    console.log("📤 Making API request to:", config.url);
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    console.error(`❌ API Error [${status}] on ${url}:`, {
      status,
      message: error.response?.data?.message,
      data: error.response?.data,
    });

    if (status === 401) {
      console.warn(
        "🔒 Unauthorized - clearing tokens and redirecting to login"
      );
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.href = "/login";
    } else if (status === 403) {
      console.warn("🚫 Forbidden - user lacks permission for this resource");
      // Don't redirect on 403, let the component handle it
    }

    return Promise.reject(error);
  }
);

export default api;

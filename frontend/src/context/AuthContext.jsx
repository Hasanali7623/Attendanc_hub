import { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../utils/apiService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (check both localStorage and sessionStorage)
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const savedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, rememberMe = true) => {
    try {
      const response = await authAPI.login(email, password);
      // Backend returns: { success, message, data: { token, id, name, email, role, ... } }
      const authData = response.data.data;
      const { token, ...userData } = authData;

      if (rememberMe) {
        // Store in localStorage for persistent login
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        // Store in sessionStorage for session-only login
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(userData));
      }

      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  };

  const register = async (registerData) => {
    try {
      const response = await authAPI.register(registerData);
      // Backend returns: { success, message, data: { token, id, name, email, role, ... } }
      const authData = response.data.data;
      const { token, ...userData } = authData;

      // Auto-login after registration (store in localStorage by default)
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      console.error("Register error:", error.response?.data);

      // Check if it's a validation error with detailed field errors
      if (error.response?.data?.data && typeof error.response.data.data === 'object') {
        const validationErrors = error.response.data.data;
        const errorMessages = Object.entries(validationErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(", ");
        return {
          success: false,
          message: errorMessages || error.response?.data?.message || "Registration failed. Please try again.",
        };
      }

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const updateUser = (newData) => {
    setUser((prev) => {
      const updatedUser = { ...prev, ...newData };
      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else if (sessionStorage.getItem("user")) {
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      }
      return updatedUser;
    });
  };

  const isAdmin = () => {
    return user?.role === "ADMIN";
  };

  const isStudent = () => {
    return user?.role === "STUDENT";
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    isStudent,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

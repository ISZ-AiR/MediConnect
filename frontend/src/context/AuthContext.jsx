import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "../services/apiClient";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          // Check if token is expired
          if (!isTokenExpired(storedToken)) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } else {
            // Token expired, clear everything
            logout();
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return true;

      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return false;

      return payload.exp * 1000 < Date.now();
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      // Create FormData for OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append("username", email); // OAuth2 uses 'username' field
      formData.append("password", password);

      const response = await apiRequest("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        includeAuth: false,
      });

      if (response.success && response.data) {
        const { access_token, email: userEmail, role } = response.data;

        // Store token
        localStorage.setItem("authToken", access_token);
        setToken(access_token);

        // Store user info
        const userData = { email: userEmail, role };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, user: userData };
      } else {
        return {
          success: false,
          error: response.error?.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "An error occurred during login",
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Register function (if you need it)
  const register = async (userData) => {
    try {
      const response = await apiRequest("/register", {
        method: "POST",
        body: JSON.stringify(userData),
        includeAuth: false,
      });

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return {
          success: false,
          error: response.error?.message || "Registration failed",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.message || "An error occurred during registration",
      };
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

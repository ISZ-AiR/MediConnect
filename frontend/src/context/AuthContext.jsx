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

  // Logout function
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Verify token with backend and sync user data
  const verifyTokenWithBackend = async () => {
    try {
      const storedToken =
        localStorage.getItem("authToken") || localStorage.getItem("token");

      if (!storedToken) {
        return false;
      }

      // Call backend /users/me endpoint to verify token and get real user data
      const response = await apiRequest("/users/me", {
        method: "GET",
        includeAuth: true,
      });

      if (response.success && response.data) {
        // Token is valid, update user data from backend
        const userData = {
          email: response.data.email,
          role: response.data.role,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          user_id: response.data.user_id,
        };

        // Sync localStorage with backend data
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setToken(storedToken);
        setIsAuthenticated(true);
        return true;
      } else {
        // Token is invalid
        logout();
        return false;
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      logout();
      return false;
    }
  };

  // Initialize auth state from localStorage and verify with backend
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken =
          localStorage.getItem("authToken") || localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          // Check if token is expired locally first
          if (!isTokenExpired(storedToken)) {
            // Verify with backend to ensure token is valid and data is correct
            await verifyTokenWithBackend();
          } else {
            // Token expired locally
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

  // Login function
  const login = async (email, password) => {
    try {
      const response = await apiRequest("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        includeAuth: false,
      });

      if (response.success && response.data) {
        const { access_token, token_type, user: userData } = response.data;

        // Store token (this is the secure JWT token)
        localStorage.setItem("token", access_token);
        localStorage.setItem("authToken", access_token);
        setToken(access_token);

        // Store user info (for UI display only, not for authorization)
        const userInfo = {
          email: userData.email,
          role: userData.role,
          first_name: userData.first_name,
          last_name: userData.last_name,
          user_id: userData.user_id,
        };
        localStorage.setItem("user", JSON.stringify(userInfo));
        setUser(userInfo);
        setIsAuthenticated(true);

        return { success: true, user: userInfo };
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
    verifyTokenWithBackend, // Expose this for manual verification if needed
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import { apiRequest } from "./apiClient";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Authentication service for handling login, logout, and registration
 */
export const authService = {
  /**
   * Login user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Response with user data and token
   */
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append("username", email); // OAuth2 uses 'username' field
    formData.append("password", password);

    return await apiRequest(API_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
      includeAuth: false,
    });
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Response with user data
   */
  register: async (userData) => {
    return await apiRequest(API_ENDPOINTS.REGISTER, {
      method: "POST",
      body: JSON.stringify(userData),
      includeAuth: false,
    });
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} Response with user profile data
   */
  getProfile: async () => {
    return await apiRequest(API_ENDPOINTS.USER_PROFILE, {
      method: "GET",
    });
  },

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Response with updated user data
   */
  updateProfile: async (userData) => {
    return await apiRequest(API_ENDPOINTS.UPDATE_PROFILE, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  /**
   * Logout user (clear local storage)
   */
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },
};

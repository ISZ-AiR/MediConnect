import { API_BASE_URL } from "../constants";

// Helper function to get default headers
export const getHeaders = (includeAuth = true, isFormData = false) => {
  const headers = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      if (!isTokenExpired(token)) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
  }

  return headers;
};

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;
console.log("App running in mode:", import.meta.env.DEV);

// Generic API request function
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = options.body instanceof FormData;

  const defaultHeaders = getHeaders(options.includeAuth !== false, isFormData);
  const headers = options.headers
    ? { ...defaultHeaders, ...options.headers }
    : defaultHeaders;

  if (headers["Content-Type"] === undefined) {
    delete headers["Content-Type"];
  }

  const config = {
    ...options,
    headers,
  };

  // Log the request details (only in development)
  if (isDevelopment) {
    console.group(`🚀 API Request: ${config.method || "GET"} ${url}`);
    console.log("📤 Request URL:", url);
    console.log("📋 Request Config:", {
      method: config.method || "GET",
      headers: config.headers,
      body:
        config.body instanceof FormData
          ? "FormData (see below)"
          : config.body instanceof URLSearchParams
          ? "URLSearchParams (see below)"
          : config.body,
    });

    if (config.body instanceof FormData) {
      console.log("📝 FormData contents:");
      for (let [key, value] of config.body.entries()) {
        console.log(`  ${key}:`, value);
      }
    }

    if (config.body instanceof URLSearchParams) {
      console.log("📝 URLSearchParams contents:");
      for (let [key, value] of config.body.entries()) {
        console.log(`  ${key}:`, value);
      }
    }

    console.groupEnd();
  }

  try {
    const startTime = performance.now();
    const response = await fetch(url, config);
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    // Log response details (only in development)
    if (isDevelopment) {
      console.group(
        `📡 API Response: ${response.status} ${response.statusText} (${duration}ms)`
      );
      console.log("📥 Response Status:", response.status, response.statusText);
      console.log(
        "📋 Response Headers:",
        Object.fromEntries(response.headers.entries())
      );
    }

    if (response.status === 401) {
      if (isDevelopment) {
        console.warn(
          "🔒 Authentication failed - clearing tokens and redirecting"
        );
        console.groupEnd();
      }
      clearAuthData();
      window.location.href = "/login";
      throw new Error("Authentication failed");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (isDevelopment) {
        if (response.status >= 400 && response.status < 500) {
          console.warn(
            `⚠️ Business Logic Error (${response.status}):`,
            errorData.detail || errorData.message
          );
        } else {
          console.error("❌ Server Error:", errorData);
        }

        if (response.status === 422 && errorData.detail) {
          console.warn("🔍 Validation Error Details:");
          if (Array.isArray(errorData.detail)) {
            errorData.detail.forEach((error, index) => {
              console.warn(
                `  ${index + 1}. Field: ${
                  error.loc?.join(".") || "unknown"
                }, Message: ${error.msg || "no message"}, Input: ${
                  error.input || "no input"
                }`
              );
            });
          }
        }

        console.groupEnd();
      }

      if (response.status >= 400 && response.status < 500) {
        return {
          success: false,
          error: {
            status: response.status,
            message:
              errorData.detail ||
              errorData.message ||
              `HTTP error! status: ${response.status}`,
            data: errorData,
          },
        };
      }

      const httpError = new Error(
        errorData.message ||
          errorData.detail ||
          `HTTP error! status: ${response.status}`
      );
      httpError.response = {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      };
      throw httpError;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const responseData = await response.json();
      if (isDevelopment) {
        console.log("✅ Response Data:", responseData);
        console.groupEnd();
      }
      return { success: true, data: responseData };
    }

    if (isDevelopment) {
      console.log("✅ Response (non-JSON):", response);
      console.groupEnd();
    }
    return { success: true, data: response };
  } catch (error) {
    if (isDevelopment) {
      console.group("❌ API Request Failed");
      console.error("API Request Error:", error);
      console.error("Request URL:", url);
      console.error("Request Config:", config);
      console.groupEnd();
    }
    throw error;
  }
};

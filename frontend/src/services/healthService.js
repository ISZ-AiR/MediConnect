import { apiRequest } from "./apiClient";
import { API_ENDPOINTS } from "../constants";

export const healthService = {
  check: async () => {
    return await apiRequest(API_ENDPOINTS.HEALTH, { includeAuth: false });
  },
};

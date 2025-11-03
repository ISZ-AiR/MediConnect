export { healthService } from "./healthService";
export { authService } from "./authService";
export { statsService } from "./statsService";
import { apiRequest } from "./apiClient";

// Named exports
export { healthService, apiRequest };

// Default export
export default {
  health: healthService,
};

import { healthService } from "./healthService";
import { apiRequest } from "./apiClient";

// Named exports
export { healthService, apiRequest };

// Default export
export default {
  health: healthService,
};

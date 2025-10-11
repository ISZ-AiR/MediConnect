export { healthService } from "./healthService";

// Export core utilities if needed elsewhere
export { apiRequest } from "./apiClient";

import { healthService } from "./healthService";

export default {
  health: healthService,
};

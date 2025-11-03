import { apiRequest } from "./apiClient";

/**
 * Statistics Service
 * Handles fetching system statistics for admin dashboard
 *
 * API Endpoints used:
 * - GET /doctor/ - List all doctors (admin only)
 * - GET /nurse/ - List all nurses (admin only)
 * - GET /patients/ - List all patients (receptionist/admin)
 * - GET /admins/ - List all admins (admin only)
 * - GET /receptionist/ - List all receptionists (admin only)
 */

export const statsService = {
  /**
   * Get system statistics
   * @returns {Promise<Object>} System statistics
   */
  async getSystemStats() {
    try {
      // Fetch all data in parallel
      const [
        doctorsResponse,
        nursesResponse,
        patientsResponse,
        adminsResponse,
        receptionistsResponse,
      ] = await Promise.all([
        apiRequest("/doctor/", { requiresAuth: true }),
        apiRequest("/nurse/", { requiresAuth: true }),
        apiRequest("/patients/", { requiresAuth: true }),
        apiRequest("/admins/", { requiresAuth: true }),
        apiRequest("/receptionist/", { requiresAuth: true }),
      ]);

      const doctors = doctorsResponse?.length || 0;
      const nurses = nursesResponse?.length || 0;
      const patients = patientsResponse?.length || 0;
      const admins = adminsResponse?.length || 0;
      const receptionists = receptionistsResponse?.length || 0;

      return {
        totalUsers: doctors + nurses + patients + admins + receptionists,
        activeDoctors: doctors,
        nurses: nurses,
        patients: patients,
      };
    } catch (error) {
      console.error("Error fetching system stats:", error);
      throw error;
    }
  },
};

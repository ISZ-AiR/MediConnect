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

const unwrap = (resp) => {
  if (!resp) return [];
  if (typeof resp === "object" && resp.success === true) return resp.data || [];
  return resp;
};

export const statsService = {
  /**
   * Get system statistics
   * @returns {Promise<Object>} System statistics
   */
  async getSystemStats() {
    try {
      // Fetch all data in parallel
      const [
        doctorsResp,
        nursesResp,
        patientsResp,
        adminsResp,
        receptionistsResp,
      ] = await Promise.all([
        apiRequest("/doctor/", { method: "GET" }),
        apiRequest("/nurse/", { method: "GET" }),
        apiRequest("/patients/", { method: "GET" }),
        apiRequest("/admins/", { method: "GET" }),
        apiRequest("/receptionist/", { method: "GET" }),
      ]);

      const doctors = unwrap(doctorsResp).length;
      const nurses = unwrap(nursesResp).length;
      const patients = unwrap(patientsResp).length;
      const admins = unwrap(adminsResp).length;
      const receptionists = unwrap(receptionistsResp).length;

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

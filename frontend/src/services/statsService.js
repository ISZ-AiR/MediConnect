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

  /**
   * Get doctor workload report
   * @param {string} start_date - format YYYY-MM-DD
   * @param {string} end_date - format YYYY-MM-DD
   * @returns {Promise<Array>} List of doctors with reservations and visits count
   */
  async getDoctorWorkload(start_date, end_date) {
    try {
      const params = new URLSearchParams();
      if (start_date) params.append("start_date", start_date);
      if (end_date) params.append("end_date", end_date);

      const resp = await apiRequest(`/reports/doctor-workload?${params.toString()}`, {
        method: "GET",
      });

      return unwrap(resp);
    } catch (error) {
      console.error("Error fetching doctor workload report:", error);
      throw error;
    }
  },

    /**
   * Get Reservations Summary between two dates
   */
  async getReservationsSummary(start_date, end_date) {
    try {
      const params = new URLSearchParams();
      if (start_date) params.append("start_date", start_date);
      if (end_date) params.append("end_date", end_date);

      const resp = await apiRequest(`/reports/reservations-summary?${params.toString()}`, {
        method: "GET",
      });

      return unwrap(resp);
    } catch (error) {
      console.error("Error fetching doctor workload report:", error);
      throw error;
    }
  },

  /**
   * Get Examinations stats
   */
  async getExaminations() {
    try {
      const data = await apiRequest("/reports/examinations", { method: "GET" });
      return unwrap(data);
    } catch (err) {
      console.error("Error fetching examinations stats:", err);
      throw err;
    }
  },


    async getDoctors() {
    try {
      const resp = await apiRequest("/doctor/", { method: "GET" });
      return unwrap(resp);
    } catch (err) {
      console.error("Error fetching doctors list:", err);
      throw err;
    }
  },

    getDoctorAvailability: async (startDate, endDate, doctorIds = []) => {
      const params = new URLSearchParams();

      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      if (doctorIds.length > 0) {
        doctorIds.forEach(id => params.append("doctor_ids", id));
      }

      return apiRequest(`/reports/doctor-availability?${params.toString()}`, "GET");
    },

    async getVisitsSummary() {
    try {
      const data = await apiRequest("/reports/summary", { method: "GET" });
      return unwrap(data);
    } catch (err) {
      console.error("Error fetching examinations stats:", err);
      throw err;
    }
  }
};

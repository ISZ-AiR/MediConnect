import { apiRequest } from "./apiClient";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const unwrap = (resp) => {
  if (!resp) return [];
  if (typeof resp === "object" && resp.success === true) return resp.data || [];
  return resp;
};

export const resourceService = {
  async listDoctors() {
    const res = await apiRequest(API_ENDPOINTS.DOCTORS_LIST, { method: "GET" });
    return unwrap(res);
  },
  async getDoctor(id) {
    const res = await apiRequest(`/doctor/${id}`, { method: "GET" });
    return res && res.success ? res.data : res;
  },
  async createDoctor(payload) {
    const res = await apiRequest(`/doctor/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res && res.success ? res.data : res;
  },
  async updateDoctor(id, payload) {
    const res = await apiRequest(`/doctor/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res && res.success ? res.data : res;
  },
  async deleteDoctor(id) {
    const res = await apiRequest(`/doctor/${id}`, { method: "DELETE" });
    return res;
  },
  async listNurses() {
    const res = await apiRequest(API_ENDPOINTS.NURSES_LIST, { method: "GET" });
    return unwrap(res);
  },
  async listPatients() {
    const res = await apiRequest(API_ENDPOINTS.PATIENTS_LIST, {
      method: "GET",
    });
    return unwrap(res);
  },
  async getPatient(id) {
    const res = await apiRequest(`/patients/${id}`, { method: "GET" });
    return res && res.success ? res.data : res;
  },
  async updatePatient(id, payload) {
    const res = await apiRequest(`/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res && res.success ? res.data : res;
  },
  async createPatientRegistration(payload) {
    const res = await apiRequest(`/patients/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res && res.success ? res.data : res;
  },
  async listReceptionists() {
    const res = await apiRequest(API_ENDPOINTS.RECEPTIONISTS_LIST, {
      method: "GET",
    });
    return unwrap(res);
  },
  async listAdmins() {
    const res = await apiRequest(API_ENDPOINTS.ADMINS_LIST, { method: "GET" });
    return unwrap(res);
  },
  async listManagers() {
    const res = await apiRequest("/managers/", { method: "GET" });
    return unwrap(res);
  },
  async listReservations() {
    const res = await apiRequest("/reservation/", { method: "GET" });
    return unwrap(res);
  },
  async listVisits() {
    const res = await apiRequest("/visits/", { method: "GET" });
    return unwrap(res);
  },
  async listPrescriptions() {
    const res = await apiRequest("/prescriptions/", { method: "GET" });
    return unwrap(res);
  },
  async listReferrals() {
    const res = await apiRequest("/referrals/", { method: "GET" });
    return unwrap(res);
  },
  async listDiseases() {
    const res = await apiRequest("/disease/", { method: "GET" });
    return unwrap(res);
  },
  async listExaminations() {
    const res = await apiRequest("/examinations/", { method: "GET" });
    return unwrap(res);
  },
  async getExamination(id) {
    const res = await apiRequest(`/examinations/${id}`, { method: "GET" });
    return res && res.success ? res.data : res;
  },
  async createExamination(payload) {
    const res = await apiRequest(`/examinations/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res && res.success ? res.data : res;
  },
  async updateExamination(id, payload) {
    const res = await apiRequest(`/examinations/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res && res.success ? res.data : res;
  },
  async deleteExamination(id) {
    const res = await apiRequest(`/examinations/${id}`, { method: "DELETE" });
    return res;
  },
  async listSchedules() {
    const res = await apiRequest("/schedules/", { method: "GET" });
    return unwrap(res);
  },
  async getSchedule(id) {
    const res = await apiRequest(`/schedules/${id}`, { method: "GET" });
    return res && res.success ? res.data : res;
  },
  async createSchedule(payload) {
    const res = await apiRequest(`/schedules/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res && res.success ? res.data : res;
  },
  async updateSchedule(id, payload) {
    const res = await apiRequest(`/schedules/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res && res.success ? res.data : res;
  },
  async deleteSchedule(id) {
    const res = await apiRequest(`/schedules/${id}`, { method: "DELETE" });
    return res;
  },
  async getVisit(id) {
    const res = await apiRequest(`/visits/${id}`, { method: "GET" });
    return res && res.success ? res.data : res;
  },
  async getDetailedVisit(id) {
    const res = await apiRequest(`/visits/detailed/${id}`, { method: "GET" });
    return res && res.success ? res.data : res;
  },
  async createVisit(payload) {
    const res = await apiRequest(`/visits/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res && res.success ? res.data : res;
  },
  async updateVisit(id, payload) {
    const res = await apiRequest(`/visits/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res && res.success ? res.data : res;
  },
  async deleteVisit(id) {
    const res = await apiRequest(`/visits/${id}`, { method: "DELETE" });
    return res;
  },
  async getPrescription(id) {
    const res = await apiRequest(`/prescriptions/${id}`, { method: "GET" });
    return res && res.success ? res.data : res;
  },
  getPrescriptionByVisit: async (visit_id) => {
    try {
      const res = await apiRequest(`/prescriptions/visit/${visit_id}`);
      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return null;
      }
      throw err;
    }
  },
  async listPrescriptionsByPatient() {
    const res = await apiRequest("/prescriptions/me", { method: "GET" });
    return unwrap(res);
  },
  async getMyPrescription(id) {
    const res = await apiRequest(`/prescriptions/me/${id}`, { method: "GET" });
    return res && res.success ? res.data : res;
  },
  createPrescription: async (form, visit_id) => {
    const res = await apiRequest(`/prescriptions/?visit_id=${visit_id}`, {
      method: "POST",
      body: JSON.stringify({
        medication: form.medication,
        dosage: form.dosage,
        instruction: form.instruction,
      }),
    });
    return res.data;
  },

  updatePrescription: async (prescription_id, payload) => {
    const res = await apiRequest(`/prescriptions/${prescription_id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
  async deletePrescription(id) {
    const res = await apiRequest(`/prescriptions/${id}`, { method: "DELETE" });
    return res;
  },
  async getReferral(id) {
    const res = await apiRequest(`/referrals/${id}`, { method: "GET" });
    return res && res.success ? res.data : res;
  },

  getReferralByVisit: async (visit_id) => {
    try {
      const res = await apiRequest(`/referrals/visit/${visit_id}`);
      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return null;
      }
      throw err;
    }
  },

  async createReferral(payload) {
    const res = await apiRequest(`/referrals/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res && res.success ? res.data : res;
  },
  async updateReferral(id, payload) {
    const res = await apiRequest(`/referrals/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res && res.success ? res.data : res;
  },
  async deleteReferral(id) {
    const res = await apiRequest(`/referrals/${id}`, { method: "DELETE" });
    return res;
  },

  async getDisease(id) {
    const res = await apiRequest(`/disease/${id}`, { method: "GET" });
    return res && res.success ? res.data : res;
  },

  async getDiagnosis(id) {
    const res = await apiRequest(`/diagnosis/${id}`, { method: "GET" });
    return res && res.success ? res.data : res;
  },

  async createDiagnosis(visit_id, payload) {
    const res = await apiRequest(`/diagnosis/`, {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        visit_id: Number(visit_id),
      }),
    });
    return res && res.success ? res.data : res;
  },

  async updateDiagnosis(id, payload) {
    const res = await apiRequest(`/diagnosis/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res && res.success ? res.data : res;
  },

  async deleteDiagnosis(id) {
    const res = await apiRequest(`/diagnosis/${id}`, { method: "DELETE" });
    return res;
  },

  async getManager(id) {
    const res = await apiRequest(`/managers/${id}`, { method: "GET" });
    return res && res.success ? res.data : res;
  },
  async createManager(payload) {
    const res = await apiRequest(`/managers/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res && res.success ? res.data : res;
  },
  async updateManager(id, payload) {
    const res = await apiRequest(`/managers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res && res.success ? res.data : res;
  },
  async deleteManager(id) {
    const res = await apiRequest(`/managers/${id}`, { method: "DELETE" });
    return res;
  },
};

export default resourceService;

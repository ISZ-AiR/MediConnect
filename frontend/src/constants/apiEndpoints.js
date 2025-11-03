export const API_ENDPOINTS = {
  // Health check
  HEALTH: "/health",

  // Authentication
  LOGIN: "/login",
  LOGOUT: "/logout",

  // Patient Registration (public)
  PATIENT_REGISTER: "/patients/register",

  // Staff Registration (admin only)
  DOCTOR_CREATE: "/doctor/",
  NURSE_CREATE: "/nurse/",
  RECEPTIONIST_CREATE: "/receptionist/",
  ADMIN_CREATE: "/admins/",

  // User
  USER_PROFILE: "/user/profile",
  UPDATE_PROFILE: "/user/profile/update",

  // Statistics (admin only)
  DOCTORS_LIST: "/doctor/",
  NURSES_LIST: "/nurse/",
  PATIENTS_LIST: "/patients/",
  ADMINS_LIST: "/admins/",
  RECEPTIONISTS_LIST: "/receptionist/",
};

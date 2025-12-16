import { useEffect, useState } from "react";
import { apiRequest } from "../services/apiClient";

// Composite loader for visit related entities.
// Returns { loading, error, data } where data contains structured collections
export const useVisitDetails = (visitId, role) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    visit: null,
    users: [],
    nurses: [],
    reservations: [],
    doctors: [],
    patients: [],
    prescriptions: [],
    referrals: [],
    diagnoses: [],
  });

  useEffect(() => {
    if (!visitId) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        let requests;

        if (role === "patient") {
          // Patient-specific endpoints
          requests = [
            apiRequest(`/visits/me/${visitId}`),
            apiRequest("/users"),
            apiRequest("/nurse"),
            apiRequest("/reservation/me"),
            apiRequest("/doctor"),
            apiRequest("/patients/me"), // Get own patient data
            apiRequest("/prescriptions/me"),
          ];
        } else {
          // Staff endpoints
          requests = [
            apiRequest(`/visits/${visitId}`),
            apiRequest("/users"),
            apiRequest("/nurse"),
            apiRequest("/reservation"),
            apiRequest("/doctor"),
            apiRequest("/patients"),
          ];

          if (role === "doctor") {
            requests.push(
              apiRequest("/prescriptions"),
              apiRequest("/referrals"),
              apiRequest("/diagnosis")
            );
          }
        }

        const responses = await Promise.all(requests);

        const visit = responses[0]?.data || null;
        const users = responses[1]?.data || [];
        const nurses = responses[2]?.data || [];
        const reservations = responses[3]?.data || [];
        const doctors = responses[4]?.data || [];
        let patients = [];
        let prescriptions = [];
        let referrals = [];
        let diagnoses = [];

        if (role === "patient") {
          // For patient role, wrap single patient data in array for consistency
          const patientData = responses[5]?.data;
          patients = patientData ? [patientData] : [];

          // Filter prescriptions for this specific visit
          prescriptions = (responses[6]?.data || []).filter(
            (p) => p.visit_id === Number(visitId)
          );
          // Patients currently don't have access to referrals/diagnoses endpoints
          referrals = [];
          diagnoses = [];
        } else if (role === "doctor") {
          patients = responses[5]?.data || [];
          prescriptions = (responses[6]?.data || []).filter(
            (p) => p.visit_id === Number(visitId)
          );
          referrals = (responses[7]?.data || []).filter(
            (r) => r.visit_id === Number(visitId)
          );
          diagnoses = (responses[8]?.data || []).filter(
            (d) => d.visit_id === Number(visitId)
          );
        } else {
          // For other roles (nurse, receptionist, etc.)
          patients = responses[5]?.data || [];
        }

        setData({
          visit,
          users,
          nurses,
          reservations,
          doctors,
          patients,
          prescriptions,
          referrals,
          diagnoses,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load visit details");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [visitId, role]);

  const getUserName = (user_id) => {
    const u = data.users.find((x) => x.user_id === user_id);
    return u ? `${u.first_name} ${u.last_name}` : "N/A";
  };

  const getPatientPESEL = (patient_id) => {
    const u = data.patients.find((x) => x.patient_id === patient_id);
    return u ? `${u.pesel}` : "N/A";
  };

  const getNurseName = (nurse_id) => {
    const nurse = data.nurses.find((n) => n.nurse_id === nurse_id);
    if (!nurse) return "N/A";
    return getUserName(nurse.user_id);
  };

  const getDoctorNameFromReservation = (reservation_id) => {
    const reservation = data.reservations.find(
      (r) => r.reservation_id === reservation_id
    );
    if (!reservation) return "N/A";
    const doctor = data.doctors.find(
      (d) => d.doctor_id === reservation.doctor_id
    );
    if (!doctor) return "N/A";
    return getUserName(doctor.user_id);
  };

  const getPatientNameFromReservation = (reservation_id) => {
    const reservation = data.reservations.find(
      (r) => r.reservation_id === reservation_id
    );
    if (!reservation) return "N/A";
    const patient = data.patients.find(
      (d) => d.patient_id === reservation.patient_id
    );
    if (!patient) return "N/A";
    return getUserName(patient.user_id);
  };

  const getPatientPESELFromReservation = (reservation_id) => {
    const reservation = data.reservations.find(
      (r) => r.reservation_id === reservation_id
    );
    if (!reservation) return "N/A";
    const patient = data.patients.find(
      (d) => d.patient_id === reservation.patient_id
    );
    if (!patient) return "N/A";
    return getPatientPESEL(patient.patient_id);
  };

  return {
    ...data,
    loading,
    error,
    getPatientNameFromReservation,
    getPatientPESELFromReservation,
    getNurseName,
    getDoctorNameFromReservation,
  };
};

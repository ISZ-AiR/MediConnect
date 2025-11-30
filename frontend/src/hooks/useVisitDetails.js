import { useEffect, useState } from "react";
import { apiRequest } from "../services/apiClient";

// Composite loader for visit related entities.
// Returns { loading, error, data } where data contains structured collections
export const useVisitDetails = (visitId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    visit: null,
    users: [],
    nurses: [],
    reservations: [],
    doctors: [],
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
        const [
          visitRes,
          usersRes,
          nursesRes,
          reservationsRes,
          doctorsRes,
          patientsRes,
          prescriptionsRes,
          referralsRes,
          diagnosesRes,
        ] = await Promise.all([
          apiRequest(`/visits/${visitId}`),
          apiRequest("/users"),
          apiRequest("/nurse"),
          apiRequest("/reservation"),
          apiRequest("/doctor"),
          apiRequest("/patients"),
          apiRequest("/prescriptions"),
          apiRequest("/referrals"),
          apiRequest("/diagnosis"),
        ]);
        const visit = visitRes?.data || null;
        const users = usersRes?.data || [];
        const nurses = nursesRes?.data || [];
        const reservations = reservationsRes?.data || [];
        const doctors = doctorsRes?.data || [];
        const patients = patientsRes?.data || [];
        const prescriptions = (prescriptionsRes?.data || []).filter(
          (p) => p.visit_id === Number(visitId)
        );
        const referrals = (referralsRes?.data || []).filter(
          (r) => r.visit_id === Number(visitId)
        );
        const diagnoses = (diagnosesRes?.data || []).filter(
          (d) => d.visit_id === Number(visitId)
        );
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
  }, [visitId]);

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

export default useVisitDetails;

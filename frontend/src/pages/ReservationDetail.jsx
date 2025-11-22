import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import { useParams, Link, useNavigate } from "react-router-dom";

const ReservationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [
          reservationRes,
          usersRes,
          patientsRes,
          doctorsRes,
          nursesRes,
        ] = await Promise.all([
          apiRequest(`/reservation/${id}`, { method: "GET" }),
          apiRequest("/users"),
          apiRequest("/patients"),
          apiRequest("/doctor"),
          apiRequest("/nurse"),
        ]);

        setReservation(
          reservationRes.success ? reservationRes.data : reservationRes
        );
        setUsers(usersRes?.data || []);
        setPatients(patientsRes?.data || []);
        setDoctors(doctorsRes?.data || []);
        setNurses(nursesRes?.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load reservation or related data");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id]);

  const getPatientLabel = (patientId) => {
    const patient = patients.find((p) => p.patient_id === patientId);
    if (!patient) return patientId;

    const user = users.find((u) => u.user_id === patient.user_id);
    return user
      ? `${patient.pesel} - ${user.first_name} ${user.last_name}`
      : patient.pesel;
  };

  const getDoctorLabel = (doctorId) => {
    const doctor = doctors.find((d) => d.doctor_id === doctorId);
    if (!doctor) return doctorId;

    const user = users.find((u) => u.user_id === doctor.user_id);
    return user
      ? `${doctor.doctor_id} - ${user.first_name} ${user.last_name}`
      : `Doctor ${doctor.doctor_id}`;
  };

  const getNurseLabel = (nurseId) => {
    const nurse = nurses.find((n) => n.nurse_id === nurseId);
    if (!nurse) return nurseId;

    const user = users.find((u) => u.user_id === nurse.user_id);
    return user
      ? `${nurse.nurse_id} - ${user.first_name} ${user.last_name}`
      : `Nurse ${nurse.nurse_id}`;
  };

  const handleCancel = async () => {
    try {
      await apiRequest(`/reservation/${id}/cancel`, { method: "POST" });
      navigate("/admin/reservations");
    } catch (err) {
      console.error(err);
      setError("Failed to cancel reservation");
    }
  };

  if (loading)
    return (
      <div className="min-vh-100">
        <Navbar />
        <div className="container py-5">Loading...</div>
      </div>
    );

  if (error)
    return (
      <div className="min-vH-100">
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );

  if (!reservation)
    return (
      <div className="min-vh-100">
        <Navbar />
        <div className="container py-5">Reservation not found</div>
      </div>
    );

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-9 col-lg-8">

            <div className="card shadow-sm border-0">
              <div className="card-body p-5 text-center">

                {/* ICON + TITLE */}
                <i
                  className="bi bi-calendar-check text-primary"
                  style={{ fontSize: "3rem" }}
                ></i>

                <h2 className="fw-bold mt-3 mb-2">
                  Reservation #{reservation.reservation_id}
                </h2>
                <p className="text-muted">Reservation Details</p>

                {/* DETAILS */}
                <div className="text-start mt-4">
                  <h5 className="mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    Reservation Information
                  </h5>

                  <div className="mb-3">
                    <strong>Patient:</strong>{" "}
                    {getPatientLabel(reservation.patient_id)}
                  </div>

                  <div className="mb-3">
                    <strong>Doctor:</strong>{" "}
                    {getDoctorLabel(reservation.doctor_id)}
                  </div>

                  <div className="mb-3">
                    <strong>Nurse:</strong>{" "}
                    {getNurseLabel(reservation.nurse_id)}
                  </div>

                  <div className="mb-3">
                    <strong>Time:</strong>{" "}
                    {new Date(reservation.reservation_time)
                      .toLocaleString("pl-PL", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      .replace(",", " godz.")}
                  </div>

                  <div className="mb-3">
                    <strong>Cancelled:</strong>{" "}
                    {reservation.is_cancelled ? "Yes" : "No"}
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="mt-4 d-grid gap-2">
                  <button
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => navigate("/admin/reservations")}
                  >
                    Back
                  </button>

                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate(`/admin/reservations/edit/${reservation.reservation_id}`)}
                  >
                    Edit Reservation
                  </button>

                  {!reservation.is_cancelled && (
                    <button
                      className="btn btn-danger btn-lg"
                      onClick={handleCancel}
                    >
                      Cancel Reservation
                    </button>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetail;

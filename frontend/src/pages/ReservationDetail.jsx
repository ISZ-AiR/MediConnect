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

        const [reservationRes, usersRes, patientsRes, doctorsRes, nursesRes] = await Promise.all([
          apiRequest(`/reservation/${id}`, { method: "GET" }),
          apiRequest("/users"),
          apiRequest("/patients"),
          apiRequest("/doctor"),
          apiRequest("/nurse"),
        ]);

        setReservation(reservationRes.success ? reservationRes.data : reservationRes);
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
    return user ? `${patient.pesel} - ${user.first_name} ${user.last_name}` : patient.pesel;
  };

  const getDoctorLabel = (doctorId) => {
    const doctor = doctors.find((d) => d.doctor_id === doctorId);
    if (!doctor) return doctorId;
    const user = users.find((u) => u.user_id === doctor.user_id);
    return user ? `${doctor.doctor_id} - ${user.first_name} ${user.last_name}` : `Doctor ${doctor.doctor_id}`;
  };

  const getNurseLabel = (nurseId) => {
    const nurse = nurses.find((n) => n.nurse_id === nurseId);
    if (!nurse) return nurseId;
    const user = users.find((u) => u.user_id === nurse.user_id);
    return user ? `${nurse.nurse_id} - ${user.first_name} ${user.last_name}` : `Nurse ${nurse.nurse_id}`;
  };

  const handleCancel = async () => {
    try {
      await apiRequest(`/reservation/${id}/cancel`, { method: "POST" });
      navigate("/admin/reservations");
    } catch (err) {
      console.error(err);
      setError("Failed to cancel");
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
      <div className="min-vh-100">
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Reservation #{reservation.reservation_id}</h2>
          <div>
            <Link to="/admin/reservations" className="btn btn-outline-secondary me-2">
              Back
            </Link>
            <button onClick={handleCancel} className="btn btn-danger">
              Cancel
            </button>
          </div>
        </div>

        <div className="card p-4">
          <p>
            <strong>Patient:</strong> {getPatientLabel(reservation.patient_id)}
          </p>
          <p>
            <strong>Doctor:</strong> {getDoctorLabel(reservation.doctor_id)}
          </p>
          <p>
            <strong>Nurse:</strong> {getNurseLabel(reservation.nurse_id)}
          </p>
          <p>
            <strong>Time:</strong>{" "}
            {new Date(reservation.reservation_time).toLocaleString("pl-PL", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }).replace(",", " godz.")}
          </p>
          <p>
            <strong>Cancelled:</strong> {reservation.is_cancelled ? "Yes" : "No"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetail;

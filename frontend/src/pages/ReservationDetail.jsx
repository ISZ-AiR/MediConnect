import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import { useParams, useNavigate } from "react-router-dom";

const ReservationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [users, setUsers] = useState([]);
  const [visitExists, setVisitExists] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [selectedNurse, setSelectedNurse] = useState("");
  const [visitNote, setVisitNote] = useState("");

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
          visitsRes,
        ] = await Promise.all([
          apiRequest(`/reservation/${id}`),
          apiRequest("/users"),
          apiRequest("/patients"),
          apiRequest("/doctor"),
          apiRequest("/nurse"),
          apiRequest(`/visits`),
        ]);

        setReservation(
          reservationRes.success ? reservationRes.data : reservationRes
        );
        setUsers(usersRes?.data || []);
        setPatients(patientsRes?.data || []);
        setDoctors(doctorsRes?.data || []);
        setNurses(nursesRes?.data || []);

        // Filtrujemy wizyty po reservation_id
        const visitsForReservation = (visitsRes?.data || []).filter(
          (v) => v.reservation_id === parseInt(id)
        );

        setVisitExists(visitsForReservation.length > 0);
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
    const user = users.find((u) => u.user_id === patient?.user_id);
    return user
      ? `${patient.pesel} - ${user.first_name} ${user.last_name}`
      : patient?.pesel || patientId;
  };

  const getDoctorLabel = (doctorId) => {
    const doctor = doctors.find((d) => d.doctor_id === doctorId);
    const user = users.find((u) => u.user_id === doctor?.user_id);
    return user
      ? `${doctor.doctor_id} - ${user.first_name} ${user.last_name}`
      : `Doctor ${doctor?.doctor_id || doctorId}`;
  };

  const getNurseLabel = (nurseId) => {
    const nurse = nurses.find((n) => n.nurse_id === nurseId);
    const user = users.find((u) => u.user_id === nurse?.user_id);
    return user
      ? `${nurse.nurse_id} - ${user.first_name} ${user.last_name}`
      : `Nurse ${nurse?.nurse_id || nurseId}`;
  };

  const handleCancel = async () => {
    try {
      await apiRequest(`/reservation/${id}/cancel`, { method: "POST" });
      navigate("/receptionist/reservations");
    } catch (err) {
      console.error(err);
      setError("Failed to cancel reservation");
    }
  };

  const handleCreateVisit = async () => {
    if (!visitDate || !selectedNurse) {
      alert("Please select visit date and nurse.");
      return;
    }

    try {
      const res = await apiRequest(`/visits/${reservation.reservation_id}`, {
        method: "POST",
        body: JSON.stringify({
          visit_date: visitDate,
          visit_time: visitTime,
          nurse_id: selectedNurse,
          visit_note: visitNote,
        }),
      });
      if (res.success) {
        alert("Visit created successfully!");
        setShowModal(false);
      } else {
        alert(res.detail || "Failed to create visit");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating visit");
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-vH-100">
        {" "}
        <Navbar />{" "}
        <div className="container py-5">
          {" "}
          <div className="alert alert-danger">{error}</div>{" "}
        </div>{" "}
      </div>
    );

  if (!reservation)
    return (
      <div className="min-vh-100">
        {" "}
        <Navbar /> <div className="container py-5">
          Reservation not found
        </div>{" "}
      </div>
    );

  const reservationDateStr = new Date(reservation.reservation_time)
    .toISOString()
    .slice(0, 10);

  return (
    <div className="min-vh-100 bg-light">
      {" "}
      <Navbar />{" "}
      <div className="container py-5">
        {" "}
        <div className="row justify-content-center">
          {" "}
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
                    <i className="bi bi-info-circle me-2"></i>Reservation
                    Information
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
                    onClick={() => navigate("/receptionist/reservations")}
                  >
                    Back
                  </button>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() =>
                      navigate(
                        `/receptionist/reservations/edit/${reservation.reservation_id}`
                      )
                    }
                  >
                    Edit Reservation
                  </button>
                  {!reservation.is_cancelled && (
                    <>
                      <button
                        className="btn btn-danger btn-lg"
                        onClick={handleCancel}
                      >
                        Cancel Reservation
                      </button>
                      <button
                        className="btn btn-success btn-lg"
                        onClick={() => setShowModal(true)}
                        disabled={visitExists}
                      >
                        {visitExists ? "Visit Already Exists" : "Create Visit"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Modal */}
        {showModal && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
          >
            <div
              className="bg-white p-4 rounded shadow"
              style={{ width: "100%", maxWidth: "500px" }}
            >
              <div className="text-center mb-4">
                <i
                  className="bi bi-calendar-plus text-success"
                  style={{ fontSize: "2.5rem" }}
                ></i>
                <h4 className="fw-bold mt-2">Create Visit</h4>
              </div>
              ```
              <div className="mb-3">
                <label className="form-label fw-bold">Visit Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  min={reservationDateStr}
                  max={reservationDateStr}
                />
                <div className="form-text">
                  Visit must be on the reservation date.
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Visit Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Nurse</label>
                <select
                  className="form-select"
                  value={selectedNurse}
                  onChange={(e) => setSelectedNurse(e.target.value)}
                >
                  <option value="">Select nurse</option>
                  {nurses.map((n) => (
                    <option key={n.nurse_id} value={n.nurse_id}>
                      {getNurseLabel(n.nurse_id)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Visit Note</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={visitNote}
                  onChange={(e) => setVisitNote(e.target.value)}
                ></textarea>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-secondary flex-fill"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success flex-fill"
                  onClick={() => {
                    if (visitDate !== reservationDateStr) {
                      alert(
                        "Visit must be on the same date as the reservation."
                      );
                      return;
                    }
                    handleCreateVisit();
                  }}
                >
                  Create Visit
                </button>
              </div>
            </div>
            ```
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationDetail;

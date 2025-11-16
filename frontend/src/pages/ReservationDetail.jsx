import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import { useParams, Link, useNavigate } from "react-router-dom";

const ReservationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/reservation/${id}`, { method: "GET" });
        setReservation(res.success ? res.data : res);
      } catch (err) {
        console.error(err);
        setError("Failed to load reservation");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

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
            <Link
              to="/admin/reservations"
              className="btn btn-outline-secondary me-2"
            >
              Back
            </Link>
            <button onClick={handleCancel} className="btn btn-danger">
              Cancel
            </button>
          </div>
        </div>

        <div className="card p-4">
          <p>
            <strong>Patient ID:</strong> {reservation.patient_id}
          </p>
          <p>
            <strong>Doctor ID:</strong> {reservation.doctor_id}
          </p>
          <p>
            <strong>Nurse ID:</strong> {reservation.nurse_id}
          </p>
          <p>
            <strong>Time:</strong> {reservation.reservation_time}
          </p>
          <p>
            <strong>Cancelled:</strong>{" "}
            {reservation.is_cancelled ? "Yes" : "No"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetail;

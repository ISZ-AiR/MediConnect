import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import { useParams, useNavigate } from "react-router-dom";

const ReservationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: "",
    nurse_id: "",
    reservation_time: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const res = await apiRequest(`/reservation/${id}`, { method: "GET" });
        const data = res.success ? res.data : res;
        setForm({
          patient_id: data.patient_id,
          doctor_id: data.doctor_id,
          nurse_id: data.nurse_id,
          reservation_time: data.reservation_time,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load reservation");
      }
    };
    load();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        patient_id: Number(form.patient_id),
        doctor_id: Number(form.doctor_id),
        nurse_id: form.nurse_id ? Number(form.nurse_id) : null,
        reservation_time: form.reservation_time,
        is_cancelled: false,
      };
      if (id) {
        const res = await apiRequest(`/reservation/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (res.success) navigate("/admin/reservations");
      } else {
        const res = await apiRequest("/reservation/create", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (res.success) navigate("/admin/reservations");
      }
    } catch (err) {
      console.error(err);
      setError("Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">
          {id ? "Edit Reservation" : "Create Reservation"}
        </h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="card p-4">
          <div className="mb-3">
            <label className="form-label">Patient ID</label>
            <input
              name="patient_id"
              className="form-control"
              value={form.patient_id}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Doctor ID</label>
            <input
              name="doctor_id"
              className="form-control"
              value={form.doctor_id}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Nurse ID</label>
            <input
              name="nurse_id"
              className="form-control"
              value={form.nurse_id}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Reservation Time</label>
            <input
              name="reservation_time"
              type="datetime-local"
              className="form-control"
              value={form.reservation_time}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;

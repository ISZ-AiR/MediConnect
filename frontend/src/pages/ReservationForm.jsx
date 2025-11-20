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
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [patientsRes, doctorsRes, nursesRes, usersRes] = await Promise.all([
          apiRequest("/patients"),
          apiRequest("/doctor"),
          apiRequest("/nurse"),
          apiRequest("/users"),
        ]);

        const usersData = usersRes.data || [];
        const usersMap = new Map(usersData.map(u => [u.user_id, u]));

        console.log("Patients:", patientsRes.data);
        console.log("Doctors:", doctorsRes.data);
        console.log("Nurses:", nursesRes.data);
        console.log("Users:", usersData);

        const patientsData = (patientsRes.data || []).map(p => ({
          ...p,
          user: usersMap.get(p.user_id),
        }));
        const doctorsData = (doctorsRes.data || []).map(d => ({
          ...d,
          user: usersMap.get(d.user_id),
        }));
        const nursesData = (nursesRes.data || []).map(n => ({
          ...n,
          user: usersMap.get(n.user_id),
        }));

        setPatients(patientsData);
        setDoctors(doctorsData);
        setNurses(nursesData);
      } catch (err) {
        console.error(err);
        setError("Failed to load dropdowns");
      } finally {
        setLoadingDropdowns(false);
      }
    };
    loadDropdowns();
  }, []);

  useEffect(() => {
    const loadReservation = async () => {
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
    loadReservation();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  const payload = {
    patient_id: Number(form.patient_id),
    doctor_id: Number(form.doctor_id),
    nurse_id: form.nurse_id ? Number(form.nurse_id) : null,
    reservation_time: form.reservation_time,
    is_cancelled: false,
  };

  const url = id ? `/reservation/${id}` : "/reservation/create";
  const method = id ? "PUT" : "POST";

  try {
    const res = await apiRequest(url, {
      method,
      body: JSON.stringify(payload),
    });

    if (res.success) {
      navigate("/admin/reservations");
    } else {
      setError(res.detail || "Save failed");
    }
  } catch (err) {
    console.error(err);
    if (err?.detail) {
      setError(err.detail);
    } else {
      setError("Save failed");
    }
  } finally {
    setLoading(false);
  }
};

  if (loadingDropdowns) return <p>Loading form...</p>;

  const displayPatientName = (p) =>
    p.user ? `${p.pesel} - ${p.user.first_name} ${p.user.last_name}` : `${p.pesel} - [brak danych]`;

  const displayDoctorName = (s) =>
    s.user ? `${s.doctor_id} - ${s.user.first_name} ${s.user.last_name}` : `${s.doctor_id} - [brak danych]`;

    const displayNurseName = (s) =>
    s.user ? `${s.nurse_id} - ${s.user.first_name} ${s.user.last_name}` : `${s.nurse_id} - [brak danych]`;

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">{id ? "Edit Reservation" : "Create Reservation"}</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="card p-4">
          <div className="mb-3">
            <label className="form-label">Patient</label>
            <select
              name="patient_id"
              className="form-select"
              value={form.patient_id}
              onChange={handleChange}
              style={{ fontSize: "1.4rem" }}
              required
            >
              <option value="">Select patient</option>
              {patients.map(p => (
                <option key={p.patient_id} value={p.patient_id}>
                  {displayPatientName(p)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Doctor</label>
            <select
              name="doctor_id"
              className="form-select"
              value={form.doctor_id}
              onChange={handleChange}
              style={{ fontSize: "1.4rem" }}
              required
            >
              <option value="">Select doctor</option>
              {doctors.map(d => (
                <option key={d.doctor_id} value={d.doctor_id}>
                  {displayDoctorName(d)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Nurse</label>
            <select
              name="nurse_id"
              className="form-select"
              value={form.nurse_id || ""}
              onChange={handleChange}
              style={{ fontSize: "1.4rem" }}
            >
              <option value="">Select nurse</option>
              {nurses.map(n => (
                <option key={n.nurse_id} value={n.nurse_id}>
                  {displayNurseName(n)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Reservation Time</label>
            <input
              name="reservation_time"
              type="datetime-local"
              className="form-control"
              value={form.reservation_time}
              onChange={handleChange}
              style={{ fontSize: "1.4rem" }}
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

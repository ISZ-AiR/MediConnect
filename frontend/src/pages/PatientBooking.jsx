import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import { resourceService } from "../services/resourceService";
import { useAuth } from "../context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PatientBooking = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    patient_id: user?.user_id || "",
    doctor_id: "",
    nurse_id: "",
    reservation_time: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload = {
        patient_id: Number(form.patient_id),
        doctor_id: Number(form.doctor_id),
        nurse_id: form.nurse_id ? Number(form.nurse_id) : null,
        reservation_time: form.reservation_time
          ? new Date(form.reservation_time).toISOString()
          : null,
        is_cancelled: false,
      };

      // Attempt to create reservation - backend may require receptionist role
      const resp = await apiRequest("/reservation/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (resp && resp.success) {
        setMessage({
          type: "success",
          text: "Reservation created successfully.",
        });
      } else {
        setMessage({
          type: "warning",
          text: "Reservation request sent or cannot be created directly. Please contact reception.",
        });
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 403) {
        setMessage({
          type: "danger",
          text: "Booking must be created by receptionist. Please contact reception.",
        });
      } else {
        setMessage({ type: "danger", text: "Failed to create reservation." });
      }
    } finally {
      setLoading(false);
    }
  };

  // Load doctors and schedules
  React.useEffect(() => {
    const load = async () => {
      try {
        const docs = await resourceService.listDoctors();
        setDoctors(docs || []);
        const scheds = await resourceService.listSchedules();
        setSchedules(scheds || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">Book an Appointment</h2>

        {message && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit} className="card p-4">
          <div className="mb-3">
            <label className="form-label">Patient ID</label>
            <input
              name="patient_id"
              className="form-control"
              value={form.patient_id}
              onChange={handleChange}
              disabled
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Doctor</label>
            <select
              name="doctor_id"
              className="form-select"
              value={form.doctor_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a doctor</option>
              {doctors.map((d) => (
                <option key={d.doctor_id} value={d.doctor_id}>
                  {d.first_name} {d.last_name} ({d.specialty || "Doctor"})
                </option>
              ))}
            </select>
          </div>

          {form.doctor_id && (
            <div className="mb-3">
              <label className="form-label">
                Available Schedules for selected doctor
              </label>
              <ul className="list-group">
                {schedules
                  .filter((s) => Number(s.doctor_id) === Number(form.doctor_id))
                  .map((s) => (
                    <li key={s.schedule_id} className="list-group-item">
                      {s.schedule_date} — {s.start_time} to {s.end_time}
                    </li>
                  ))}
                {schedules.filter(
                  (s) => Number(s.doctor_id) === Number(form.doctor_id)
                ).length === 0 && (
                  <li className="list-group-item">
                    No schedules available. Choose a date/time or contact
                    reception.
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Nurse ID (optional)</label>
            <input
              name="nurse_id"
              className="form-control"
              value={form.nurse_id}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Reservation Time</label>
            <DatePicker
              selected={form.reservation_time}
              onChange={(date) =>
                setForm((f) => ({ ...f, reservation_time: date }))
              }
              showTimeSelect
              timeIntervals={15}
              dateFormat="Pp"
              className="form-control"
              placeholderText="Pick date and time"
              required
            />
          </div>

          <div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Request Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientBooking;

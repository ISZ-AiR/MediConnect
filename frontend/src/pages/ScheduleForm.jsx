import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";

const ScheduleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    doctor_id: "",
    schedule_date: "",
    start_time: "",
    end_time: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await resourceService.getSchedule(id);
        if (data) {
          setForm({
            doctor_id: data.doctor_id || "",
            schedule_date: data.schedule_date || "",
            start_time: data.start_time || "",
            end_time: data.end_time || "",
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const payload = {
        doctor_id: Number(form.doctor_id),
        schedule_date: form.schedule_date,
        start_time: form.start_time,
        end_time: form.end_time,
      };

      if (id) {
        await resourceService.updateSchedule(id, payload);
      } else {
        await resourceService.createSchedule(payload);
      }

      navigate("/admin/schedules");
    } catch (err) {
      console.error(err);
      setError("Failed to save schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">{id ? "Edit Schedule" : "Create Schedule"}</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Doctor ID</label>
            <input
              type="number"
              className="form-control"
              name="doctor_id"
              value={form.doctor_id}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              name="schedule_date"
              value={form.schedule_date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Start Time</label>
            <input
              type="time"
              className="form-control"
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">End Time</label>
            <input
              type="time"
              className="form-control"
              name="end_time"
              value={form.end_time}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="btn btn-link ms-2"
            onClick={() => navigate("/admin/schedules")}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleForm;

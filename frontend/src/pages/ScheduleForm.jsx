import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";
import { Typeahead } from "react-bootstrap-typeahead";

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
  const [success, setSuccess] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setLoading(true);
        const [sched, doctorsResp, usersResp] = await Promise.all([
          id ? resourceService.getSchedule(id) : Promise.resolve(null),
          resourceService.listDoctors(),
          apiRequest("/users"),
        ]);

        setDoctors(doctorsResp || []);
        setUsers(usersResp?.data || []);

        if (sched) {
          setForm({
            doctor_id: sched.doctor_id || "",
            schedule_date: sched.schedule_date || "",
            start_time: sched.start_time || "",
            end_time: sched.end_time || "",
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadSchedule();
  }, [id]);

  // Helper function for role-based navigation
  const getSchedulePath = (path) => {
    const rolePrefix = userRole === "admin" ? "/admin" : "/receptionist";
    return `${rolePrefix}${path}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");
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
        setSuccess("Schedule updated successfully!");
      } else {
        await resourceService.createSchedule(payload);
        setSuccess("Schedule created successfully!");
        setForm({
          doctor_id: "",
          schedule_date: "",
          start_time: "",
          end_time: "",
        });
      }
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
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="card shadow-sm border-0 mt-3">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <i
                    className="bi bi-calendar2-check-fill text-primary"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h2 className="fw-bold mt-3 mb-2">
                    {id ? "Edit Schedule" : "Create Schedule"}
                  </h2>
                  <p className="text-muted">
                    {id
                      ? "Update doctor's schedule information"
                      : "Add a new schedule for a doctor"}
                  </p>
                </div>

                {/* Alerts */}
                {error && (
                  <div
                    className="alert alert-danger border-0 d-flex align-items-center"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                    <div>{error}</div>
                  </div>
                )}
                {success && (
                  <div
                    className="alert alert-success border-0 d-flex align-items-center"
                    role="alert"
                  >
                    <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                    <div>{success}</div>
                  </div>
                )}
                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <div className="bg-light border rounded p-4 mb-4">
                    {/* Doctor */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-secondary small mb-2 d-block">
                        <i className="bi bi-person-badge me-1"></i>
                        Doctor *
                      </label>
                      <Typeahead
                        id="doctor"
                        labelKey={(d) => {
                          const u = users.find((u) => u.user_id === d.user_id);
                          return u
                            ? `${u.first_name} ${u.last_name}`
                            : `Doctor ${d.doctor_id}`;
                        }}
                        options={doctors}
                        selected={
                          form.doctor_id
                            ? doctors.filter(
                                (d) => d.doctor_id === Number(form.doctor_id)
                              )
                            : []
                        }
                        onChange={(selected) =>
                          setForm((prev) => ({
                            ...prev,
                            doctor_id: selected[0]?.doctor_id || "",
                          }))
                        }
                        placeholder="Select or type doctor name..."
                        allowNew={false}
                      />
                    </div>

                    {/* Date */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-secondary small mb-2 d-block">
                        <i className="bi bi-calendar-event me-1"></i>
                        Schedule Date *
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="schedule_date"
                        value={form.schedule_date}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="row g-3">
                      {/* Start Time */}
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary small mb-2 d-block">
                          <i className="bi bi-clock me-1"></i>
                          Start Time *
                        </label>
                        <input
                          type="time"
                          className="form-control"
                          name="start_time"
                          value={form.start_time}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* End Time */}
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary small mb-2 d-block">
                          <i className="bi bi-clock-fill me-1"></i>
                          End Time *
                        </label>
                        <input
                          type="time"
                          className="form-control"
                          name="end_time"
                          value={form.end_time}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        All fields marked with * are required
                      </small>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(getSchedulePath("/schedules"))}
                      disabled={loading}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          {id ? "Update Schedule" : "Create Schedule"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleForm;

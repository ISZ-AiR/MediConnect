import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";

const ScheduleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [scheduleResp, usersResp, doctorsResp] = await Promise.all([
          resourceService.getSchedule(id),
          apiRequest("/users"),
          apiRequest("/doctor"),
        ]);
        setItem(scheduleResp || null);
        setUsers(usersResp?.data || []);
        setDoctors(doctorsResp?.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load schedule data");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id]);

  const getDoctorLabel = (doctor_id) => {
    const d = doctors.find((doc) => doc.doctor_id === doctor_id);
    if (!d) return doctor_id;
    const u = users.find((u) => u.user_id === d.user_id);
    return u
      ? `${d.doctor_id} - ${u.first_name} ${u.last_name}`
      : `Doctor ${d.doctor_id}`;
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await resourceService.deleteSchedule(id);
      navigate("/receptionist/schedules");
    } catch (err) {
      console.error(err);
      alert("Failed to delete schedule");
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <i
                    className="bi bi-calendar-event text-primary"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h2 className="fw-bold mt-3 mb-2">Schedule Details</h2>
                  <p className="text-muted">Information about the schedule</p>
                </div>

                {/* Alerts */}
                {error && (
                  <div
                    className="alert alert-danger d-flex align-items-center"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{error}</div>
                  </div>
                )}

                {/* Loading */}
                {loading && (
                  <div className="text-center">
                    <div
                      className="spinner-border text-primary"
                      role="status"
                    />
                  </div>
                )}

                {/* Details */}
                {!loading && !error && item && (
                  <div className="mb-4">
                    <p>
                      <strong>Schedule ID:</strong> {item.schedule_id}
                    </p>
                    <p>
                      <strong>Doctor:</strong> {getDoctorLabel(item.doctor_id)}
                    </p>
                    <p>
                      <strong>Date:</strong> {item.schedule_date}
                    </p>
                    <p>
                      <strong>Start Time:</strong> {item.start_time}
                    </p>
                    <p>
                      <strong>End Time:</strong> {item.end_time}
                    </p>
                  </div>
                )}

                {/* Buttons */}
                {!loading && !error && item && (
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() =>
                        navigate(
                          `/receptionist/schedules/edit/${item.schedule_id}`
                        )
                      }
                    >
                      <i className="bi bi-pencil me-2"></i>Edit Schedule
                    </button>
                    <button
                      className="btn btn-danger btn-lg"
                      onClick={handleDelete}
                    >
                      <i className="bi bi-trash me-2"></i>Delete Schedule
                    </button>
                    <button
                      className="btn btn-link btn-lg mt-2"
                      onClick={() => navigate("/receptionist/schedules")}
                    >
                      Back to list
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetail;

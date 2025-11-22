import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typeahead } from "react-bootstrap-typeahead";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";

const SchedulesList = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchDoctor, setSearchDoctor] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [schedulesResp, usersResp, doctorsResp] = await Promise.all([
          resourceService.listSchedules(),
          apiRequest("/users"),
          apiRequest("/doctor"),
        ]);
        setSchedules(schedulesResp || []);
        setUsers(usersResp?.data || []);
        setDoctors(doctorsResp?.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load schedules");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getDoctorLabel = (doctor_id) => {
    const d = doctors.find((doc) => doc.doctor_id === doctor_id);
    if (!d) return `Doctor ${doctor_id}`;
    const u = users.find((u) => u.user_id === d.user_id);
    return u ? `${u.first_name} ${u.last_name}` : `Doctor ${doctor_id}`;
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      const resp = await apiRequest(`/schedules/${scheduleId}`, { method: "DELETE" });
      if (resp?.success === true || resp?.status === "Schedule deleted successfully") {
        setSchedules((prev) => prev.filter((s) => s.schedule_id !== scheduleId));
      } else {
        setSchedules((await resourceService.listSchedules()) || []);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete schedule");
    }
  };

  // Filtracja po dacie i doktorze
  const filteredSchedules = schedules.filter((s) => {
    const scheduleDate = new Date(s.schedule_date);
    let matchDate = true;
    if (startDate) matchDate = scheduleDate >= startDate;
    if (matchDate && endDate) matchDate = scheduleDate <= endDate;

    let matchDoctor = true;
    if (searchDoctor && searchDoctor.length > 0) {
      matchDoctor = s.doctor_id === searchDoctor[0]?.doctor_id;
    }

    return matchDate && matchDoctor;
  });

  const pageSize = 20;
  const paginatedSchedules = filteredSchedules.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Grupowanie po dacie
  const groupedSchedules = paginatedSchedules.reduce((acc, s) => {
    acc[s.schedule_date] = acc[s.schedule_date] || [];
    acc[s.schedule_date].push(s);
    return acc;
  }, {});

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-9">
            <div className="card shadow-sm border-0 mt-3">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <i className="bi bi-calendar2-check-fill text-primary" style={{fontSize: "3rem"}}></i>
                  <h2 className="fw-bold mt-3 mb-2">Schedules</h2>
                  <p className="text-muted">Manage doctor schedules</p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <div>{error}</div>
                    </div>
                )}

                {/* Create Button */}
                <div className="mb-4">
                  <button
                      className="btn btn-primary w-100"
                      onClick={() => navigate("/admin/schedules/create")}
                  >
                    <i className="bi bi-plus-circle me-2"></i> Create Schedule
                  </button>
                </div>

                {/* Filters */}
                {/* Start Date */}
                <div className="mb-3 d-flex align-items-center">
                  <i className="bi bi-calendar2-event fs-4 me-2 text-primary"></i>
                  <div className="w-100 d-flex flex-column">
                    <label className="form-label fw-bold mb-1">Start Date</label>
                    <DatePicker
                        className="form-control border-secondary w-100"
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        placeholderText="Select start date"
                        dateFormat="yyyy-MM-dd"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div className="mb-3 d-flex align-items-center">
                  <i className="bi bi-calendar2-event fs-4 me-2 text-primary"></i>
                  <div className="w-100 d-flex flex-column">
                    <label className="form-label fw-bold mb-1">End Date</label>
                    <DatePicker
                        className="form-control border-secondary w-100"
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        placeholderText="Select end date"
                        dateFormat="yyyy-MM-dd"
                    />
                  </div>
                </div>

                {/* Doctor */}
                <div className="mb-3 d-flex align-items-center">
                  <i className="bi bi-person-badge fs-4 me-2 text-primary"></i>
                  <div className="w-100 d-flex flex-column">
                    <label className="form-label fw-bold mb-1">Doctor</label>
                    <Typeahead
                        id="doctor-filter"
                        labelKey={(d) => {
                          const u = users.find((u) => u.user_id === d.user_id);
                          return u ? `${u.first_name} ${u.last_name}` : `Doctor ${d.doctor_id}`;
                        }}
                        options={doctors}
                        selected={searchDoctor || []}
                        onChange={setSearchDoctor}
                        placeholder="Select or type doctor"
                        allowNew={false}
                        className="w-100"
                    />
                  </div>
                </div>

                <div className="mb-4 border-bottom"></div>


                {/* Loading */}
                {loading && (
                    <div className="d-flex justify-content-center my-4">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                )}

                {/* Grouped schedules */}
                {!loading &&
                    Object.keys(groupedSchedules)
                        .sort()
                        .map((date) => (
                            <div key={date} className="mb-4">
                              <h5 className="fw-semibold mb-3">
                                <i className="bi bi-calendar-event me-2"></i>
                                {date}
                              </h5>
                              {groupedSchedules[date].map((s) => (
                                  <div key={s.schedule_id} className="card mb-2 shadow-sm">
                                    <div className="card-body d-flex justify-content-between align-items-center p-3">
                                      <div>
                                        <strong>Doctor:</strong> {getDoctorLabel(s.doctor_id)} <br/>
                                        <strong>Start:</strong> {s.start_time} || <strong>End:</strong> {s.end_time}
                                      </div>
                                      <div className="btn-group">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => navigate(`/admin/schedules/${s.schedule_id}`)}
                                        >
                                          <i className="bi bi-eye me-1"></i> View
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => navigate(`/admin/schedules/edit/${s.schedule_id}`)}
                                        >
                                          <i className="bi bi-pencil me-1"></i> Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(s.schedule_id)}
                                        >
                                          <i className="bi bi-trash me-1"></i> Delete
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                              ))}
                            </div>
                        ))}

                {!loading && filteredSchedules.length === 0 && (
                    <div className="alert alert-info text-center mt-4">
                      No schedules found.
                    </div>
                )}
              </div>


              <div className="d-flex justify-content-between align-items-center mt-3 px-3 mb-4">
                <button
                    className="btn btn-outline-secondary"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <span>Page {page}</span>
                <button
                    className="btn btn-outline-secondary"
                    disabled={page * pageSize >= filteredSchedules.length}
                    onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  )
      ;
};

export default SchedulesList;

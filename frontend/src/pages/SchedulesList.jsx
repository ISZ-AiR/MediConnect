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

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;
  console.log("User role:", userRole);

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

  // Helper function for role-based navigation
  const getSchedulePath = (path) => {
    const rolePrefix = userRole === "admin" ? "/admin" : "/receptionist";
    return `${rolePrefix}${path}`;
  };

  const handleCreateSchedule = () => {
    navigate(getSchedulePath("/schedules/create"));
  };

  const getDoctorLabel = (doctor_id) => {
    const d = doctors.find((doc) => doc.doctor_id === doctor_id);
    if (!d) return `Doctor ${doctor_id}`;
    const u = users.find((u) => u.user_id === d.user_id);
    return u ? `${u.first_name} ${u.last_name}` : `Doctor ${doctor_id}`;
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      const resp = await apiRequest(`/schedules/${scheduleId}`, {
        method: "DELETE",
      });
      if (
        resp?.success === true ||
        resp?.status === "Schedule deleted successfully"
      ) {
        setSchedules((prev) =>
          prev.filter((s) => s.schedule_id !== scheduleId)
        );
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
                  <i
                    className="bi bi-calendar2-check-fill text-primary"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h2 className="fw-bold mt-3 mb-2">Schedules</h2>
                  <p className="text-muted">Manage doctor schedules</p>
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

                {/* Create Button */}
                <div className="mb-4">
                  <button
                    className="btn btn-primary w-100 py-2"
                    onClick={handleCreateSchedule}
                  >
                    <i className="bi bi-plus-circle me-2"></i> Create New
                    Schedule
                  </button>
                </div>

                {/* Filters Section */}
                <div className="bg-light border rounded p-4 mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-funnel-fill text-primary me-2 fs-5"></i>
                    <h5 className="fw-bold mb-0">Filter Schedules</h5>
                    {(startDate ||
                      endDate ||
                      (searchDoctor && searchDoctor.length > 0)) && (
                      <button
                        className="btn btn-sm btn-outline-secondary ms-auto"
                        onClick={() => {
                          setStartDate(null);
                          setEndDate(null);
                          setSearchDoctor(null);
                        }}
                      >
                        <i className="bi bi-x-circle me-1"></i> Clear Filters
                      </button>
                    )}
                  </div>

                  <div className="row g-3">
                    {/* Start Date */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-secondary small mb-2 d-block">
                        <i className="bi bi-calendar2-event me-1"></i>
                        Start Date
                      </label>
                      <DatePicker
                        className="form-control"
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        placeholderText="Filter from date..."
                        dateFormat="dd-MM-yyyy"
                        isClearable
                      />
                    </div>

                    {/* End Date */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-secondary small mb-2 d-block">
                        <i className="bi bi-calendar2-event me-1"></i>
                        End Date
                      </label>
                      <DatePicker
                        className="form-control"
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        placeholderText="Filter to date..."
                        dateFormat="dd-MM-yyyy"
                        isClearable
                      />
                    </div>

                    {/* Doctor */}
                    <div className="col-12">
                      <label className="form-label fw-semibold text-secondary small">
                        <i className="bi bi-person-badge me-1"></i>
                        Doctor
                      </label>
                      <Typeahead
                        id="doctor-filter"
                        labelKey={(d) => {
                          const u = users.find((u) => u.user_id === d.user_id);
                          return u
                            ? `${u.first_name} ${u.last_name}`
                            : `Doctor ${d.doctor_id}`;
                        }}
                        options={doctors}
                        selected={searchDoctor || []}
                        onChange={setSearchDoctor}
                        placeholder="Filter by doctor..."
                        allowNew={false}
                        clearButton
                      />
                    </div>
                  </div>

                  {/* Results count */}
                  <div className="mt-3 pt-3 border-top">
                    <span className="text-muted small">
                      <i className="bi bi-search me-1"></i>
                      Showing <strong>
                        {filteredSchedules.length}
                      </strong> of <strong>{schedules.length}</strong> schedules
                    </span>
                  </div>
                </div>

                {/* Loading */}
                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-warning"></div>
                  </div>
                )}

                {/* Grouped schedules */}
                {!loading &&
                  Object.keys(groupedSchedules)
                    .sort((a, b) => a.localeCompare(b))
                    .map((date) => (
                      <div key={date} className="mb-4">
                        <div className="d-flex align-items-center mb-3 bg-primary bg-opacity-10 p-2 rounded">
                          <i className="bi bi-calendar-event text-primary me-2 fs-5"></i>
                          <h5 className="fw-semibold mb-0 text-white">
                            {new Date(date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </h5>
                          <span className="badge bg-primary ms-auto">
                            {groupedSchedules[date].length} schedule
                            {groupedSchedules[date].length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        {groupedSchedules[date].map((s) => (
                          <div
                            key={s.schedule_id}
                            className="card mb-2 shadow-sm border-start border-4 border-primary"
                          >
                            <div className="card-body p-3">
                              <div className="row align-items-center">
                                <div className="col-md-8">
                                  <div className="d-flex align-items-center mb-2">
                                    <i className="bi bi-person-badge text-primary me-2 fs-5"></i>
                                    <span className="fw-bold fs-6">
                                      {getDoctorLabel(s.doctor_id)}
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center text-muted small">
                                    <i className="bi bi-clock me-2"></i>
                                    <span>
                                      <strong className="text-dark">
                                        {s.start_time}
                                      </strong>
                                      <i className="bi bi-arrow-right mx-2"></i>
                                      <strong className="text-dark">
                                        {s.end_time}
                                      </strong>
                                    </span>
                                  </div>
                                </div>
                                <div className="col-md-4 text-md-end mt-2 mt-md-0">
                                  <div className="btn-group" role="group">
                                    <button
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() =>
                                        navigate(
                                          getSchedulePath(
                                            `/schedules/${s.schedule_id}`
                                          )
                                        )
                                      }
                                      title="View Details"
                                    >
                                      <i className="bi bi-eye"></i>
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() =>
                                        navigate(
                                          getSchedulePath(
                                            `/schedules/edit/${s.schedule_id}`
                                          )
                                        )
                                      }
                                      title="Edit Schedule"
                                    >
                                      <i className="bi bi-pencil"></i>
                                    </button>
                                    {userRole === "admin" && (
                                      <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() =>
                                          handleDelete(s.schedule_id)
                                        }
                                        title="Delete Schedule"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}

                {!loading && filteredSchedules.length === 0 && (
                  <div className="alert alert-info border-0 d-flex align-items-center mt-4">
                    <i className="bi bi-info-circle-fill me-2 fs-4"></i>
                    <div>
                      <strong>No schedules found.</strong>
                      {startDate ||
                      endDate ||
                      (searchDoctor && searchDoctor.length > 0) ? (
                        <p className="mb-0 mt-1 small">
                          Try adjusting your filters or clear them to see all
                          schedules.
                        </p>
                      ) : (
                        <p className="mb-0 mt-1 small">
                          Create your first schedule to get started.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {filteredSchedules.length > pageSize && (
                <div className="d-flex justify-content-between align-items-center mt-4 px-3 mb-4 pt-3 border-top">
                  <button
                    className="btn btn-outline-primary"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <i className="bi bi-chevron-left me-1"></i>
                    Previous
                  </button>
                  <div className="text-muted">
                    <span className="fw-semibold text-dark">Page {page}</span>{" "}
                    of {Math.ceil(filteredSchedules.length / pageSize)}
                  </div>
                  <button
                    className="btn btn-outline-primary"
                    disabled={page * pageSize >= filteredSchedules.length}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                    <i className="bi bi-chevron-right ms-1"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulesList;

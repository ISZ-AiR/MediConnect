import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/apiClient";

const AppointmentsIndex = () => {
  const { isAuthenticated, user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [visits, setVisits] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "patient") {
      setLoading(false);
      return;
    }

    const loadAppointments = async () => {
      try {
        setLoading(true);
        const [reservationsRes, visitsRes, doctorsRes, nursesRes, usersRes] =
          await Promise.all([
            apiRequest("/reservation/me"),
            apiRequest("/visits/me"),
            apiRequest("/doctor"),
            apiRequest("/nurse"),
            apiRequest("/users"),
          ]);

        setReservations(reservationsRes.data || []);
        setVisits(visitsRes.data || []);
        setDoctors(doctorsRes.data || []);
        setNurses(nursesRes.data || []);
        setUsers(usersRes.data || []);
      } catch (err) {
        console.error("Failed to load appointments", err);
        setError("Failed to load your appointments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [isAuthenticated, user]);

  const getUserName = (user_id) => {
    const user = users.find((u) => u.user_id === user_id);
    return user ? `${user.first_name} ${user.last_name}` : "N/A";
  };

  const getDoctorName = (doctor_id) => {
    const doctor = doctors.find((d) => d.doctor_id === doctor_id);
    if (!doctor) return "N/A";
    return getUserName(doctor.user_id);
  };

  const getNurseName = (nurse_id) => {
    const nurse = nurses.find((n) => n.nurse_id === nurse_id);
    if (!nurse) return "N/A";
    return getUserName(nurse.user_id);
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A";
    const date = new Date(dateTimeStr);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (reservationTime) => {
    const now = new Date();
    const resDate = new Date(reservationTime);

    if (resDate > now) {
      return <span className="badge bg-success">Upcoming</span>;
    } else {
      return <span className="badge bg-secondary">Past</span>;
    }
  };

  const upcomingReservations = reservations
    .filter((r) => new Date(r.reservation_time) > new Date())
    .sort(
      (a, b) => new Date(a.reservation_time) - new Date(b.reservation_time)
    );

  const pastReservations = reservations
    .filter((r) => new Date(r.reservation_time) <= new Date())
    .sort(
      (a, b) => new Date(b.reservation_time) - new Date(a.reservation_time)
    );

  const visitReservationIds = new Set(visits.map((v) => v.reservation_id));
  const completedVisits = visits.sort(
    (a, b) => new Date(b.visit_date) - new Date(a.visit_date)
  );

  if (!isAuthenticated || user?.role !== "patient") {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-5">
          <h1 className="display-6">Appointments</h1>
          <p className="text-muted">Book, view or manage appointments.</p>

          <div className="row g-3 mt-3">
            <div className="col-md-4">
              <Link to="/appointments/book" className="btn btn-primary w-100">
                Book Appointment
              </Link>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="alert alert-info mt-4">
              <i className="bi bi-info-circle me-2"></i>
              Please <Link to="/login">log in</Link> to view your appointments.
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning"></div>
      </div>
    );

  if (error) return <div className="alert alert-danger">{error}</div>;

return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">

        {/* Main Application Tile - Now including Header */}
        <div className="card shadow-sm border-0 p-4 p-md-5 bg-white mb-5">

          {/* Header section moved inside the tile */}
          <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-4">
            <div>
              <h1 className="display-6 fw-bold mb-1">My Appointments</h1>
              <p className="text-muted mb-0">Manage your medical schedule in one place</p>
            </div>
            <Link to="/appointments/book" className="btn btn-primary px-4 shadow-sm">
              <i className="bi bi-plus-circle me-2"></i>
              Book New Appointment
            </Link>
          </div>

          {/* Internal Statistics Grid */}
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="p-3 rounded-3 text-center border bg-light">
                <i className="bi bi-calendar-event text-primary fs-2 mb-2"></i>
                <h4 className="fw-bold mb-0">{upcomingReservations.length}</h4>
                <small className="text-muted text-uppercase fw-semibold">Upcoming</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 rounded-3 text-center border bg-light">
                <i className="bi bi-check-circle text-success fs-2 mb-2"></i>
                <h4 className="fw-bold mb-0">{completedVisits.length}</h4>
                <small className="text-muted text-uppercase fw-semibold">Completed</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 rounded-3 text-center border bg-light">
                <i className="bi bi-archive text-secondary fs-2 mb-2"></i>
                <h4 className="fw-bold mb-0">{pastReservations.length}</h4>
                <small className="text-muted text-uppercase fw-semibold">History</small>
              </div>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="d-flex justify-content-center mb-4">
            <ul className="nav nav-pills bg-light p-1 rounded-pill border">
              <li className="nav-item">
                <button
                  className={`nav-link rounded-pill px-4 ${activeTab === "upcoming" ? "active" : ""}`}
                  onClick={() => setActiveTab("upcoming")}
                >
                  Upcoming
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link rounded-pill px-4 ${activeTab === "visits" ? "active" : ""}`}
                  onClick={() => setActiveTab("visits")}
                >
                  Visits
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link rounded-pill px-4 ${activeTab === "past" ? "active" : ""}`}
                  onClick={() => setActiveTab("past")}
                >
                  History
                </button>
              </li>
            </ul>
          </div>

          {/* List Content */}
          <div className="mt-4">
            {activeTab === "upcoming" && (
              <div className="list-group list-group-flush">
                {upcomingReservations.length === 0 ? (
                  <div className="text-center py-5 border rounded bg-light">
                    <i className="bi bi-calendar-x text-muted fs-1 mb-2"></i>
                    <p className="text-muted mb-0">No upcoming appointments found.</p>
                  </div>
                ) : (
                  upcomingReservations.map((res) => (
                    <div key={res.reservation_id} className="list-group-item px-0 py-4 border-bottom bg-transparent">
                      <div className="row align-items-center">
                        <div className="col-md-3">
                          <h6 className="mb-0 fw-bold">{formatDate(res.reservation_time)}</h6>
                          <small className="text-muted">{new Date(res.reservation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                        </div>
                        <div className="col-md-4">
                          <small className="text-muted d-block">Doctor</small>
                          <span className="fw-semibold text-dark">{getDoctorName(res.doctor_id)}</span>
                        </div>
                        <div className="col-md-2">
                          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3">Upcoming</span>
                        </div>
                        <div className="col-md-3 text-end">
                          <Link to={`/reservation/${res.reservation_id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "visits" && (
              <div className="list-group list-group-flush">
                {completedVisits.length === 0 ? (
                  <div className="text-center py-5 border rounded bg-light">
                    <i className="bi bi-clipboard-x text-muted fs-1 mb-2"></i>
                    <p className="text-muted mb-0">No completed visits found.</p>
                  </div>
                ) : (
                  completedVisits.map((visit) => {
                    const res = reservations.find(r => r.reservation_id === visit.reservation_id);
                    return (
                      <div key={visit.visit_id} className="list-group-item px-0 py-4 border-bottom bg-transparent">
                        <div className="row align-items-center">
                          <div className="col-md-3">
                            <h6 className="mb-0 fw-bold">{formatDate(visit.visit_date)}</h6>
                            <small className="text-muted">ID: {visit.visit_id}</small>
                          </div>
                          <div className="col-md-3 text-dark fw-semibold">
                            {res ? getDoctorName(res.doctor_id) : "N/A"}
                          </div>
                          <div className="col-md-3">
                            <small className="text-muted d-block">Nurse</small>
                            <span className="text-dark">{getNurseName(visit.nurse_id)}</span>
                          </div>
                          <div className="col-md-3 text-end">
                            <Link to={`/patient/records/${visit.visit_id}`} className="btn btn-sm btn-outline-success rounded-pill px-3">
                              Medical Record
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === "past" && (
              <div className="list-group list-group-flush">
                {pastReservations.length === 0 ? (
                  <div className="text-center py-5 border rounded bg-light">
                    <i className="bi bi-archive text-muted fs-1 mb-2"></i>
                    <p className="text-muted mb-0">Your history is empty.</p>
                  </div>
                ) : (
                  pastReservations.map((res) => {
                    const hasVisit = visitReservationIds.has(res.reservation_id);
                    return (
                      <div key={res.reservation_id} className="list-group-item px-0 py-4 border-bottom bg-transparent">
                        <div className="row align-items-center">
                          <div className="col-md-3 text-muted">
                            {formatDate(res.reservation_time)}
                          </div>
                          <div className="col-md-4 fw-semibold text-dark">
                            {getDoctorName(res.doctor_id)}
                          </div>
                          <div className="col-md-3">
                            {hasVisit ?
                              <span className="badge bg-light text-success border border-success-subtle">Completed</span> :
                              <span className="badge bg-light text-secondary border">Expired</span>
                            }
                          </div>
                          <div className="col-md-2 text-end">
                            <Link to={`/reservation/${res.reservation_id}`} className="btn btn-sm btn-link text-decoration-none">
                              Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsIndex;

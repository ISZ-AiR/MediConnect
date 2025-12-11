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

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 mb-2">My Appointments</h1>
            <p className="text-muted">
              View and manage your appointments and medical visits
            </p>
          </div>
          <Link to="/appointments/book" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Book New Appointment
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <i className="bi bi-calendar-event text-primary fs-1 mb-2"></i>
                <h3 className="mb-0">{upcomingReservations.length}</h3>
                <p className="text-muted mb-0">Upcoming Appointments</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <i className="bi bi-check-circle text-success fs-1 mb-2"></i>
                <h3 className="mb-0">{completedVisits.length}</h3>
                <p className="text-muted mb-0">Completed Visits</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <i className="bi bi-calendar-x text-secondary fs-1 mb-2"></i>
                <h3 className="mb-0">{pastReservations.length}</h3>
                <p className="text-muted mb-0">Past Reservations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "upcoming" ? "active" : ""}`}
              onClick={() => setActiveTab("upcoming")}
            >
              <i className="bi bi-calendar-event me-2"></i>
              Upcoming ({upcomingReservations.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "visits" ? "active" : ""}`}
              onClick={() => setActiveTab("visits")}
            >
              <i className="bi bi-clipboard-check me-2"></i>
              Completed Visits ({completedVisits.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "past" ? "active" : ""}`}
              onClick={() => setActiveTab("past")}
            >
              <i className="bi bi-archive me-2"></i>
              Past Reservations ({pastReservations.length})
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        {activeTab === "upcoming" && (
          <div>
            {upcomingReservations.length === 0 ? (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-calendar-x text-muted fs-1 mb-3"></i>
                  <h5 className="text-muted">No upcoming appointments</h5>
                  <p className="text-muted">
                    Book your next appointment to see it here.
                  </p>
                  <Link
                    to="/appointments/book"
                    className="btn btn-primary mt-2"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            ) : (
              <div className="row g-3">
                {upcomingReservations.map((reservation) => (
                  <div key={reservation.reservation_id} className="col-12">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-md-3">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-calendar-event text-primary fs-3 me-3"></i>
                              <div>
                                <h6 className="mb-0">
                                  {formatDate(reservation.reservation_time)}
                                </h6>
                                <small className="text-muted">
                                  {new Date(
                                    reservation.reservation_time
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </small>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div>
                              <small className="text-muted d-block">
                                Doctor
                              </small>
                              <strong>
                                {getDoctorName(reservation.doctor_id)}
                              </strong>
                            </div>
                          </div>
                          <div className="col-md-3">
                            {getStatusBadge(reservation.reservation_time)}
                          </div>
                          <div className="col-md-2 text-end">
                            <Link
                              to={`/reservation/${reservation.reservation_id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "visits" && (
          <div>
            {completedVisits.length === 0 ? (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-clipboard-x text-muted fs-1 mb-3"></i>
                  <h5 className="text-muted">No completed visits yet</h5>
                  <p className="text-muted">
                    Your completed medical visits will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="row g-3">
                {completedVisits.map((visit) => {
                  const reservation = reservations.find(
                    (r) => r.reservation_id === visit.reservation_id
                  );
                  return (
                    <div key={visit.visit_id} className="col-12">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body">
                          <div className="row align-items-center">
                            <div className="col-md-3">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-clipboard-check text-success fs-3 me-3"></i>
                                <div>
                                  <h6 className="mb-0">
                                    {formatDate(visit.visit_date)}
                                  </h6>
                                  <small className="text-muted">
                                    Visit ID: {visit.visit_id}
                                  </small>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div>
                                <small className="text-muted d-block">
                                  Doctor
                                </small>
                                <strong>
                                  {reservation
                                    ? getDoctorName(reservation.doctor_id)
                                    : "N/A"}
                                </strong>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div>
                                <small className="text-muted d-block">
                                  Nurse
                                </small>
                                <strong>{getNurseName(visit.nurse_id)}</strong>
                              </div>
                            </div>
                            <div className="col-md-3 text-end">
                              <Link
                                to={`/patient/records/${visit.visit_id}`}
                                className="btn btn-sm btn-outline-success"
                              >
                                View Medical Record
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "past" && (
          <div>
            {pastReservations.length === 0 ? (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-archive text-muted fs-1 mb-3"></i>
                  <h5 className="text-muted">No past reservations</h5>
                  <p className="text-muted">
                    Your appointment history will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="row g-3">
                {pastReservations.map((reservation) => {
                  const hasVisit = visitReservationIds.has(
                    reservation.reservation_id
                  );
                  return (
                    <div key={reservation.reservation_id} className="col-12">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body">
                          <div className="row align-items-center">
                            <div className="col-md-3">
                              <div className="d-flex align-items-center">
                                <i
                                  className={`bi ${
                                    hasVisit
                                      ? "bi-check-circle-fill text-success"
                                      : "bi-calendar-x text-secondary"
                                  } fs-3 me-3`}
                                ></i>
                                <div>
                                  <h6 className="mb-0">
                                    {formatDate(reservation.reservation_time)}
                                  </h6>
                                  <small className="text-muted">
                                    {new Date(
                                      reservation.reservation_time
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </small>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div>
                                <small className="text-muted d-block">
                                  Doctor
                                </small>
                                <strong>
                                  {getDoctorName(reservation.doctor_id)}
                                </strong>
                              </div>
                            </div>
                            <div className="col-md-3">
                              {hasVisit ? (
                                <span className="badge bg-success">
                                  <i className="bi bi-check-circle me-1"></i>
                                  Visit Completed
                                </span>
                              ) : (
                                <span className="badge bg-secondary">Past</span>
                              )}
                            </div>
                            <div className="col-md-2 text-end">
                              <Link
                                to={`/reservation/${reservation.reservation_id}`}
                                className="btn btn-sm btn-outline-secondary"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsIndex;

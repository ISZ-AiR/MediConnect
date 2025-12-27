import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/apiClient";

const PatientDashboard = () => {
  const {user} = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const data = await apiRequest("/patients/me", {method: "GET"});
        setPatient(data.data);
        console.log("Patient/me response:", data);
      } catch (err) {
        console.error("Failed to load patient", err);
      }
    };
    loadPatient();
  }, []);

  useEffect(() => {
    if (!patient) return;

    const fetchAppointments = async () => {
      try {
        const res = await apiRequest(`/reservation/me`);
        if (res.success) {
          const upcoming = res.data
              .filter((a) => new Date(a.reservation_time) > new Date())
              .sort(
                  (a, b) =>
                      new Date(a.reservation_time) - new Date(b.reservation_time)
              )
              .slice(0, 3);
          setAppointments(upcoming);
        }
      } catch (err) {
        console.error("Failed to fetch appointments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [patient]);

  return (
    <div className="min-vh-100">
      <Navbar />

      <div className="container py-5">
        {/* OSOBNY KAFELEK NAGŁÓWKOWY */}
        <div className="card shadow-sm border-0 p-4 mb-4 bg-white bg-opacity-10">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-6 fw-bold mb-1">Patient Dashboard</h1>
              <p className="opacity-75 mb-0">Welcome back, {user?.email}</p>
            </div>
            <div className="text-end">
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-4 py-2 rounded-pill shadow-sm fs-6">
                <i className="bi bi-person-circle me-2"></i>
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS GRID */}
        <div className="row g-4 mb-4">
          {[
            { title: "Book Appointment", icon: "bi-calendar-plus", color: "text-primary", btn: "btn-primary", link: "/appointments/book", desc: "Schedule a new visit" },
            { title: "Medical Records", icon: "bi-file-medical", color: "text-success", btn: "btn-success", link: "/patient/records", desc: "View history" },
            { title: "Prescriptions", icon: "bi-prescription2", color: "text-info", btn: "btn-info", link: "/patient/prescriptions", desc: "Manage scripts" },
            { title: "Messages", icon: "bi-chat-dots", color: "text-warning", btn: "btn-warning", link: "/messages", desc: "Contact team" }
          ].map((item, idx) => (
            <div className="col-md-3" key={idx}>
              <div className="card border-0 bg-white bg-opacity-10 shadow-sm h-100 hover-shadow transition-all border border-white border-opacity-10">
                <div className="card-body text-center p-4">
                  <i className={`bi ${item.icon} ${item.color} fs-1 mb-3 d-block`}></i>
                  <h5 className="fw-bold mb-2">{item.title}</h5>
                  <p className="opacity-75 small mb-3">{item.desc}</p>
                  <Link to={item.link} className={`btn ${item.btn} btn-sm rounded-pill px-4 shadow-sm`}>
                    Open
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DOLNA SEKCJA Z LISTAMI */}
        <div className="row">
          {/* Upcoming Appointments */}
          <div className="col-lg-8">
            <div className="card border-0 bg-white bg-opacity-10 mb-4 shadow-sm h-100">
              <div className="card-header bg-transparent py-3 border-bottom border-opacity-10">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-calendar-check me-2 text-primary"></i>
                  Upcoming Appointments
                </h5>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-5 opacity-50">
                    <i className="bi bi-calendar-x fs-1 mb-3 d-block"></i>
                    <p>No upcoming appointments found</p>
                    <Link to="/appointments/book" className="btn btn-sm btn-outline-primary rounded-pill px-4">
                      Schedule Now
                    </Link>
                  </div>
                ) : (
                  <div className="list-group list-group-flush bg-transparent">
                    {appointments.map((a) => (
                      <div key={a.reservation_id} className="list-group-item bg-transparent border-opacity-10 d-flex justify-content-between align-items-center px-0 py-3">
                        <div>
                          <div className="fw-bold fs-6">{new Date(a.reservation_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                          <div className="small opacity-75">Doctor: {a.doctor_name || a.doctor_id}</div>
                        </div>
                        <Link to={`/reservation/${a.reservation_id}`} className="btn btn-sm btn-light bg-opacity-10 rounded-pill px-3 shadow-sm border border-opacity-10">
                          View Details
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="col-lg-4">
            <div className="card border-0 bg-white bg-opacity-10 shadow-sm h-100">
              <div className="card-header bg-transparent py-3 border-bottom border-opacity-10">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-bell me-2 text-warning"></i>
                  Notifications
                </h5>
              </div>
              <div className="card-body">
                <div className="text-center py-5 opacity-50">
                  <i className="bi bi-bell-slash fs-1 mb-3 d-block"></i>
                  <p className="small mb-0">No new notifications</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  }

export default PatientDashboard;

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/apiClient";

const PatientDashboard = () => {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null)

  useEffect(() => {
  const loadPatient = async () => {
    try {
      const data = await apiRequest("/patients/me", { method: "GET" });
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
          .filter(a => new Date(a.reservation_time) > new Date())
          .sort((a, b) => new Date(a.reservation_time) - new Date(b.reservation_time))
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
    <div className="min-vh-100 bg-light">
      <Navbar />

      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="display-5 fw-bold">Patient Dashboard</h1>
                <p className="text-muted">Welcome back, {user?.email}</p>
              </div>
              <div>
                <span className="badge bg-primary fs-6">
                  <i className="bi bi-person-circle me-2"></i>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-calendar-plus text-primary fs-1 mb-3"></i>
                <h5 className="card-title">Book Appointment</h5>
                <p className="card-text text-muted small">
                  Schedule a new appointment with a doctor
                </p>
                <Link
                  to="/appointments/book"
                  className="btn btn-primary btn-sm"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-file-medical text-success fs-1 mb-3"></i>
                <h5 className="card-title">Medical Records</h5>
                <p className="card-text text-muted small">
                  View your medical history and records
                </p>
                <Link to="/records" className="btn btn-success btn-sm">
                  View Records
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-prescription2 text-info fs-1 mb-3"></i>
                <h5 className="card-title">Prescriptions</h5>
                <p className="card-text text-muted small">
                  View and manage your prescriptions
                </p>
                <Link to="/prescriptions" className="btn btn-info btn-sm">
                  View All
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-chat-dots text-warning fs-1 mb-3"></i>
                <h5 className="card-title">Messages</h5>
                <p className="card-text text-muted small">
                  Communicate with your healthcare team
                </p>
                <Link to="/messages" className="btn btn-warning btn-sm">
                  Open
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="row">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">
                  <i className="bi bi-calendar-check me-2"></i>
                  Upcoming Appointments
                </h5>
              </div>
              <div className="card-body">
                {loading ? (
                    <p>Loading...</p>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-calendar-x fs-1 mb-3 d-block"></i>
                      <p>No upcoming appointments</p>
                      <Link to="/appointments/book" className="btn btn-primary">
                        Schedule an Appointment
                      </Link>
                    </div>
                ) : (
                    <ul className="list-group list-group-flush">
                      {appointments.map(a => (
                          <li key={a.reservation_id}
                              className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{new Date(a.reservation_time).toLocaleString()}</strong>
                              <br/>
                              Doctor: {a.doctor_name || a.doctor_id}
                            </div>
                            <Link to={`/appointments/${a.reservation_id}`} className="btn btn-sm btn-outline-primary">
                              View
                            </Link>
                          </li>
                      ))}
                    </ul>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">
                  <i className="bi bi-bell me-2"></i>
                  Notifications
                </h5>
              </div>
              <div className="card-body">
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-bell-slash fs-1 mb-3 d-block"></i>
                  <p className="small">No new notifications</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;

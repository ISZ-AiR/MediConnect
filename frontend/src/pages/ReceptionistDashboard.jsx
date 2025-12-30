import React from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ReceptionistDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
{/* Receptionist Header Tile */}
        <div className="card border-0 shadow-sm mb-5">
          <div className="card-body p-4 p-md-5 bg-white rounded-3">
            <div className="row align-items-center">
              <div className="col-md-8">
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-4">
                    <i className="bi bi-person-workspace text-primary fs-1"></i>
                  </div>
                  <div>
                    <h1 className="display-6 fw-bold text-dark mb-1">Receptionist Dashboard</h1>
                    <p className="text-muted mb-0">
                      Welcome back, <span className="fw-semibold text-primary">{user?.email}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 text-md-end mt-3 mt-md-0">
                <span className="badge bg-primary px-3 rounded-pill mt-1">
                      <i className="bi bi-shield-lock me-2"></i>
                  {user?.role || 'Receptionist'}
                    </span>
              </div>
            </div>
          </div>
        </div>
        <div className="row g-4">
          {/* Reservations */}

          <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-calendar-check text-primary fs-1 mb-3"></i>
                <h5 className="card-title">Reservations</h5>
                <p className="card-text text-muted small">
                  Manage and schedule patient reservations
                </p>
                <Link
                  to="/receptionist/reservations"
                  className="btn btn-primary btn-sm"
                >
                  Open
                </Link>
              </div>
            </div>
          </div>

          {/* Visits */}

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-calendar-plus text-warning fs-1 mb-3"></i>
                <h5 className="card-title">Visits</h5>
                <p className="card-text text-muted small">
                  Browse and manage patient visits
                </p>
                <Link
                  to="/receptionist/visits"
                  className="btn btn-warning btn-sm"
                >
                  Open
                </Link>
              </div>
            </div>
          </div>

          {/* Patients */}

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-people text-success fs-1 mb-3"></i>
                <h5 className="card-title">Patients</h5>
                <p className="card-text text-muted small">
                  Browse and update patient records
                </p>
                <Link
                  to="/receptionist/patients"
                  className="btn btn-success btn-sm"
                >
                  Open
                </Link>
              </div>
            </div>
          </div>

          {/* Doctors / Schedules */}

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-person-badge text-info fs-1 mb-3"></i>
                <h5 className="card-title">Schedules</h5>
                <p className="card-text text-muted small">
                  View and manage doctor schedules
                </p>
                <Link
                  to="/receptionist/schedules"
                  className="btn btn-info btn-sm"
                >
                  Open
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;

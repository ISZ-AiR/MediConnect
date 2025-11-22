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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-5 fw-bold">Receptionist Dashboard</h1>
            <p className="text-muted">Welcome, {user?.email}</p>
          </div>
        </div>

        <div className="row g-4">

          {/* Reservations */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-calendar-check text-primary fs-1 mb-3"></i>
                <h5 className="card-title">Reservations</h5>
                <p className="card-text text-muted small">
                  Manage and schedule patient reservations
                </p>
                <Link to="/admin/reservations" className="btn btn-primary btn-sm">
                  Open
                </Link>
              </div>
            </div>
          </div>

          {/* Patients */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-people text-success fs-1 mb-3"></i>
                <h5 className="card-title">Patients</h5>
                <p className="card-text text-muted small">
                  Browse and update patient records
                </p>
                <Link to="/admin/patients" className="btn btn-success btn-sm">
                  Open
                </Link>
              </div>
            </div>
          </div>

          {/* Doctors */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-person-badge text-info fs-1 mb-3"></i>
                <h5 className="card-title">Doctors</h5>
                <p className="card-text text-muted small">
                  View and manage doctor schedules
                </p>
                <Link to="/admin/schedules" className="btn btn-info btn-sm">
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

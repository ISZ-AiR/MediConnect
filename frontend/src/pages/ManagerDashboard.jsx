import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const ManagerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="display-5 fw-bold">Manager Dashboard</h1>
                <p className="text-muted">Welcome back, {user?.email}</p>
              </div>
              <div>
                <span className="badge bg-dark fs-6">
                  <i className="bi bi-shield-lock-fill me-2"></i>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="row g-4 mb-3">
          {/* Doctor Workload */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-clipboard-data text-primary fs-1 mb-3"></i>
                <h5 className="card-title">Doctor Workload</h5>
                <p className="card-text text-muted small">
                  Analyze number of visits and reservations per doctor
                </p>
                <Link
                  to="/reports/doctor-workload"
                  className="btn btn-primary btn-sm"
                >
                  View Report
                </Link>
              </div>
            </div>
          </div>

          {/* Reservations Summary */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-bar-chart-line text-success fs-1 mb-3"></i>
                <h5 className="card-title">Reservations Summary</h5>
                <p className="card-text text-muted small">
                  Track total, cancelled and completed reservations
                </p>
                <Link
                  to="/reports/reservations-summary"
                  className="btn btn-success btn-sm"
                >
                  Open Summary
                </Link>
              </div>
            </div>
          </div>

          {/* Doctor Availability Statistics */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-capsule text-warning fs-1 mb-3"></i>
                <h5 className="card-title">Doctor Availability</h5>
                <p className="card-text text-muted small">
                  Check general schedule overview of doctors
                </p>
                <Link
                  to="/reports/doctor-availability"
                  className="btn btn-warning btn-sm"
                >
                  View Overview
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* LOWER SECTION */}
        <div className="row">
          {/* ALL VISITS REPORT */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">
                  <i className="bi bi-journal-medical me-2"></i>
                  All Visits
                </h5>
              </div>
              <div className="card-body">
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-journal-x fs-1 mb-3 d-block"></i>
                  <p>No visit data loaded</p>
                  <Link to="/reports/visits" className="btn btn-primary">
                    Show Visits
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* SYSTEM NOTIFICATIONS */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">
                  <i className="bi bi-bell me-2"></i>
                  System Notifications
                </h5>
              </div>
              <div className="card-body">
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-bell-slash fs-1 mb-3 d-block"></i>
                  <p className="small">No recent notifications</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;

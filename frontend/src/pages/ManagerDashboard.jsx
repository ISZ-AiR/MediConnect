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

        {/* Modern Header Tile */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center">
                {/* Ikona w zielonym kółku dla Managera */}
                <div className="bg-success bg-opacity-10 p-3 rounded-circle me-4">
                  <i className="bi bi-graph-up-arrow text-success fs-2"></i>
                </div>
                <div>
                  <h1 className="display-6 fw-bold text-dark mb-1">Manager Dashboard</h1>
                  <p className="text-muted mb-0">
                    Welcome back, <span className="fw-semibold text-success">{user?.email}</span>
                  </p>
                </div>
              </div>
              <div className="text-end">
                <div className="d-flex flex-column align-items-end">
                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-4 py-2 fs-6 fw-medium shadow-sm">
                    <i className="bi bi-shield-lock-fill me-2"></i>
                    {user?.role?.toUpperCase()}
                  </span>
                  <small className="text-muted mt-2 px-2">Management & Analytics Access</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS / REPORTS TILES */}
        <div className="row g-4 mb-4">
          {/* Doctor Workload */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100 bg-white">
              <div className="card-body text-center p-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                  <i className="bi bi-clipboard-data text-primary fs-2"></i>
                </div>
                <h5 className="card-title fw-bold">Doctor Workload</h5>
                <p className="text-muted small">Analyze number of visits and reservations per doctor</p>
                <Link to="/reports/doctor-workload" className="btn btn-outline-primary rounded-pill px-4 btn-sm fw-bold shadow-sm">
                  View Report
                </Link>
              </div>
            </div>
          </div>

          {/* Reservations Summary */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100 bg-white">
              <div className="card-body text-center p-4">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                  <i className="bi bi-bar-chart-line text-success fs-2"></i>
                </div>
                <h5 className="card-title fw-bold">Reservations Summary</h5>
                <p className="text-muted small">Track total, cancelled and completed reservations</p>
                <Link to="/reports/reservations-summary" className="btn btn-success rounded-pill px-4 btn-sm fw-bold shadow-sm">
                  Open Summary
                </Link>
              </div>
            </div>
          </div>

          {/* Doctor Availability */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100 bg-white">
              <div className="card-body text-center p-4">
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                  <i className="bi bi-calendar-range text-warning fs-2"></i>
                </div>
                <h5 className="card-title fw-bold">Doctor Availability</h5>
                <p className="text-muted small">Check general schedule overview of clinical staff</p>
                <Link to="/reports/doctor-availability" className="btn btn-outline-warning text-dark rounded-pill px-4 btn-sm fw-bold shadow-sm">
                  View Overview
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* LOWER SECTION - DATA & NOTIFICATIONS */}
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm mb-4 bg-white overflow-hidden">
              <div className="card-header bg-white py-3 border-0">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-journal-medical me-2 text-success"></i>
                  Clinical Visit Activity
                </h5>
              </div>
              <div className="card-body border-top border-light">
                <div className="text-center py-5">
                  <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                    <i className="bi bi-journal-x fs-1 text-muted opacity-50"></i>
                  </div>
                  <p className="text-muted">No real-time visit data is currently loaded</p>
                  <Link to="/reports/visits" className="btn btn-success rounded-pill px-4 shadow-sm fw-bold">
                    Load Full Visit Report
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm bg-white">
              <div className="card-header bg-white py-3 border-0">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-bell me-2 text-success"></i>
                  System Alerts
                </h5>
              </div>
              <div className="card-body border-top border-light">
                <div className="text-center py-5">
                  <i className="bi bi-check-circle text-success opacity-25 fs-1 mb-3 d-block"></i>
                  <p className="small text-muted mb-0">System status: <span className="text-success fw-bold">Optimal</span></p>
                  <p className="small text-muted">No critical alerts for management</p>
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
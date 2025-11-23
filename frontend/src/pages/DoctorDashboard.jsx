import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const DoctorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-5 fw-bold">Doctor Dashboard</h1>
            <p className="text-muted">Welcome, {user?.email}</p>
          </div>
          <div>
            <span className="badge bg-success fs-6">
              <i className="bi bi-person-badge me-2"></i>
              Doctor
            </span>
          </div>
        </div>

        {/* Quick Actions / Tiles */}
        <div className="row g-4 mb-4">

          {/* Appointments */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-calendar-week text-primary fs-1 mb-3"></i>
                <h5 className="card-title">My Visits</h5>
                <p className="text-muted small">View and manage your scheduled visits</p>
                <Link to="/doctor/visits" className="btn btn-primary btn-sm">
                  Open
                </Link>
              </div>
            </div>
          </div>

          {/* Prescriptions */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-prescription2 text-success fs-1 mb-3"></i>
                <h5 className="card-title">Prescriptions</h5>
                <p className="text-muted small">Manage your issued prescriptions</p>
                <Link to="/doctor/prescriptions" className="btn btn-success btn-sm">
                  View All
                </Link>
              </div>
            </div>
          </div>

          {/* Referrals */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-file-earmark-medical text-info fs-1 mb-3"></i>
                <h5 className="card-title">Referrals</h5>
                <p className="text-muted small">View all patient referrals you’ve issued</p>
                <Link to="/doctor/referrals" className="btn btn-info btn-sm">
                  Open
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Notifications Section */}
        <div className="row">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">
                  <i className="bi bi-bell me-2"></i>
                  Notifications
                </h5>
              </div>
              <div className="card-body">
                <div className="text-center text-muted py-4">
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

export default DoctorDashboard;

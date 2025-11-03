import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { statsService } from "../services/statsService";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: "--",
    activeDoctors: "--",
    nurses: "--",
    patients: "--",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await statsService.getSystemStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch statistics:", err);
        setError("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="display-5 fw-bold">Admin Dashboard</h1>
                <p className="text-muted">Welcome back, {user?.email}</p>
              </div>
              <div>
                <span className="badge bg-warning text-dark fs-6">
                  <i className="bi bi-shield-check me-2"></i>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <Link to="/admin/register-staff" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-shadow">
                <div className="card-body text-center p-4">
                  <div
                    className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-person-plus-fill text-primary fs-1"></i>
                  </div>
                  <h5 className="card-title fw-bold mb-3">Register Staff</h5>
                  <p className="card-text text-muted">
                    Create new staff accounts for doctors, nurses,
                    receptionists, and admins
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-6 col-lg-3">
            <Link to="/admin/users" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-shadow">
                <div className="card-body text-center p-4">
                  <div
                    className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-people text-success fs-1"></i>
                  </div>
                  <h5 className="card-title fw-bold mb-3">Manage Users</h5>
                  <p className="card-text text-muted">
                    View, edit, and manage all user accounts in the system
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-6 col-lg-3">
            <Link to="/admin/doctors" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-shadow">
                <div className="card-body text-center p-4">
                  <div
                    className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-person-badge text-info fs-1"></i>
                  </div>
                  <h5 className="card-title fw-bold mb-3">Manage Doctors</h5>
                  <p className="card-text text-muted">
                    View and manage doctor profiles, specializations, and
                    schedules
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-6 col-lg-3">
            <Link to="/admin/settings" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-shadow">
                <div className="card-body text-center p-4">
                  <div
                    className="bg-secondary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-gear text-secondary fs-1"></i>
                  </div>
                  <h5 className="card-title fw-bold mb-3">System Settings</h5>
                  <p className="card-text text-muted">
                    Configure system settings, preferences, and parameters
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">
                  <i className="bi bi-bar-chart me-2"></i>
                  System Overview
                  {loading && (
                    <span
                      className="spinner-border spinner-border-sm ms-2"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </span>
                  )}
                </h5>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-warning mb-3" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
                <div className="row text-center g-4">
                  <div className="col-md-3">
                    <div className="p-3">
                      <i className="bi bi-people fs-1 text-primary mb-2 d-block"></i>
                      <h3 className="fw-bold mb-1">
                        {loading ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </span>
                        ) : (
                          stats.totalUsers
                        )}
                      </h3>
                      <p className="text-muted mb-0">Total Users</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3">
                      <i className="bi bi-person-badge fs-1 text-success mb-2 d-block"></i>
                      <h3 className="fw-bold mb-1">
                        {loading ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </span>
                        ) : (
                          stats.activeDoctors
                        )}
                      </h3>
                      <p className="text-muted mb-0">Active Doctors</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3">
                      <i className="bi bi-heart-pulse fs-1 text-info mb-2 d-block"></i>
                      <h3 className="fw-bold mb-1">
                        {loading ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </span>
                        ) : (
                          stats.nurses
                        )}
                      </h3>
                      <p className="text-muted mb-0">Nurses</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3">
                      <i className="bi bi-person-circle fs-1 text-warning mb-2 d-block"></i>
                      <h3 className="fw-bold mb-1">
                        {loading ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </span>
                        ) : (
                          stats.patients
                        )}
                      </h3>
                      <p className="text-muted mb-0">Patients</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Info */}
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">
                  <i className="bi bi-clock-history me-2"></i>
                  Recent Activity
                </h5>
              </div>
              <div className="card-body">
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-inbox fs-1 mb-3 d-block"></i>
                  <p>No recent activity to display</p>
                  <small className="text-muted">
                    Activity will appear here as users interact with the system
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Quick Info
                </h5>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-start mb-3">
                  <i className="bi bi-shield-check text-success fs-4 me-3"></i>
                  <div>
                    <h6 className="mb-1">System Status</h6>
                    <p className="text-muted small mb-0">
                      All systems operational
                    </p>
                  </div>
                </div>
                <hr />
                <div className="d-flex align-items-start mb-3">
                  <i className="bi bi-database text-primary fs-4 me-3"></i>
                  <div>
                    <h6 className="mb-1">Database</h6>
                    <p className="text-muted small mb-0">
                      Connected and healthy
                    </p>
                  </div>
                </div>
                <hr />
                <div className="d-flex align-items-start">
                  <i className="bi bi-calendar-check text-info fs-4 me-3"></i>
                  <div>
                    <h6 className="mb-1">Last Backup</h6>
                    <p className="text-muted small mb-0">Not configured</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm bg-primary text-white">
              <div className="card-body text-center p-4">
                <i className="bi bi-lightbulb fs-1 mb-3 d-block"></i>
                <h5 className="fw-bold mb-2">Need Help?</h5>
                <p className="mb-3 small">
                  Check the documentation or contact support for assistance
                </p>
                <button className="btn btn-light btn-sm">
                  <i className="bi bi-book me-2"></i>
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="row g-4 mt-2">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">
                  <i className="bi bi-tools me-2"></i>
                  Administrative Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <button className="btn btn-outline-primary w-100">
                      <i className="bi bi-journal-text me-2"></i>
                      View System Logs
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button className="btn btn-outline-success w-100">
                      <i className="bi bi-download me-2"></i>
                      Export Data
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button className="btn btn-outline-info w-100">
                      <i className="bi bi-graph-up me-2"></i>
                      Generate Reports
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

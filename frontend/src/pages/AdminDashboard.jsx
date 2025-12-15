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
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1 className="display-5 fw-bold text-dark mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted mb-0">
                Welcome back, <span className="fw-semibold">{user?.email}</span>
              </p>
            </div>
            <span className="badge bg-primary px-3 py-2 fs-6">
              <i className="bi bi-shield-check me-2"></i>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-5">
          <h2 className="h4 fw-bold mb-4">
            <i className="bi bi-lightning-charge-fill text-primary me-2"></i>
            Quick Actions
          </h2>
          <div className="row g-3">
            <div className="col-md-6 col-lg-3">
              <Link to="/admin/register-staff" className="text-decoration-none">
                <div className="card border-0 shadow-sm h-100 hover-shadow">
                  <div className="card-body text-center p-3">
                    <div
                      className="bg-primary-subtle bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <i className="bi bi-person-plus-fill text-primary fs-3"></i>
                    </div>
                    <h5 className="card-title fw-semibold mb-2 text-dark">
                      Register Staff
                    </h5>
                    <p className="card-text text-muted small">
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
                  <div className="card-body text-center p-3">
                    <div
                      className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <i className="bi bi-people text-success fs-3"></i>
                    </div>
                    <h5 className="card-title fw-semibold mb-2 text-dark">
                      Manage Users
                    </h5>
                    <p className="card-text text-muted small">
                      View, edit, and manage all user accounts in the system
                    </p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-md-6 col-lg-3">
              <Link to="/admin/doctors" className="text-decoration-none">
                <div className="card border-0 shadow-sm h-100 hover-shadow">
                  <div className="card-body text-center p-3">
                    <div
                      className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <i className="bi bi-person-badge text-info fs-3"></i>
                    </div>
                    <h5 className="card-title fw-semibold mb-2 text-dark">
                      Manage Doctors
                    </h5>
                    <p className="card-text text-muted small">
                      View and manage doctor profiles, specializations, and
                      schedules
                    </p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-md-6 col-lg-3">
              <Link to="/admin/nurses" className="text-decoration-none">
                <div className="card border-0 shadow-sm h-100 hover-shadow">
                  <div className="card-body text-center p-3">
                    <div
                      className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <i className="bi bi-heart-pulse-fill text-danger fs-3"></i>
                    </div>
                    <h5 className="card-title fw-semibold mb-2 text-dark">
                      Manage Nurses
                    </h5>
                    <p className="card-text text-muted small">
                      View and manage nurses profiles and schedules
                    </p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-md-6 col-lg-3">
              <Link to="/admin/receptionists" className="text-decoration-none">
                <div className="card border-0 shadow-sm h-100 hover-shadow">
                  <div className="card-body text-center p-3">
                    <div
                      className="bg-purple bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{
                        width: "60px",
                        height: "60px",
                        backgroundColor: "rgba(111, 66, 193, 0.1)",
                      }}
                    >
                      <i
                        className="bi bi-headset fs-3"
                        style={{ color: "#6f42c1" }}
                      ></i>
                    </div>
                    <h5 className="card-title fw-semibold mb-2 text-dark">
                      Manage Receptionists
                    </h5>
                    <p className="card-text text-muted small">
                      View and manage receptionists profiles
                    </p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-md-6 col-lg-3">
              <Link to="/admin/managers" className="text-decoration-none">
                <div className="card border-0 shadow-sm h-100 hover-shadow">
                  <div className="card-body text-center p-3">
                    <div
                      className="bg-dark bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <i className="bi bi-shield-fill-check text-dark fs-3"></i>
                    </div>
                    <h5 className="card-title fw-semibold mb-2 text-dark">
                      Manage Admins
                    </h5>
                    <p className="card-text text-muted small">
                      View and manage managers profiles
                    </p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-md-6 col-lg-3">
              <Link to="/admin/schedules" className="text-decoration-none">
                <div className="card border-0 shadow-sm h-100 hover-shadow">
                  <div className="card-body text-center p-3">
                    <div
                      className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <i className="bi bi-calendar2-check-fill text-warning fs-3"></i>
                    </div>
                    <h5 className="card-title fw-semibold mb-2 text-dark">
                      Manage Schedules
                    </h5>
                    <p className="card-text text-muted small">
                      View and schedules of the doctors and nurses
                    </p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-md-6 col-lg-3">
              <Link to="/admin/settings" className="text-decoration-none">
                <div className="card border-0 shadow-sm h-100 hover-shadow">
                  <div className="card-body text-center p-3">
                    <div
                      className="bg-secondary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <i className="bi bi-gear-fill text-secondary fs-3"></i>
                    </div>
                    <h5 className="card-title fw-semibold mb-2 text-dark">
                      System Settings
                    </h5>
                    <p className="card-text text-muted small">
                      Configure system settings, preferences, and parameters
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="mb-5">
          <h2 className="h4 fw-bold mb-4">
            <i className="bi bi-bar-chart-fill text-primary me-2"></i>
            System Statistics
          </h2>
          <div className="row g-3">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom py-3">
                  <h6 className="mb-0 fw-semibold">
                    Overview
                    {loading && (
                      <span
                        className="spinner-border spinner-border-sm ms-2"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </span>
                    )}
                  </h6>
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
                      <div className="p-4 border-end">
                        <i className="bi bi-people-fill fs-1 text-primary mb-3 d-block"></i>
                        <h2 className="fw-bold mb-2">
                          {loading ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </span>
                          ) : (
                            stats.totalUsers
                          )}
                        </h2>
                        <p className="text-muted mb-0 small fw-semibold">
                          Total Users
                        </p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-4 border-end">
                        <i className="bi bi-person-badge-fill fs-1 text-success mb-3 d-block"></i>
                        <h2 className="fw-bold mb-2">
                          {loading ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </span>
                          ) : (
                            stats.activeDoctors
                          )}
                        </h2>
                        <p className="text-muted mb-0 small fw-semibold">
                          Active Doctors
                        </p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-4 border-end">
                        <i className="bi bi-heart-pulse-fill fs-1 text-danger mb-3 d-block"></i>
                        <h2 className="fw-bold mb-2">
                          {loading ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </span>
                          ) : (
                            stats.nurses
                          )}
                        </h2>
                        <p className="text-muted mb-0 small fw-semibold">
                          Nurses
                        </p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-4">
                        <i className="bi bi-person-hearts fs-1 text-warning mb-3 d-block"></i>
                        <h2 className="fw-bold mb-2">
                          {loading ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </span>
                          ) : (
                            stats.patients
                          )}
                        </h2>
                        <p className="text-muted mb-0 small fw-semibold">
                          Patients
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Info */}
        <div className="mb-5">
          <h2 className="h4 fw-bold mb-4">
            <i className="bi bi-activity text-primary me-2"></i>
            System Activity
          </h2>
          <div className="row g-3">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-bottom py-3">
                  <h6 className="mb-0 fw-semibold">
                    <i className="bi bi-clock-history me-2"></i>Recent Activity
                  </h6>
                </div>
                <div className="card-body">
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-1 mb-3 d-block"></i>
                    <p>No recent activity to display</p>
                    <small className="text-muted">
                      Activity will appear here as users interact with the
                      system
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-white border-bottom py-3">
                  <h6 className="mb-0 fw-semibold">
                    <i className="bi bi-info-circle-fill me-2"></i>Quick Info
                  </h6>
                </div>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <div
                      className="bg-success bg-opacity-10 rounded-circle p-2 me-3"
                      style={{
                        width: "48px",
                        height: "48px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className="bi bi-shield-fill-check text-success fs-5"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="small text-muted mb-1">System Status</div>
                      <div className="fw-semibold text-success">
                        Operational
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <div
                      className="bg-primary-subtle bg-opacity-10 rounded-circle p-2 me-3"
                      style={{
                        width: "48px",
                        height: "48px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className="bi bi-database-fill text-primary fs-5"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="small text-muted mb-1">Database</div>
                      <div className="fw-semibold text-success">Connected</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div
                      className="bg-warning bg-opacity-10 rounded-circle p-2 me-3"
                      style={{
                        width: "48px",
                        height: "48px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className="bi bi-calendar-check-fill text-warning fs-5"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="small text-muted mb-1">Last Backup</div>
                      <div className="fw-semibold text-muted">
                        Not configured
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card border-0 shadow-sm">
                <div
                  className="card-body text-center p-4"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  <i className="bi bi-question-circle-fill fs-1 mb-3 d-block text-white"></i>
                  <h5 className="fw-bold mb-2 text-white">Need Help?</h5>
                  <p className="mb-3 small text-white opacity-75">
                    Check the documentation or contact support
                  </p>
                  <button className="btn btn-light btn-sm shadow-sm">
                    <i className="bi bi-book me-2"></i>Documentation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="mb-5">
          <h2 className="h4 fw-bold mb-4">
            <i className="bi bi-tools text-primary me-2"></i>
            Administrative Tools
          </h2>
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-4">
                  <button className="btn btn-outline-primary w-100 py-3">
                    <i className="bi bi-journal-text me-2"></i>System Logs
                  </button>
                </div>
                <div className="col-md-4">
                  <button className="btn btn-outline-success w-100 py-3">
                    <i className="bi bi-download me-2"></i>Export Data
                  </button>
                </div>
                <div className="col-md-4">
                  <button className="btn btn-outline-info w-100 py-3">
                    <i className="bi bi-graph-up me-2"></i>Generate Reports
                  </button>
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

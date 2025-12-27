import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
      <nav className={`navbar navbar-expand-lg shadow-sm ${
          theme === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-white'
      }`}>
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img
                className="me-2"
                src="/icon.png"
                alt="MediConnect"
                style={{width: "3rem", height: "3rem"}}
            />
            <span className="fw-bold text-primary">MediConnect</span>
          </Link>

          <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-lg-center">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  <i className="bi bi-house-door me-1"></i>
                  Home
                </Link>
              </li>

              {/* Patient specific menu items */}
              {user?.role === "patient" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/appointments">
                        <i className="bi bi-calendar-check me-1"></i>
                        My Appointments
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/patient/records">
                        <i className="bi bi-file-medical me-1"></i>
                        My Records
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/patient/prescriptions">
                        <i className="bi bi-prescription2 me-1"></i>
                        My Prescriptions
                      </Link>
                    </li>
                  </>
              )}

              {/* Doctor specific menu items */}
              {user?.role === "doctor" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/doctor/visits">
                        <i className="bi bi-calendar-check me-1"></i>
                        Visits
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/patients">
                        <i className="bi bi-people me-1"></i>
                        Patients
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/doctor/prescriptions">
                        <i className="bi bi-prescription2 me-1"></i>
                        Prescriptions
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/doctor/referrals">
                        <i className="bi bi-clipboard-plus me-1"></i>
                        Referrals
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/doctor/examinations">
                        <i className="bi bi-clipboard2-pulse me-1"></i>
                        Examinations
                      </Link>
                    </li>
                  </>
              )}

              {/* Nurse specific menu items */}
              {user?.role === "nurse" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/patients">
                        <i className="bi bi-people me-1"></i>
                        Patients
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/prescriptions">
                        <i className="bi bi-prescription2 me-1"></i>
                        Prescriptions
                      </Link>
                    </li>
                  </>
              )}

              {/* Receptionist specific menu items */}
              {user?.role === "receptionist" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/receptionist/reservations">
                        <i className="bi bi-calendar-plus me-1"></i>
                        Reservations
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/receptionist/visits">
                        <i className="bi bi-calendar-check me-1"></i>
                        Visits
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/receptionist/patients">
                        <i className="bi bi-people me-1"></i>
                        Patients
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/receptionist/schedules">
                        <i className="bi bi-calendar3 me-1"></i>
                        Schedules
                      </Link>
                    </li>
                  </>
              )}

              {/* Manager specific menu items */}
              {user?.role === "manager" && (
                  <>
                    <li className="nav-item dropdown">
                      <a
                          className="nav-link dropdown-toggle"
                          href="#"
                          id="reportsDropdown"
                          role="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                      >
                        <i className="bi bi-bar-chart me-1"></i>
                        Reports
                      </a>
                      <ul
                          className="dropdown-menu"
                          aria-labelledby="reportsDropdown"
                      >
                        <li>
                          <Link
                              className="dropdown-item"
                              to="/reports/doctor-workload"
                          >
                            <i className="bi bi-person-workspace me-2"></i>
                            Doctor Workload
                          </Link>
                        </li>
                        <li>
                          <Link
                              className="dropdown-item"
                              to="/reports/reservations-summary"
                          >
                            <i className="bi bi-calendar-range me-2"></i>
                            Reservations Summary
                          </Link>
                        </li>
                        <li>
                          <Link
                              className="dropdown-item"
                              to="/reports/examinations"
                          >
                            <i className="bi bi-clipboard-data me-2"></i>
                            Examinations
                          </Link>
                        </li>
                        <li>
                          <Link
                              className="dropdown-item"
                              to="/reports/doctor-availability"
                          >
                            <i className="bi bi-calendar-check me-2"></i>
                            Doctor Availability
                          </Link>
                        </li>
                      </ul>
                    </li>
                  </>
              )}

              {/* Admin specific menu items */}
              {user?.role === "admin" && (
                  <>
                    <li className="nav-item dropdown">
                      <a
                          className="nav-link dropdown-toggle"
                          href="#"
                          id="staffDropdown"
                          role="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                      >
                        <i className="bi bi-people me-1"></i>
                        Staff
                      </a>
                      <ul className="dropdown-menu" aria-labelledby="staffDropdown">
                        <li>
                          <Link className="dropdown-item" to="/admin/doctors">
                            <i className="bi bi-person-badge me-2"></i>
                            Doctors
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/nurses">
                            <i className="bi bi-heart-pulse me-2"></i>
                            Nurses
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/receptionists">
                            <i className="bi bi-person-circle me-2"></i>
                            Receptionists
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/managers">
                            <i className="bi bi-briefcase me-2"></i>
                            Managers
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/admins">
                            <i className="bi bi-shield-check me-2"></i>
                            Admins
                          </Link>
                        </li>
                      </ul>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/patients">
                        <i className="bi bi-people me-1"></i>
                        Patients
                      </Link>
                    </li>
                    <li className="nav-item dropdown">
                      <a
                          className="nav-link dropdown-toggle"
                          href="#"
                          id="operationsDropdown"
                          role="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                      >
                        <i className="bi bi-gear me-1"></i>
                        Operations
                      </a>
                      <ul
                          className="dropdown-menu"
                          aria-labelledby="operationsDropdown"
                      >
                        <li>
                          <Link className="dropdown-item" to="/admin/reservations">
                            <i className="bi bi-calendar-plus me-2"></i>
                            Reservations
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/visits">
                            <i className="bi bi-calendar-check me-2"></i>
                            Visits
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/schedules">
                            <i className="bi bi-calendar3 me-2"></i>
                            Schedules
                          </Link>
                        </li>
                        <li>
                          <hr className="dropdown-divider"/>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/prescriptions">
                            <i className="bi bi-prescription2 me-2"></i>
                            Prescriptions
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/referrals">
                            <i className="bi bi-clipboard-plus me-2"></i>
                            Referrals
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/examinations">
                            <i className="bi bi-clipboard2-pulse me-2"></i>
                            Examinations
                          </Link>
                        </li>
                      </ul>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/resources">
                        <i className="bi bi-grid me-1"></i>
                        Resources
                      </Link>
                    </li>
                  </>
              )}

              {/* Public menu items (shown to all or when not authenticated) */}
              {!isAuthenticated && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/doctors">
                        <i className="bi bi-person-badge me-1"></i>
                        Doctors
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/about">
                        <i className="bi bi-info-circle me-1"></i>
                        About
                      </Link>
                    </li>
                  </>
              )}

              {/* Show different buttons based on authentication status */}
              {!isAuthenticated ? (
                  <>
                    <li className="nav-item ms-lg-3">
                      <Link className="btn btn-outline-primary btn-sm" to="/login">
                        <i className="bi bi-box-arrow-in-right me-1"></i>
                        Login
                      </Link>
                    </li>
                    <li className="nav-item ms-lg-2">
                      <Link className="btn btn-primary btn-sm" to="/register">
                        <i className="bi bi-person-plus me-1"></i>
                        Register
                      </Link>
                    </li>
                  </>
              ) : (
                  <>
                    <li className="nav-item ms-lg-3">
                      <div className="dropdown">
                        <button
                            className="btn btn-outline-primary btn-sm dropdown-toggle"
                            type="button"
                            id="userDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                          <i className="bi bi-person-circle me-1"></i>
                          {user?.email}
                        </button>
                        <ul
                            className="dropdown-menu dropdown-menu-end"
                            aria-labelledby="userDropdown"
                        >
                          <li>
                        <span className="dropdown-item-text text-muted small">
                          <i className="bi bi-person-badge me-2"></i>
                          Role:{" "}
                          <strong className="text-capitalize">
                            {user?.role}
                          </strong>
                        </span>
                          </li>
                          <li>
                            <hr className="dropdown-divider"/>
                          </li>

                          {/* Dashboard Links */}
                          {user?.role === "patient" && (
                              <li>
                                <Link
                                    className="dropdown-item"
                                    to="/patient/dashboard"
                                >
                                  <i className="bi bi-speedometer2 me-2"></i>
                                  Dashboard
                                </Link>
                              </li>
                          )}
                          {user?.role === "doctor" && (
                              <li>
                                <Link
                                    className="dropdown-item"
                                    to="/doctor/dashboard"
                                >
                                  <i className="bi bi-speedometer2 me-2"></i>
                                  Dashboard
                                </Link>
                              </li>
                          )}
                          {user?.role === "nurse" && (
                              <li>
                                <Link className="dropdown-item" to="/nurse/dashboard">
                                  <i className="bi bi-speedometer2 me-2"></i>
                                  Dashboard
                                </Link>
                              </li>
                          )}
                          {user?.role === "manager" && (
                              <li>
                                <Link
                                    className="dropdown-item"
                                    to="/manager/dashboard"
                                >
                                  <i className="bi bi-speedometer2 me-2"></i>
                                  Dashboard
                                </Link>
                              </li>
                          )}
                          {user?.role === "receptionist" && (
                              <li>
                                <Link
                                    className="dropdown-item"
                                    to="/receptionist/dashboard"
                                >
                                  <i className="bi bi-speedometer2 me-2"></i>
                                  Dashboard
                                </Link>
                              </li>
                          )}
                          {user?.role === "admin" && (
                              <li>
                                <Link className="dropdown-item" to="/admin/dashboard">
                                  <i className="bi bi-speedometer2 me-2"></i>
                                  Dashboard
                                </Link>
                              </li>
                          )}

                          <li>
                            <hr className="dropdown-divider"/>
                          </li>

                          {/* User Profile & Settings */}
                          <li>
                            <Link className="dropdown-item" to="/profile">
                              <i className="bi bi-person me-2"></i>
                              My Profile
                            </Link>
                          </li>
                          <li>
                            <Link className="dropdown-item" to="/settings">
                              <i className="bi bi-gear me-2"></i>
                              Settings
                            </Link>
                          </li>

                          {/* Admin specific options */}
                          {user?.role === "admin" && (
                              <>
                                <li>
                                  <hr className="dropdown-divider"/>
                                </li>
                                <li>
                                  <Link
                                      className="dropdown-item"
                                      to="/admin/register-staff"
                                  >
                                    <i className="bi bi-person-plus-fill me-2"></i>
                                    Register Staff
                                  </Link>
                                </li>
                                <li>
                                  <Link className="dropdown-item" to="/admin/users">
                                    <i className="bi bi-people-fill me-2"></i>
                                    Manage Users
                                  </Link>
                                </li>
                              </>
                          )}

                          <li>
                            <hr className="dropdown-divider"/>
                          </li>
                          <li>
                            <button
                                className="dropdown-item text-danger"
                                onClick={handleLogout}
                            >
                              <i className="bi bi-box-arrow-right me-2"></i>
                              Logout
                            </button>
                          </li>
                        </ul>
                      </div>
                    </li>
                  </>
              )}
            </ul>
          </div>
        </div>
      </nav>
  );
};

export default Navbar;

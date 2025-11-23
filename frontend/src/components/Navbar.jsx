import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-hospital fs-3 text-primary me-2"></i>
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
            <li className="nav-item">
              <Link className="nav-link" to="/appointments">
                <i className="bi bi-calendar-check me-1"></i>
                Appointments
              </Link>
            </li>
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
                          Role: <strong>{user?.role}</strong>
                        </span>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
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
                      {user?.role === "patient" && (
                        <li>
                          <Link
                            className="dropdown-item"
                            to="/patient/dashboard"
                          >
                            <i className="bi bi-speedometer2 me-2"></i>
                            Patient Dashboard
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
                            Manager Dashboard
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
                            Receptionist Dashboard
                          </Link>
                        </li>
                      )}
                      {["doctor", "admin", "nurse"].includes(user?.role) && (
                        <li>
                          <Link className="dropdown-item" to="/patients">
                            <i className="bi bi-people me-2"></i>
                            Patients
                          </Link>
                        </li>
                      )}
                      {user?.role === "admin" && (
                        <>
                          <li>
                            <hr className="dropdown-divider" />
                          </li>
                          <li>
                            <Link
                              className="dropdown-item"
                              to="/admin/dashboard"
                            >
                              <i className="bi bi-speedometer2 me-2"></i>
                              Admin Dashboard
                            </Link>
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
                        </>
                      )}
                      <li>
                        <hr className="dropdown-divider" />
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

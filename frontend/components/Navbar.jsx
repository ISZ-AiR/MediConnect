import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
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
              <Link className="nav-link" to="/patients">
                <i className="bi bi-people me-1"></i>
                Patients
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">
                <i className="bi bi-info-circle me-1"></i>
                About
              </Link>
            </li>
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
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

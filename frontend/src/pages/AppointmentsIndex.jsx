import React from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AppointmentsIndex = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h1 className="display-6">Appointments</h1>
        <p className="text-muted">Book, view or manage appointments.</p>

        <div className="row g-3 mt-3">
          <div className="col-md-4">
            <Link to="/appointments/book" className="btn btn-primary w-100">
              Book Appointment
            </Link>
          </div>
          {isAuthenticated && user?.role === "patient" && (
            <div className="col-md-4">
              <Link
                to="/reservation/me"
                className="btn btn-outline-secondary w-100"
              >
                My Reservations
              </Link>
            </div>
          )}
          <div className="col-md-4">
            <Link
              to="/admin/reservations"
              className="btn btn-outline-info w-100"
            >
              All Reservations (staff)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsIndex;

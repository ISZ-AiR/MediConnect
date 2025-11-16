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
          <div className="col-md-4">
            <Link
              to="/admin/reservations"
              className="btn btn-outline-primary w-100"
            >
              Reservations
            </Link>
          </div>
          <div className="col-md-4">
            <Link
              to="/admin/patients"
              className="btn btn-outline-success w-100"
            >
              Patients
            </Link>
          </div>
          <div className="col-md-4">
            <Link to="/admin/doctors" className="btn btn-outline-info w-100">
              Doctors
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;

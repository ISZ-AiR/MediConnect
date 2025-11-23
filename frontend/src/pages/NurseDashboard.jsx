import React from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NurseDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-5 fw-bold">Nurse Dashboard</h1>
            <p className="text-muted">Welcome, {user?.email}</p>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <Link to="/admin/visits" className="btn btn-outline-primary w-100">
              Assigned Visits
            </Link>
          </div>
          <div className="col-md-4">
            <Link
              to="/admin/schedules"
              className="btn btn-outline-warning w-100"
            >
              Schedules
            </Link>
          </div>
          <div className="col-md-4">
            <Link
              to="/admin/patients"
              className="btn btn-outline-success w-100"
            >
              Patient List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;

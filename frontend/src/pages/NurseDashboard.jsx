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
          {/* Assigned Visits */}
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-clipboard2-pulse text-primary fs-1 mb-3"></i>
                <h5 className="card-title">Assigned Visits</h5>
                <p className="card-text text-muted small">
                  View and complete your assigned patient visits
                </p>
                <Link
                  to="/nurse/visits"
                  className="btn btn-primary btn-sm"
                >
                  Open
                </Link>
              </div>
            </div>
          </div>


          {/* Patient List */}
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-people text-success fs-1 mb-3"></i>
                <h5 className="card-title">Patient List</h5>
                <p className="card-text text-muted small">
                  Browse assigned or nearby patient records
                </p>
                <Link
                  to="/nurse/patients"
                  className="btn btn-success btn-sm"
                >
                  Open
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
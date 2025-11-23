import React from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const ResourcesIndex = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">Resources</h2>
        <div className="row g-3">
          <div className="col-md-3">
            <Link to="/admin/doctors" className="btn btn-outline-primary w-100">
              Doctors
            </Link>
          </div>
          <div className="col-md-3">
            <Link
              to="/admin/nurses"
              className="btn btn-outline-secondary w-100"
            >
              Nurses
            </Link>
          </div>
          <div className="col-md-3">
            <Link
              to="/admin/patients"
              className="btn btn-outline-success w-100"
            >
              Patients
            </Link>
          </div>
          <div className="col-md-3">
            <Link
              to="/admin/receptionists"
              className="btn btn-outline-info w-100"
            >
              Receptionists
            </Link>
          </div>
          <div className="col-md-3 mt-3">
            <Link to="/admin/admins" className="btn btn-outline-warning w-100">
              Admins
            </Link>
          </div>
          <div className="col-md-3 mt-3">
            <Link to="/admin/managers" className="btn btn-outline-dark w-100">
              Managers
            </Link>
          </div>
          <div className="col-md-3 mt-3">
            <Link
              to="/admin/reservations"
              className="btn btn-outline-primary w-100"
            >
              Reservations
            </Link>
          </div>
          <div className="col-md-3 mt-3">
            <Link
              to="/admin/visits"
              className="btn btn-outline-secondary w-100"
            >
              Visits
            </Link>
          </div>
          <div className="col-md-3 mt-3">
            <Link
              to="/admin/prescriptions"
              className="btn btn-outline-success w-100"
            >
              Prescriptions
            </Link>
          </div>
          <div className="col-md-3 mt-3">
            <Link to="/admin/referrals" className="btn btn-outline-info w-100">
              Referrals
            </Link>
          </div>
          <div className="col-md-3 mt-3">
            <Link
              to="/admin/schedules"
              className="btn btn-outline-warning w-100"
            >
              Schedules
            </Link>
          </div>
          <div className="col-md-3 mt-3">
            <Link
              to="/admin/examinations"
              className="btn btn-outline-primary w-100"
            >
              Examinations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesIndex;

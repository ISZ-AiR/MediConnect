import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const UnderConstruction = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <div className="container py-5 text-center">
        <i className="bi bi-tools text-warning mb-4" style={{ fontSize: "4rem" }}></i>

        <h2 className="fw-bold mb-3">Messages</h2>
        <p className="text-muted mb-4">
          This feature is currently under construction.
          Please contact the medical staff by phone or try again later.
        </p>

        <Link to="/" className="btn btn-primary rounded-pill px-4">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
};

export default UnderConstruction;

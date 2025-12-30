import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Services = () => {
  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <Navbar />
      <div className="container py-5">
        <h1 className="display-6">Services</h1>
        <p className="text-muted">
          Explore our core features: appointments, EHR, prescriptions, and more.
        </p>
        <ul className="list-unstyled mt-4">
          <li className="mb-2">• Appointment Management</li>
          <li className="mb-2">• Electronic Health Records</li>
          <li className="mb-2">• Prescription Management</li>
          <li className="mb-2">• Medical Examinations</li>
        </ul>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Services;

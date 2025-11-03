import React from "react";
import Navbar from "../components/Navbar";

const Homepage = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-3">Welcome to MediConnect</h1>
              <p className="lead mb-4">
                Your trusted partner in healthcare management. Modern,
                efficient, and patient-centered medical practice management
                system.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <button className="btn btn-light btn-lg">
                  <i className="bi bi-calendar-plus me-2"></i>
                  Book Appointment
                </button>
                <button className="btn btn-outline-light btn-lg">
                  <i className="bi bi-file-medical me-2"></i>
                  Patient Portal
                </button>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <i
                className="bi bi-hospital display-1"
                style={{ fontSize: "10rem" }}
              ></i>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Our Services</h2>
            <p className="lead text-muted">
              Comprehensive healthcare solutions for modern medical practices
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-shadow transition">
                <div className="card-body text-center p-4">
                  <div
                    className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-calendar-check text-primary fs-1"></i>
                  </div>
                  <h5 className="card-title fw-bold mb-3">
                    Appointment Management
                  </h5>
                  <p className="card-text text-muted">
                    Easy online booking and scheduling system for patients and
                    doctors. Manage your time efficiently.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-shadow transition">
                <div className="card-body text-center p-4">
                  <div
                    className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-file-medical text-success fs-1"></i>
                  </div>
                  <h5 className="card-title fw-bold mb-3">
                    Electronic Health Records
                  </h5>
                  <p className="card-text text-muted">
                    Secure digital storage of patient records with easy access
                    and comprehensive medical history tracking.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-shadow transition">
                <div className="card-body text-center p-4">
                  <div
                    className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-prescription2 text-info fs-1"></i>
                  </div>
                  <h5 className="card-title fw-bold mb-3">
                    Prescription Management
                  </h5>
                  <p className="card-text text-muted">
                    Digital prescription creation and management with medication
                    history and interaction checking.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-shadow transition">
                <div className="card-body text-center p-4">
                  <div
                    className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-clipboard2-pulse text-warning fs-1"></i>
                  </div>
                  <h5 className="card-title fw-bold mb-3">
                    Medical Examinations
                  </h5>
                  <p className="card-text text-muted">
                    Track and manage medical examinations, test results, and
                    diagnostic procedures efficiently.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-shadow transition">
                <div className="card-body text-center p-4">
                  <div
                    className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-person-badge text-danger fs-1"></i>
                  </div>
                  <h5 className="card-title fw-bold mb-3">Doctor Directory</h5>
                  <p className="card-text text-muted">
                    Browse our network of qualified healthcare professionals and
                    their specializations.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-shadow transition">
                <div className="card-body text-center p-4">
                  <div
                    className="bg-secondary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-shield-check text-secondary fs-1"></i>
                  </div>
                  <h5 className="card-title fw-bold mb-3">
                    Secure & Compliant
                  </h5>
                  <p className="card-text text-muted">
                    HIPAA compliant system with advanced security measures to
                    protect patient information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-primary text-white py-5">
        <div className="container py-4">
          <div className="row text-center g-4">
            <div className="col-md-3 col-sm-6">
              <div className="p-3">
                <i className="bi bi-people fs-1 mb-3 d-block"></i>
                <h3 className="fw-bold mb-2">10,000+</h3>
                <p className="mb-0">Patients Served</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="p-3">
                <i className="bi bi-person-badge fs-1 mb-3 d-block"></i>
                <h3 className="fw-bold mb-2">50+</h3>
                <p className="mb-0">Expert Doctors</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="p-3">
                <i className="bi bi-hospital fs-1 mb-3 d-block"></i>
                <h3 className="fw-bold mb-2">5</h3>
                <p className="mb-0">Clinic Locations</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="p-3">
                <i className="bi bi-award fs-1 mb-3 d-block"></i>
                <h3 className="fw-bold mb-2">15+</h3>
                <p className="mb-0">Years Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="display-5 fw-bold mb-4">Ready to Get Started?</h2>
              <p className="lead text-muted mb-4">
                Join thousands of patients who trust MediConnect for their
                healthcare needs.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <button className="btn btn-primary btn-lg">
                  <i className="bi bi-person-plus me-2"></i>
                  Register Now
                </button>
                <button className="btn btn-outline-primary btn-lg">
                  <i className="bi bi-telephone me-2"></i>
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <div className="container">
          <div className="row">
            <div className="col-md-6 mb-3 mb-md-0">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-hospital me-2"></i>
                MediConnect
              </h5>
              <p className="text-white-50">
                Modern healthcare management system for the digital age.
              </p>
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <h6 className="fw-bold mb-3">Quick Links</h6>
              <ul className="list-unstyled">
                <li>
                  <a href="#" className="text-white-50 text-decoration-none">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white-50 text-decoration-none">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white-50 text-decoration-none">
                    Doctors
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white-50 text-decoration-none">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-md-3">
              <h6 className="fw-bold mb-3">Contact Info</h6>
              <ul className="list-unstyled text-white-50">
                <li>
                  <i className="bi bi-telephone me-2"></i>+1 234 567 890
                </li>
                <li>
                  <i className="bi bi-envelope me-2"></i>info@mediconnect.com
                </li>
                <li>
                  <i className="bi bi-geo-alt me-2"></i>123 Medical Center Dr.
                </li>
              </ul>
            </div>
          </div>
          <hr className="my-4 bg-white opacity-25" />
          <div className="text-center text-white-50">
            <p className="mb-0">
              &copy; 2025 MediConnect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;

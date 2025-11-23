import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
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
                <Link
                  to="/about"
                  className="text-white-50 text-decoration-none"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-white-50 text-decoration-none"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/doctors"
                  className="text-white-50 text-decoration-none"
                >
                  Doctors
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-white-50 text-decoration-none"
                >
                  Contact
                </Link>
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
          <p className="mb-0">&copy; 2025 MediConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !email || !message) {
      toast.error("Please fill out all fields.");
      return;
    }
    if (!emailOk) {
      toast.error("Please provide a valid email address.");
      return;
    }
    toast.success("Thanks! We’ll get back to you shortly.");
    setName("");
    setEmail("");
    setMessage("");
  };
  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <Navbar />
      <div className="container py-5 flex-grow-1">
        <h1 className="display-6">Contact Us</h1>
        <p className="text-muted">We'd love to hear from you.</p>

        <div className="row mt-4 g-4">
          <div className="col-md-7">
            <form onSubmit={onSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Message</label>
                <textarea
                  className="form-control"
                  rows="5"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
            </form>
          </div>
          <div className="col-md-5">
            <div className="p-3 bg-white border rounded-3 shadow-sm h-100">
              <h6 className="fw-bold mb-3">Contact Info</h6>
              <p className="mb-2">
                <i className="bi bi-telephone me-2"></i>+1 234 567 890
              </p>
              <p className="mb-2">
                <i className="bi bi-envelope me-2"></i>info@mediconnect.com
              </p>
              <p className="mb-0">
                <i className="bi bi-geo-alt me-2"></i>123 Medical Center Dr.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Contact;

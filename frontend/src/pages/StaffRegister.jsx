import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const StaffRegister = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    role: "doctor",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    // Doctor specific
    specialization: "",
    license_number: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear doctor-specific fields when role changes
    if (name === "role" && value !== "doctor") {
      setFormData((prev) => ({
        ...prev,
        specialization: "",
        license_number: "",
      }));
    }
  };

  const validateForm = () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.password
    ) {
      setError("Please fill in all required fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.role === "doctor") {
      if (!formData.specialization || !formData.license_number) {
        setError("Specialization and License Number are required for doctors");
        return false;
      }
    }

    return true;
  };

  const getEndpoint = (role) => {
    switch (role) {
      case "doctor":
        return "/doctor/";
      case "nurse":
        return "/nurse/";
      case "receptionist":
        return "/receptionist/";
      case "admin":
        return "/admins/";
      case "manager":
        return "/managers/";
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;

      // Remove doctor-specific fields if not creating a doctor
      if (formData.role !== "doctor") {
        delete registrationData.specialization;
        delete registrationData.license_number;
      }

      const endpoint = getEndpoint(formData.role);

      const response = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(registrationData),
      });

      if (response.success) {
        setSuccess(
          `${
            formData.role.charAt(0).toUpperCase() + formData.role.slice(1)
          } account created successfully!`
        );
        // Reset form
        setFormData({
          role: "doctor",
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          specialization: "",
          license_number: "",
        });

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(response.error?.message || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "doctor":
        return "bi-person-badge";
      case "nurse":
        return "bi-heart-pulse";
      case "receptionist":
        return "bi-person-workspace";
      case "admin":
        return "bi-shield-check";
      case "manager":
        return "bi-shield-check";
      default:
        return "bi-person";
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-9 col-lg-8">
            <div className="card shadow-sm border-0 mt-3">
              <div className="card-body p-5">
                {/* Logo/Title */}
                <div className="text-center mb-4">
                  <i
                    className={`bi ${getRoleIcon(formData.role)} text-primary`}
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h2 className="fw-bold mt-3 mb-2">Staff Registration</h2>
                  <p className="text-muted">Create new staff member accounts</p>
                  <span className="badge bg-warning text-dark">
                    <i className="bi bi-shield-lock me-1"></i>
                    Admin Only
                  </span>
                </div>

                {/* Success Alert */}
                {success && (
                  <div
                    className="alert alert-success d-flex align-items-center"
                    role="alert"
                  >
                    <i className="bi bi-check-circle-fill me-2"></i>
                    <div>{success}</div>
                  </div>
                )}

                {/* Error Alert */}
                {error && (
                  <div
                    className="alert alert-danger d-flex align-items-center"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{error}</div>
                  </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit}>
                  {/* Role Selection */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <i className="bi bi-person-badge me-2"></i>
                      Select Role <span className="text-danger">*</span>
                    </label>
                    <div className="row g-3">
                      <div className="col-6 col-md-3">
                        <input
                          type="radio"
                          className="btn-check"
                          name="role"
                          id="role-doctor"
                          value="doctor"
                          checked={formData.role === "doctor"}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <label
                          className="btn btn-outline-primary w-100"
                          htmlFor="role-doctor"
                        >
                          <i className="bi bi-person-badge d-block fs-3 mb-2"></i>
                          Doctor
                        </label>
                      </div>
                      <div className="col-6 col-md-3">
                        <input
                          type="radio"
                          className="btn-check"
                          name="role"
                          id="role-nurse"
                          value="nurse"
                          checked={formData.role === "nurse"}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <label
                          className="btn btn-outline-success w-100"
                          htmlFor="role-nurse"
                        >
                          <i className="bi bi-heart-pulse d-block fs-3 mb-2"></i>
                          Nurse
                        </label>
                      </div>
                      <div className="col-6 col-md-3">
                        <input
                          type="radio"
                          className="btn-check"
                          name="role"
                          id="role-receptionist"
                          value="receptionist"
                          checked={formData.role === "receptionist"}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <label
                          className="btn btn-outline-info w-100"
                          htmlFor="role-receptionist"
                        >
                          <i className="bi bi-person-workspace d-block fs-3 mb-2"></i>
                          Receptionist
                        </label>
                      </div>

                      <div className="col-6 col-md-3">
                        <input
                          type="radio"
                          className="btn-check"
                          name="role"
                          id="role-manager"
                          value="manager"
                          checked={formData.role === "manager"}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <label
                          className="btn btn-outline-warning w-100"
                          htmlFor="role-manager"
                        >
                          <i className="bi bi-shield-check d-block fs-3 mb-2"></i>
                          Manager
                        </label>
                      </div>

                      <div className="col-6 col-md-12">
                        <input
                          type="radio"
                          className="btn-check"
                          name="role"
                          id="role-admin"
                          value="admin"
                          checked={formData.role === "admin"}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <label
                          className="btn btn-outline-warning w-100"
                          htmlFor="role-admin"
                        >
                          <i className="bi bi-shield-check d-block fs-3 mb-2"></i>
                          Admin
                        </label>
                      </div>
                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* Personal Information */}
                  <h5 className="mb-3">
                    <i className="bi bi-person-vcard me-2"></i>
                    Personal Information
                  </h5>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="first_name"
                        className="form-label fw-semibold"
                      >
                        First Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="last_name"
                        className="form-label fw-semibold"
                      >
                        Last Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      <i className="bi bi-envelope me-2"></i>
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label fw-semibold">
                      <i className="bi bi-telephone me-2"></i>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      placeholder="+48123456789"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  {/* Doctor-specific fields */}
                  {formData.role === "doctor" && (
                    <>
                      <hr className="my-4" />
                      <h5 className="mb-3">
                        <i className="bi bi-file-medical me-2"></i>
                        Professional Information
                      </h5>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="specialization"
                            className="form-label fw-semibold"
                          >
                            Specialization{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="specialization"
                            name="specialization"
                            placeholder="e.g., Cardiology"
                            value={formData.specialization}
                            onChange={handleChange}
                            disabled={loading}
                            required={formData.role === "doctor"}
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="license_number"
                            className="form-label fw-semibold"
                          >
                            License Number{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="license_number"
                            name="license_number"
                            placeholder="MD-12345"
                            value={formData.license_number}
                            onChange={handleChange}
                            disabled={loading}
                            required={formData.role === "doctor"}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <hr className="my-4" />

                  {/* Account Credentials */}
                  <h5 className="mb-3">
                    <i className="bi bi-key me-2"></i>
                    Account Credentials
                  </h5>

                  <div className="mb-3">
                    <label
                      htmlFor="password"
                      className="form-label fw-semibold"
                    >
                      <i className="bi bi-lock me-2"></i>
                      Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        id="password"
                        name="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        <i
                          className={`bi bi-eye${showPassword ? "-slash" : ""}`}
                        ></i>
                      </button>
                    </div>
                    <small className="text-muted">At least 6 characters</small>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="confirmPassword"
                      className="form-label fw-semibold"
                    >
                      <i className="bi bi-lock-fill me-2"></i>
                      Confirm Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus me-2"></i>
                          Create{" "}
                          {formData.role.charAt(0).toUpperCase() +
                            formData.role.slice(1)}{" "}
                          Account
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Info Card */}
            <div className="alert alert-info mt-4 d-flex align-items-start">
              <i className="bi bi-info-circle-fill me-3 fs-4"></i>
              <div>
                <strong>Note:</strong> This page is only accessible to
                administrators. The newly created staff member will receive
                their login credentials and can access their respective
                dashboards.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffRegister;

import React, { useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { useEditableResource } from "../hooks/useEditableResource";

const DoctorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Stabilne wartości początkowe
  const initialValues = useMemo(() => ({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    specialization: "",
    license_number: "",
  }), []);

  // Stabilne mapowanie danych z API
  const mapLoad = useCallback((data) => ({
    first_name: data.user?.first_name || "",
    last_name: data.user?.last_name || "",
    email: data.user?.email || "",
    phone: data.user?.phone || "",
    password: "",
    specialization: data.specialization || "",
    license_number: data.license_number || "",
  }), []);

  // Stabilne budowanie payloadu dla backendu
  const buildPayload = useCallback((f) => ({
    first_name: f.first_name,
    last_name: f.last_name,
    email: f.email,
    phone: f.phone,
    specialization: f.specialization,
    license_number: f.license_number,
    ...(f.password ? { password: f.password } : {}),
  }), []);

  const { form, handleChange, submit, loading, error } = useEditableResource({
    id,
    initialValues,
    loadFn: resourceService.getDoctor,
    mapLoad,
    createFn: resourceService.createDoctor,
    updateFn: resourceService.updateDoctor,
    buildPayload,
    onSuccess: () => navigate("/admin/doctors"),
  });

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">

        {/* Header Tile */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-4">
                <i className={`bi ${id ? "bi-pencil-square" : "bi-person-plus-fill"} text-primary fs-2`}></i>
              </div>
              <div>
                <h1 className="display-6 fw-bold text-dark mb-1">
                  {id ? "Edit Doctor" : "Register New Doctor"}
                </h1>
                <p className="text-muted mb-0">
                  {id ? `Updating medical staff ID: ${id}` : "Enter professional credentials and account details"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="card border-0 shadow-sm bg-white">
          <div className="card-body p-4 p-md-5">
            {error && (
              <div className="alert alert-danger d-flex align-items-center mb-4 border-0 shadow-sm">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={submit}>
              {/* Sekcja 1: Dane osobowe */}
              <h5 className="text-primary mb-4 border-bottom pb-2">Personal Information</h5>
              <div className="row g-4 mb-5">
                <div className="col-md-6">
                  <label className="form-label fw-bold small">First Name</label>
                  <input
                    className="form-control bg-light border-0 py-2"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Last Name</label>
                  <input
                    className="form-control bg-light border-0 py-2"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Email Address</label>
                  <input
                    type="email"
                    className="form-control bg-light border-0 py-2"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Phone</label>
                  <input
                    className="form-control bg-light border-0 py-2"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Sekcja 2: Dane zawodowe */}
              <h5 className="text-primary mb-4 border-bottom pb-2">Professional Credentials</h5>
              <div className="row g-4 mb-5">
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Specialization</label>
                  <input
                    className="form-control bg-light border-0 py-2"
                    name="specialization"
                    placeholder="e.g. Cardiology"
                    value={form.specialization}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small">License Number</label>
                  <input
                    className="form-control bg-light border-0 py-2"
                    name="license_number"
                    placeholder="e.g. MD-123456"
                    value={form.license_number}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold small">
                    Password {id && <span className="fw-normal text-muted">(leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    className="form-control bg-light border-0 py-2"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required={!id}
                  />
                </div>
              </div>

              {/* Akcje */}
              <div className="d-flex justify-content-end gap-3 pt-4">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4 fw-bold text-muted"
                  onClick={() => navigate("/admin/doctors")}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary rounded-pill px-5 shadow-sm fw-bold"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : "Save Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorForm;
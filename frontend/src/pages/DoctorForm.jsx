import React from "react";
import Navbar from "../components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import { resourceService } from "../services/resourceService";
import { useEditableResource } from "../hooks/useEditableResource";

const DoctorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { form, handleChange, submit, loading, error } = useEditableResource({
    id,
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      specialization: "",
      license_number: "",
    },
    loadFn: resourceService.getDoctor,
    mapLoad: (data) => ({
      first_name: data.user?.first_name || "",
      last_name: data.user?.last_name || "",
      email: data.user?.email || "",
      phone: data.user?.phone || "",
      password: "",
      specialization: data.specialization || "",
      license_number: data.license_number || "",
    }),
    createFn: resourceService.createDoctor,
    updateFn: resourceService.updateDoctor,
    buildPayload: (f) => ({
      first_name: f.first_name,
      last_name: f.last_name,
      email: f.email,
      phone: f.phone,
      specialization: f.specialization,
      license_number: f.license_number,
      ...(f.password ? { password: f.password } : {}),
    }),
    onSuccess: () => navigate("/admin/doctors"),
  });

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">{id ? "Edit Doctor" : "Create Doctor"}</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={submit} className="card p-4 mb-4">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">First name</label>
              <input
                name="first_name"
                className="form-control"
                value={form.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Last name</label>
              <input
                name="last_name"
                className="form-control"
                value={form.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              name="email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              name="phone"
              className="form-control"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              Password{" "}
              {id && (
                <small className="text-muted">(leave empty to keep)</small>
              )}
            </label>
            <input
              name="password"
              type="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Specialization</label>
              <input
                name="specialization"
                className="form-control"
                value={form.specialization}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">License number</label>
              <input
                name="license_number"
                className="form-control"
                value={form.license_number}
                onChange={handleChange}
              />
            </div>
          </div>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorForm;

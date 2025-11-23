import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { useEditableResource } from "../hooks/useEditableResource";

const ManagerForm = () => {
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
    },
    loadFn: resourceService.getManager,
    mapLoad: (data) => ({
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      email: data.email || "",
      phone: data.phone || "",
      password: "",
    }),
    createFn: resourceService.createManager,
    updateFn: resourceService.updateManager,
    buildPayload: (f) => ({
      first_name: f.first_name,
      last_name: f.last_name,
      email: f.email,
      phone: f.phone,
      ...(id ? {} : { password: f.password }),
    }),
    onSuccess: () => navigate("/admin/managers"),
  });

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">{id ? "Edit Manager" : "Create Manager"}</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">First Name</label>
            <input
              className="form-control"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Last Name</label>
            <input
              className="form-control"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              className="form-control"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          {!id && (
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="btn btn-link ms-2"
            onClick={() => navigate("/admin/managers")}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManagerForm;

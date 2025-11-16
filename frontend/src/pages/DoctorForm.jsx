import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import { useParams, useNavigate } from "react-router-dom";

const DoctorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    specialization: "",
    license_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const res = await apiRequest(`/doctor/${id}`, { method: "GET" });
        const data = res.success ? res.data : res;
        setForm({
          first_name: data.user?.first_name || "",
          last_name: data.user?.last_name || "",
          email: data.user?.email || "",
          phone: data.user?.phone || "",
          password: "",
          specialization: data.specialization || "",
          license_number: data.license_number || "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load doctor");
      }
    };
    load();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        password: form.password || undefined,
        specialization: form.specialization,
        license_number: form.license_number,
      };

      if (id) {
        const res = await apiRequest(`/doctor/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (res.success) navigate("/admin/doctors");
      } else {
        const res = await apiRequest("/doctor/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (res.success) navigate("/admin/doctors");
      }
    } catch (err) {
      console.error(err);
      setError("Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">{id ? "Edit Doctor" : "Create Doctor"}</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="card p-4">
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

          <div>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorForm;

import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import { useParams, useNavigate } from "react-router-dom";

const PatientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    pesel: "",
    birth_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const res = await apiRequest(`/patients/${id}`, { method: "GET" });
        const data = res.success ? res.data : res;
        setForm({
          first_name: data.user?.first_name || "",
          last_name: data.user?.last_name || "",
          email: data.user?.email || "",
          phone: data.user?.phone || "",
          password: "",
          pesel: data.pesel || "",
          birth_date: data.birth_date || "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load patient");
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
        pesel: form.pesel,
        birth_date: form.birth_date,
      };

      if (id) {
        const res = await apiRequest(`/patients/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (res.success) navigate("/admin/patients");
      } else {
        // Create patient via admin endpoint may be /patients/register (requires receptionist/admin)
        const res = await apiRequest("/patients/register", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (res.success) navigate("/admin/patients");
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
        <h2 className="mb-4">{id ? "Edit Patient" : "Create Patient"}</h2>
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
              <label className="form-label">PESEL</label>
              <input
                name="pesel"
                className="form-control"
                value={form.pesel}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Birth date</label>
              <input
                name="birth_date"
                type="date"
                className="form-control"
                value={form.birth_date}
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

export default PatientForm;

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
        setLoading(true);

        const [patientRes, usersRes] = await Promise.all([
          apiRequest(`/patients/${id}`),
          apiRequest("/users"),
        ]);

        const patient = patientRes.success ? patientRes.data : patientRes;
        const users = usersRes?.data || [];

        const user = users.find((u) => u.user_id === patient.user_id);

        setForm({
          first_name: user?.first_name || "",
          last_name: user?.last_name || "",
          email: user?.email || "",
          phone: user?.phone || "",
          password: "",
          pesel: patient.pesel || "",
          birth_date: patient.birth_date || "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load patient");
      } finally {
        setLoading(false);
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
        role: "patient",
      };

      if (id) {
        const res = await apiRequest(`/patients/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (res.success) navigate("/admin/patients");
      } else {
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
        <div className="row justify-content-center">
          <div className="col-md-9 col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-5">

                <div className="text-center mb-4">
                  <i
                    className="bi bi-person-circle text-primary"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h2 className="fw-bold mt-3 mb-2">
                    {id ? "Edit Patient" : "Register Patient"}
                  </h2>
                  <p className="text-muted">Fill in patient information</p>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="card p-4">
                  <h5 className="mb-3">
                    <i className="bi bi-person-vcard me-2"></i>
                    Personal Information
                  </h5>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        First Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-envelope me-2"></i>Email
                    </label>
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
                    <label className="form-label fw-semibold">
                      <i className="bi bi-telephone me-2"></i>Phone
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">PESEL</label>
                      <input
                        type="text"
                        className="form-control"
                        name="pesel"
                        value={form.pesel}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        Birth Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="birth_date"
                        value={form.birth_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-lock me-2"></i>Password{" "}
                      {id && (
                        <small className="text-muted">(leave empty to keep)</small>
                      )}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Patient"}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;

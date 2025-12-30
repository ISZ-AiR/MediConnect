import React, { useMemo } from "react"; // Dodano useMemo
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { useEditableResource } from "../hooks/useEditableResource";

const ManagerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Stabilizujemy initialValues za pomocą useMemo
  const initialValues = useMemo(() => ({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
  }), []);

  // 2. Stabilizujemy funkcję mapLoad - to ona najczęściej wywołuje pętlę w useEffect
  const mapLoad = useMemo(() => (data) => ({
    first_name: data.first_name || "",
    last_name: data.last_name || "",
    email: data.email || "",
    phone: data.phone || "",
    password: "",
  }), []);

  const { form, handleChange, submit, loading, error } = useEditableResource({
    id,
    initialValues,
    loadFn: resourceService.getManager,
    mapLoad,
    createFn: resourceService.createManager,
    updateFn: resourceService.updateManager,
    buildPayload: (f) => {
      const payload = {
        first_name: f.first_name,
        last_name: f.last_name,
        email: f.email,
        phone: f.phone,
      };
      if (!id) payload.password = f.password;
      return payload;
    },
    onSuccess: () => navigate("/admin/managers"),
  });

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      {/* Reszta kodu UI pozostaje bez zmian (ten ładniejszy widok) */}
      <div className="container py-5">
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle me-4">
                <i className={`bi ${id ? "bi-pencil-square" : "bi-person-plus-fill"} text-success fs-2`}></i>
              </div>
              <div>
                <h1 className="display-6 fw-bold text-dark mb-1">{id ? "Edit Manager" : "Create New Manager"}</h1>
                <p className="text-muted mb-0">Manage system administration accounts</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm bg-white p-4">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={submit}>
             <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-bold small">First Name</label>
                  <input className="form-control bg-light border-0 py-2" name="first_name" value={form.first_name} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Last Name</label>
                  <input className="form-control bg-light border-0 py-2" name="last_name" value={form.last_name} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Email</label>
                  <input type="email" className="form-control bg-light border-0 py-2" name="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Phone</label>
                  <input className="form-control bg-light border-0 py-2" name="phone" value={form.phone} onChange={handleChange} />
                </div>
                {!id && (
                  <div className="col-12">
                    <label className="form-label fw-bold small">Password</label>
                    <input type="password" className="form-control bg-light border-0 py-2" name="password" value={form.password} onChange={handleChange} required />
                  </div>
                )}
             </div>
             <div className="d-flex justify-content-end gap-3 mt-4">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => navigate("/admin/managers")}>Cancel</button>
                <button className="btn btn-success rounded-pill px-5 shadow-sm fw-bold" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Manager"}
                </button>
             </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManagerForm;
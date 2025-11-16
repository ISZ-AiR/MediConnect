import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";

const ReferralForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    visit_id: "",
    patient_id: "",
    examination_id: "",
    doctor_id: "",
    referral_date: "",
    notes: "",
    is_completed: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await resourceService.getReferral(id);
        if (data)
          setForm({
            visit_id: data.visit_id || "",
            patient_id: data.patient_id || "",
            examination_id: data.examination_id || "",
            doctor_id: data.doctor_id || "",
            referral_date: data.referral_date || "",
            notes: data.notes || "",
            is_completed: data.is_completed || false,
          });
      } catch (err) {
        console.error(err);
        setError("Failed to load referral");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const payload = {
        visit_id: Number(form.visit_id),
        patient_id: Number(form.patient_id),
        examination_id: Number(form.examination_id),
        doctor_id: Number(form.doctor_id),
        referral_date: form.referral_date,
        notes: form.notes,
        is_completed: !!form.is_completed,
      };
      if (id) await resourceService.updateReferral(id, payload);
      else await resourceService.createReferral(payload);
      navigate("/admin/referrals");
    } catch (err) {
      console.error(err);
      setError("Failed to save referral");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">{id ? "Edit Referral" : "Create Referral"}</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Visit ID</label>
            <input
              type="number"
              className="form-control"
              name="visit_id"
              value={form.visit_id}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Patient ID</label>
            <input
              type="number"
              className="form-control"
              name="patient_id"
              value={form.patient_id}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Examination ID</label>
            <input
              type="number"
              className="form-control"
              name="examination_id"
              value={form.examination_id}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Doctor ID</label>
            <input
              type="number"
              className="form-control"
              name="doctor_id"
              value={form.doctor_id}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Referral Date</label>
            <input
              type="date"
              className="form-control"
              name="referral_date"
              value={form.referral_date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              name="notes"
              value={form.notes}
              onChange={handleChange}
            ></textarea>
          </div>
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              name="is_completed"
              checked={form.is_completed}
              onChange={handleChange}
              id="is_completed"
            />
            <label className="form-check-label" htmlFor="is_completed">
              Completed
            </label>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="btn btn-link ms-2"
            onClick={() => navigate("/admin/referrals")}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReferralForm;

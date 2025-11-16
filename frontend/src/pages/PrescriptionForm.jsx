import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";

const PrescriptionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    visit_id: "",
    medication: "",
    dosage: "",
    instruction: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await resourceService.getPrescription(id);
        if (data)
          setForm({
            visit_id: data.visit_id || "",
            medication: data.medication || "",
            dosage: data.dosage || "",
            instruction: data.instruction || "",
          });
      } catch (err) {
        console.error(err);
        setError("Failed to load prescription");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const payload = {
        visit_id: Number(form.visit_id),
        medication: form.medication,
        dosage: form.dosage,
        instruction: form.instruction,
      };
      if (id) await resourceService.updatePrescription(id, payload);
      else await resourceService.createPrescription(payload);
      navigate("/admin/prescriptions");
    } catch (err) {
      console.error(err);
      setError("Failed to save prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">
          {id ? "Edit Prescription" : "Create Prescription"}
        </h2>
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
            <label className="form-label">Medication</label>
            <input
              className="form-control"
              name="medication"
              value={form.medication}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Dosage</label>
            <input
              className="form-control"
              name="dosage"
              value={form.dosage}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Instruction</label>
            <textarea
              className="form-control"
              name="instruction"
              value={form.instruction}
              onChange={handleChange}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="btn btn-link ms-2"
            onClick={() => navigate("/admin/prescriptions")}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionForm;

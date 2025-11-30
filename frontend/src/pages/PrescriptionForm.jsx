import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FormField from "../components/FormField";
import { resourceService } from "../services/resourceService";

const PrescriptionForm = () => {
  const { visit_id, prescription_id } = useParams();
  const isEdit = !!prescription_id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    medication: "",
    dosage: "",
    instruction: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return;
      setLoading(true);
      try {
        const data = await resourceService.getPrescription(prescription_id);
        setForm({
          medication: data.medication,
          dosage: data.dosage,
          instruction: data.instruction,
        });
      } catch (err) {
        setError("Failed to load prescription");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isEdit, prescription_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        await resourceService.updatePrescription(prescription_id, form);
      } else {
        await resourceService.createPrescription(form, visit_id);
      }
      navigate(`/doctor/visits/${visit_id}`);
    } catch (err) {
      setError("Failed to save prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="card shadow-sm border-0 p-5 text-center">
          <i className="bi bi-capsule text-warning" style={{ fontSize: "3rem" }}></i>
          <h2 className="fw-bold mt-3 mb-3">{isEdit ? "Edit Prescription" : "Add Prescription"}</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="text-start mt-4">
            <FormField
              name="medication"
              label="Medication"
              value={form.medication}
              onChange={handleChange}
              required
            />
            <FormField
              name="dosage"
              label="Dosage"
              value={form.dosage}
              onChange={handleChange}
              required
            />
            <FormField
              type="textarea"
              name="instruction"
              label="Instruction"
              value={form.instruction}
              onChange={handleChange}
            />
          </div>

          <div className="mt-4 d-grid gap-2">
            <button className="btn btn-warning btn-lg" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
            <button className="btn btn-outline-secondary btn-lg" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionForm;

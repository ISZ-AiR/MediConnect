import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FormField from "../components/FormField";
import { resourceService } from "../services/resourceService";
import { useState, useEffect } from "react";

const PrescriptionForm = () => {
  const { visit_id } = useParams();
  console.log(visit_id)
  const navigate = useNavigate();
  const [form, setForm] = useState({ medication: "", dosage: "", instruction: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exists, setExists] = useState(false);
  const [prescriptionId, setPrescriptionId] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await resourceService.getPrescriptionByVisit(visit_id);
        if (data) {
          setForm({
            medication: data.medication || "",
            dosage: data.dosage || "",
            instruction: data.instruction || "",
          });
          setExists(true);
          setPrescriptionId(data.prescription_id);
        }
      } catch (err) {
        if (!(err.response && err.response.status === 404)) {
          setError("Failed to load prescription");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [visit_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (exists) {
        await resourceService.updatePrescription(prescriptionId, form);
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
          <h2 className="fw-bold mt-3 mb-3">{exists ? "Edit Prescription" : "Add Prescription"}</h2>

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
            <button className="btn btn-outline-secondary btn-lg" onClick={() => navigate(`/doctor/visits/${visit_id}`)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionForm;

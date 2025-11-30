import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FormField from "../components/FormField";
import { resourceService } from "../services/resourceService";

const DiagnosisForm = () => {
  const { visit_id, diagnosis_id } = useParams();
  const isEdit = !!diagnosis_id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    disease_id: "",
    diagnosis_date: "",
    doctor_notes: "",
  });

  const [diseases, setDiseases] = useState([]);
  const [patientId, setPatientId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const diseasesRes = await resourceService.listDiseases();
        setDiseases(diseasesRes);

        const visit = await resourceService.getVisit(visit_id);
        setPatientId(visit.patient_id);

        if (isEdit) {
          const d = await resourceService.getDiagnosis(diagnosis_id);
          setForm({
            disease_id: d.disease_id,
            diagnosis_date: d.diagnosis_date,
            doctor_notes: d.doctor_notes,
          });
        } else {
          const today = new Date().toISOString().split("T")[0];
          setForm(prev => ({ ...prev, diagnosis_date: today }));
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isEdit, diagnosis_id, visit_id]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!patientId) {
      setError("Patient not loaded");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      ...form,
      patient_id: patientId,
    };

    try {
      if (isEdit) {
        await resourceService.updateDiagnosis(diagnosis_id, payload);
      } else {
        await resourceService.createDiagnosis(visit_id, payload);
      }

      navigate(`/doctor/visits/${visit_id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to save diagnosis");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="card shadow-sm border-0 p-5 text-center">
          <i className="bi bi-heart-pulse text-danger" style={{ fontSize: "3rem" }}></i>

          <h2 className="fw-bold mt-3 mb-3">
            {isEdit ? "Edit Diagnosis" : "Add Diagnosis"}
          </h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="text-start mt-4">

            {/* Disease dropdown */}
            <div className="mb-3">
              <label className="form-label fw-bold">Disease</label>
              <select
                name="disease_id"
                value={form.disease_id}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select disease...</option>
                {diseases.map((d) => (
                  <option key={d.disease_id} value={d.disease_id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <FormField
              type="date"
              name="diagnosis_date"
              label="Diagnosis Date"
              value={form.diagnosis_date}
              onChange={handleChange}
              required
            />

            {/* Notes */}
            <FormField
              type="textarea"
              name="doctor_notes"
              label="Doctor Notes"
              value={form.doctor_notes}
              onChange={handleChange}
              required
            />

          </div>

          {/* Buttons */}
          <div className="mt-4 d-grid gap-2">
            <button
              className="btn btn-danger btn-lg"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              className="btn btn-outline-secondary btn-lg"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DiagnosisForm;

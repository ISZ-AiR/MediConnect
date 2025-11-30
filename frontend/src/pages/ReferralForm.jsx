import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FormField from "../components/FormField";
import { resourceService } from "../services/resourceService";

const ReferralForm = () => {
  const { visit_id, referral_id } = useParams();
  const isEdit = !!referral_id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    examination_id: "",
    referral_date: "",
    notes: "",
    is_completed: false,
  });
  const [visitData, setVisitData] = useState({
    patient_id: "",
    doctor_id: "",
  });
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const visit = await resourceService.getDetailedVisit(visit_id);
        setVisitData({
          patient_id: visit.patient.patient_id,
          doctor_id: visit.doctor.doctor_id,
        });

        if (isEdit) {
          const existingReferral = await resourceService.getReferral(referral_id);
          if (existingReferral) {
            setForm({
              examination_id: existingReferral.examination_id || "",
              referral_date: existingReferral.referral_date || "",
              notes: existingReferral.notes || "",
              is_completed: existingReferral.is_completed || false,
            });
          }
        }

        const exams = await resourceService.listExaminations();
        setExaminations(exams);
      } catch (err) {
        console.error("Referral load error:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [visit_id, referral_id, isEdit]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        visit_id: Number(visit_id),
        patient_id: Number(visitData.patient_id),
        doctor_id: Number(visitData.doctor_id),
        examination_id: Number(form.examination_id),
        referral_date: form.referral_date,
        notes: form.notes,
        is_completed: !!form.is_completed,
      };

      if (isEdit) {
        await resourceService.updateReferral(referral_id, payload);
      } else {
        await resourceService.createReferral(payload, visit_id);
      }

      navigate(`/doctor/visits/${visit_id}`);
    } catch (err) {
      setError("Failed to save referral");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="card shadow-sm border-0 p-5 text-center">
          <i className="bi bi-file-earmark-medical text-warning" style={{ fontSize: "3rem" }}></i>
          <h2 className="fw-bold mt-3 mb-3">{isEdit ? "Edit Referral" : "Add Referral"}</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="text-start mt-4">
            <div className="mb-3">
              <label htmlFor="examination_id" className="form-label">Examination</label>
              <select
                id="examination_id"
                name="examination_id"
                className="form-select"
                value={form.examination_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Examination</option>
                {examinations.map(exam => (
                  <option key={exam.examination_id} value={exam.examination_id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>

            <FormField
              type="date"
              name="referral_date"
              label="Referral Date"
              value={form.referral_date}
              onChange={handleChange}
              required
            />

            <FormField
              type="textarea"
              name="notes"
              label="Notes"
              value={form.notes}
              onChange={handleChange}
            />

            <FormField
              type="checkbox"
              name="is_completed"
              label="Completed"
              value={form.is_completed}
              onChange={handleChange}
              className="mb-3"
            />
          </div>

          <div className="mt-4 d-grid gap-2">
            <button
              className="btn btn-warning btn-lg"
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

export default ReferralForm;

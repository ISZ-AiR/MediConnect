import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { useEditableResource } from "../hooks/useEditableResource";
import FormField from "../components/FormField";

const ReferralForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { form, handleChange, submit, loading, error } = useEditableResource({
    id,
    initialValues: {
      visit_id: "",
      patient_id: "",
      examination_id: "",
      doctor_id: "",
      referral_date: "",
      notes: "",
      is_completed: false,
    },
    loadFn: resourceService.getReferral,
    mapLoad: (d) => ({
      visit_id: d.visit_id || "",
      patient_id: d.patient_id || "",
      examination_id: d.examination_id || "",
      doctor_id: d.doctor_id || "",
      referral_date: d.referral_date || "",
      notes: d.notes || "",
      is_completed: d.is_completed || false,
    }),
    createFn: resourceService.createReferral,
    updateFn: resourceService.updateReferral,
    buildPayload: (f) => ({
      visit_id: Number(f.visit_id),
      patient_id: Number(f.patient_id),
      examination_id: Number(f.examination_id),
      doctor_id: Number(f.doctor_id),
      referral_date: f.referral_date,
      notes: f.notes,
      is_completed: !!f.is_completed,
    }),
    onSuccess: () => navigate("/admin/referrals"),
  });

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">{id ? "Edit Referral" : "Create Referral"}</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={submit}>
          <FormField
            type="number"
            name="visit_id"
            label="Visit ID"
            value={form.visit_id}
            onChange={handleChange}
            required
          />
          <FormField
            type="number"
            name="patient_id"
            label="Patient ID"
            value={form.patient_id}
            onChange={handleChange}
            required
          />
          <FormField
            type="number"
            name="examination_id"
            label="Examination ID"
            value={form.examination_id}
            onChange={handleChange}
            required
          />
          <FormField
            type="number"
            name="doctor_id"
            label="Doctor ID"
            value={form.doctor_id}
            onChange={handleChange}
            required
          />
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

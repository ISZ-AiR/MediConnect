import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { useEditableResource } from "../hooks/useEditableResource";
import FormField from "../components/FormField";

const PrescriptionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { form, handleChange, submit, loading, error } = useEditableResource({
    id,
    initialValues: {
      visit_id: "",
      medication: "",
      dosage: "",
      instruction: "",
    },
    loadFn: resourceService.getPrescription,
    mapLoad: (d) => ({
      visit_id: d.visit_id || "",
      medication: d.medication || "",
      dosage: d.dosage || "",
      instruction: d.instruction || "",
    }),
    createFn: resourceService.createPrescription,
    updateFn: resourceService.updatePrescription,
    buildPayload: (f) => ({
      visit_id: Number(f.visit_id),
      medication: f.medication,
      dosage: f.dosage,
      instruction: f.instruction,
    }),
    onSuccess: () => navigate("/admin/prescriptions"),
  });

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">
          {id ? "Edit Prescription" : "Create Prescription"}
        </h2>
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

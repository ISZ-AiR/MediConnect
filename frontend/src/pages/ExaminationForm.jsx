import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { useEditableResource } from "../hooks/useEditableResource";
import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";

const ExaminationForm = () => {
  const { user: authUser } = useAuth();
  const rolePrefix = authUser?.role ? `/${authUser.role}` : "";
  const pathVar = `${rolePrefix}/examinations`;

  const { id } = useParams();
  const navigate = useNavigate();
  const { form, handleChange, submit, loading, error } = useEditableResource({
    id,
    initialValues: { name: "", description: "", type: "" },
    loadFn: resourceService.getExamination,
    mapLoad: (d) => ({
      name: d.name || "",
      description: d.description || "",
      type: d.type || "",
    }),
    createFn: resourceService.createExamination,
    updateFn: resourceService.updateExamination,
    onSuccess: () => navigate(pathVar),
  });

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">
          {id ? "Edit Examination" : "Create Examination"}
        </h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={submit}>
          <FormField
            name="name"
            label="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <FormField
            name="type"
            label="Type"
            value={form.type}
            onChange={handleChange}
            required
          />
          <FormField
            type="textarea"
            name="description"
            label="Description"
            value={form.description}
            onChange={handleChange}
            required
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="btn btn-link ms-2"
            onClick={() => navigate(pathVar)}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExaminationForm;

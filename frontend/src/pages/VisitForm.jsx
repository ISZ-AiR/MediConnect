import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";
import { useEditableResource } from "../hooks/useEditableResource";
import FormField from "../components/FormField";

const VisitForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nurses, setNurses] = useState([]);

  const { form, handleChange, submit, loading, error } = useEditableResource({
    id,
    initialValues: {
      reservation_id: "",
      visit_note: "",
      visit_date: "",
      nurse_id: "",
    },
    loadFn: resourceService.getVisit,
    mapLoad: (d) => ({
      reservation_id: d.reservation_id || "",
      visit_note: d.visit_note || "",
      visit_date: d.visit_date || "",
      nurse_id: d.nurse_id || "",
    }),
    createFn: resourceService.createVisit,
    updateFn: resourceService.updateVisit,
    buildPayload: (f) => ({
      reservation_id: Number(f.reservation_id),
      visit_note: f.visit_note,
      visit_date: f.visit_date,
      nurse_id: f.nurse_id ? Number(f.nurse_id) : null,
    }),
    onSuccess: () => navigate("/receptionist/visits"),
  });

  useEffect(() => {
    const loadNurses = async () => {
      try {
        const [nursesRes, usersRes] = await Promise.all([
          apiRequest("/nurse"),
          apiRequest("/users"),
        ]);
        const usersData = usersRes?.data || [];
        const nursesData = (nursesRes?.data || []).map((n) => {
          const user = usersData.find((u) => u.user_id === n.user_id);
          return {
            ...n,
            label: user
              ? `${n.nurse_id} – ${user.first_name} ${user.last_name}`
              : n.nurse_id,
          };
        });
        setNurses(nursesData);
      } catch (err) {
        console.error(err);
      }
    };
    loadNurses();
  }, []);

  return (
    <div className="min-vh-100 bg-light">
      {" "}
      <Navbar />{" "}
      <div className="container py-5">
        {" "}
        <div className="row justify-content-center">
          {" "}
          <div className="col-md-8 col-lg-6">
            {" "}
            <div className="card shadow-sm border-0">
              {" "}
              <div className="card-body p-5">
                {" "}
                <div className="text-center mb-4">
                  <i
                    className="bi bi-calendar-plus text-warning"
                    style={{ fontSize: "3rem" }}
                  ></i>{" "}
                  <h2 className="fw-bold mt-3">
                    {id ? "Edit Visit" : "Create Visit"}
                  </h2>{" "}
                  <p className="text-muted">Fill in visit details</p>{" "}
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={submit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      <i className="bi bi-person-lines-fill me-2"></i>Nurse
                    </label>
                    <select
                      className="form-select"
                      name="nurse_id"
                      value={form.nurse_id}
                      onChange={handleChange}
                    >
                      <option value="">Select a nurse</option>
                      {nurses.map((n) => (
                        <option key={n.nurse_id} value={n.nurse_id}>
                          {n.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <FormField
                    type="textarea"
                    name="visit_note"
                    label={
                      <>
                        <i className="bi bi-journal-text me-2"></i>Notes
                      </>
                    }
                    value={form.visit_note}
                    onChange={handleChange}
                  />
                  <FormField
                    type="date"
                    name="visit_date"
                    label={
                      <>
                        <i className="bi bi-calendar-event me-2"></i>Visit Date
                      </>
                    }
                    value={form.visit_date}
                    onChange={handleChange}
                    required
                  />

                  <div className="d-grid gap-3 mt-4">
                    <button
                      type="submit"
                      className="btn btn-warning btn-lg"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg"
                      onClick={() => navigate("/receptionist/visits")}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitForm;

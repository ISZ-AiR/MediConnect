import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";

const VisitForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    reservation_id: "",
    visit_note: "",
    visit_date: "",
    nurse_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await resourceService.getVisit(id);
        if (data) {
          setForm({
            reservation_id: data.reservation_id || "",
            visit_note: data.visit_note || "",
            visit_date: data.visit_date || "",
            nurse_id: data.nurse_id || "",
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load visit");
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
        reservation_id: Number(form.reservation_id),
        visit_note: form.visit_note,
        visit_date: form.visit_date,
        nurse_id: form.nurse_id ? Number(form.nurse_id) : null,
      };

      if (id) {
        await resourceService.updateVisit(id, payload);
      } else {
        await resourceService.createVisit(payload);
      }
      navigate("/admin/visits");
    } catch (err) {
      console.error(err);
      setError("Failed to save visit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">{id ? "Edit Visit" : "Create Visit"}</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Reservation ID</label>
            <input
              type="number"
              className="form-control"
              name="reservation_id"
              value={form.reservation_id}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Visit Date</label>
            <input
              type="date"
              className="form-control"
              name="visit_date"
              value={form.visit_date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Nurse ID</label>
            <input
              type="number"
              className="form-control"
              name="nurse_id"
              value={form.nurse_id}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              name="visit_note"
              value={form.visit_note}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="btn btn-link ms-2"
            onClick={() => navigate("/admin/visits")}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default VisitForm;

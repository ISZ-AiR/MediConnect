import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";

const VisitForm = () => {
const { id } = useParams();
const navigate = useNavigate();

const [form, setForm] = useState({
reservation_id: "",
visit_note: "",
visit_date: "",
nurse_id: "",
});

const [nurses, setNurses] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
const load = async () => {
try {
setLoading(true);


    // Pobranie wizyty (jeśli edycja)
    if (id) {
      const data = await resourceService.getVisit(id);
      if (data) {
        setForm({
          reservation_id: data.reservation_id || "",
          visit_note: data.visit_note || "",
          visit_date: data.visit_date || "",
          nurse_id: data.nurse_id || "",
        });
      }
    }

    // Pobranie pielęgniarek i użytkowników
    const [nursesRes, usersRes] = await Promise.all([
      apiRequest("/nurse"),
      apiRequest("/users"),
    ]);
    const usersData = usersRes?.data || [];
    const nursesData = (nursesRes?.data || []).map(n => {
      const user = usersData.find(u => u.user_id === n.user_id);
      return { ...n, label: user ? `${n.nurse_id} – ${user.first_name} ${user.last_name}` : n.nurse_id };
    });
    setNurses(nursesData);
  } catch (err) {
    console.error(err);
    setError("Failed to load data");
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
  navigate("/receptionist/visits");
} catch (err) {
  console.error(err);
  setError("Failed to save visit");
} finally {
  setLoading(false);
}


};

return ( <div className="min-vh-100 bg-light"> <Navbar /> <div className="container py-5"> <div className="row justify-content-center"> <div className="col-md-8 col-lg-6"> <div className="card shadow-sm border-0"> <div className="card-body p-5"> <div className="text-center mb-4">
<i className="bi bi-calendar-plus text-warning" style={{ fontSize: "3rem" }}></i> <h2 className="fw-bold mt-3">{id ? "Edit Visit" : "Create Visit"}</h2> <p className="text-muted">Fill in visit details</p> </div>


            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
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
                  {nurses.map(n => (
                    <option key={n.nurse_id} value={n.nurse_id}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  <i className="bi bi-journal-text me-2"></i>Notes
                </label>
                <textarea
                  className="form-control"
                  name="visit_note"
                  value={form.visit_note}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  <i className="bi bi-calendar-event me-2"></i>Visit Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  name="visit_date"
                  value={form.visit_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="d-grid gap-3 mt-4">
                <button type="submit" className="btn btn-warning btn-lg" disabled={loading}>
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

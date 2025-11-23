import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { Typeahead } from "react-bootstrap-typeahead";

const ScheduleForm = () => {
const { id } = useParams();
const navigate = useNavigate();
const [form, setForm] = useState({
doctor_id: "",
schedule_date: "",
start_time: "",
end_time: "",
});
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [success, setSuccess] = useState("");
const [doctors, setDoctors] = useState([]);

useEffect(() => {
const loadSchedule = async () => {
try {
setLoading(true);
const [sched, doctorsResp] = await Promise.all([
id ? resourceService.getSchedule(id) : Promise.resolve(null),
resourceService.listDoctors(),
]);

    setDoctors(doctorsResp || []);

    if (sched) {
      setForm({
        doctor_id: sched.doctor_id || "",
        schedule_date: sched.schedule_date || "",
        start_time: sched.start_time || "",
        end_time: sched.end_time || "",
      });
    }
  } catch (err) {
    console.error(err);
    setError("Failed to load data");
  } finally {
    setLoading(false);
  }
};
loadSchedule();


}, [id]);

const handleChange = (e) => {
const { name, value } = e.target;
setForm((prev) => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e) => {
e.preventDefault();
setError(null);
setSuccess("");
try {
setLoading(true);
const payload = {
doctor_id: Number(form.doctor_id),
schedule_date: form.schedule_date,
start_time: form.start_time,
end_time: form.end_time,
};

  if (id) {
    await resourceService.updateSchedule(id, payload);
    setSuccess("Schedule updated successfully!");
  } else {
    await resourceService.createSchedule(payload);
    setSuccess("Schedule created successfully!");
    setForm({
      doctor_id: "",
      schedule_date: "",
      start_time: "",
      end_time: "",
    });
  }
} catch (err) {
  console.error(err);
  setError("Failed to save schedule");
} finally {
  setLoading(false);
}


};

return ( <div className="min-vh-100 bg-light"> <Navbar /> <div className="container py-5"> <div className="row justify-content-center"> <div className="col-md-8 col-lg-6"> <div className="card shadow-sm border-0"> <div className="card-body p-5">
{/* Header */} <div className="text-center mb-4">
<i className="bi bi-calendar-event text-primary" style={{ fontSize: "3rem" }}></i> <h2 className="fw-bold mt-3 mb-2">{id ? "Edit Schedule" : "Create Schedule"}</h2> <p className="text-muted">Manage doctor's schedule</p> </div>

            {/* Alerts */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{error}</div>
              </div>
            )}
            {success && (
              <div className="alert alert-success d-flex align-items-center" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                <div>{success}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Doctor */}
              <div className="mb-3 d-flex align-items-center">
                <i className="bi bi-person-badge fs-4 me-2 text-primary"></i>
                <div className="w-100 d-flex flex-column">
                  <label className="form-label mb-1">Doctor</label>
                  <Typeahead
                    id="doctor"
                    labelKey={(d) => `${d.first_name} ${d.last_name}`}
                    options={doctors}
                    selected={form.doctor_id ? doctors.filter(d => d.doctor_id === Number(form.doctor_id)) : []}
                    onChange={(selected) => setForm(prev => ({ ...prev, doctor_id: selected[0]?.doctor_id || "" }))}
                    placeholder="Select doctor..."
                    allowNew={false}
                    className="w-100"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="mb-3 d-flex align-items-center">
                <i className="bi bi-calendar-date fs-4 me-2 text-primary"></i>
                <div className="w-100 d-flex flex-column">
                  <label className="form-label mb-1">Date</label>
                  <input
                    type="date"
                    className="form-control border-primary w-100"
                    name="schedule_date"
                    value={form.schedule_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Start Time */}
              <div className="mb-3 d-flex align-items-center">
                <i className="bi bi-clock fs-4 me-2 text-primary"></i>
                <div className="w-100 d-flex flex-column">
                  <label className="form-label mb-1">Start Time</label>
                  <input
                    type="time"
                    className="form-control border-primary w-100"
                    name="start_time"
                    value={form.start_time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* End Time */}
              <div className="mb-3 d-flex align-items-center">
                <i className="bi bi-clock-fill fs-4 me-2 text-primary"></i>
                <div className="w-100 d-flex flex-column">
                  <label className="form-label mb-1">End Time</label>
                  <input
                    type="time"
                    className="form-control border-primary w-100"
                    name="end_time"
                    value={form.end_time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="d-grid">
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? "Saving..." : <><i className="bi bi-save me-2"></i>Save Schedule</>}
                </button>
                <button
                  type="button"
                  className="btn btn-link mt-2"
                  onClick={() => navigate("/receptionist/schedules")}
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

export default ScheduleForm;

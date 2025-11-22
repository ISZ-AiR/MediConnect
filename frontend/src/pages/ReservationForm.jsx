import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";

const ReservationForm = () => {
const { id } = useParams();
const navigate = useNavigate();

const [form, setForm] = useState({
patient_id: "",
doctor_id: "",
nurse_id: "",
reservation_time: "",
});
const [patients, setPatients] = useState([]);
const [doctors, setDoctors] = useState([]);
const [nurses, setNurses] = useState([]);
const [schedules, setSchedules] = useState([]);
const [availableSlots, setAvailableSlots] = useState([]);
const [loading, setLoading] = useState(false);
const [loadingDropdowns, setLoadingDropdowns] = useState(true);
const [error, setError] = useState(null);

const [selectedDate, setSelectedDate] = useState("");
const [selectedSlot, setSelectedSlot] = useState("");

useEffect(() => {
const loadDropdowns = async () => {
try {
const [patientsRes, doctorsRes, nursesRes, usersRes] = await Promise.all([
apiRequest("/patients"),
apiRequest("/doctor"),
apiRequest("/nurse"),
apiRequest("/users"),
]);
const usersData = usersRes.data || [];
const usersMap = new Map(usersData.map(u => [u.user_id, u]));


    setPatients(
      (patientsRes.data || []).map(p => ({ ...p, user: usersMap.get(p.user_id) }))
    );
    setDoctors(
      (doctorsRes.data || []).map(d => ({ ...d, user: usersMap.get(d.user_id) }))
    );
    setNurses(
      (nursesRes.data || []).map(n => ({ ...n, user: usersMap.get(n.user_id) }))
    );
  } catch (err) {
    console.error(err);
    setError("Failed to load dropdowns");
  } finally {
    setLoadingDropdowns(false);
  }
};
loadDropdowns();


}, []);

useEffect(() => {
const loadSchedules = async () => {
try {
const res = await apiRequest("/schedules");
setSchedules(res.data || []);
} catch (err) {
console.error("Failed to load schedules", err);
}
};
loadSchedules();
}, []);

useEffect(() => {
const loadReservation = async () => {
if (!id) return;
try {
const res = await apiRequest(`/reservation/${id}`, { method: "GET" });
const data = res.success ? res.data : res;
setForm({
patient_id: data.patient_id,
doctor_id: data.doctor_id,
nurse_id: data.nurse_id,
reservation_time: data.reservation_time,
});
if (data.reservation_time) {
const dt = new Date(data.reservation_time);
setSelectedDate(dt.toISOString().split("T")[0]);
setSelectedSlot(data.reservation_time);
}
} catch (err) {
console.error(err);
setError("Failed to load reservation");
}
};
loadReservation();
}, [id]);

const handleSubmit = async e => {
e.preventDefault();
if (!selectedSlot) {
setError("Please select a time slot!");
return;
}
setLoading(true);
setError(null);
const payload = {
patient_id: Number(form.patient_id),
doctor_id: Number(form.doctor_id),
nurse_id: form.nurse_id ? Number(form.nurse_id) : null,
reservation_time: selectedSlot,
is_cancelled: false,
};
const url = id ? `/reservation/${id}` : "/reservation/create";
const method = id ? "PUT" : "POST";
try {
const res = await apiRequest(url, {
method,
body: JSON.stringify(payload),
});
if (res.success) navigate("/admin/reservations");
else setError(res.detail || "Save failed");
} catch (err) {
console.error(err);
setError(err?.detail || "Save failed");
} finally {
setLoading(false);
}
};

const generateSlots = (start, end) => {
const result = [];
let current = new Date(start);
while (current < end) {
result.push(new Date(current));
current = new Date(current.getTime() + 15 * 60 * 1000);
}
return result;
};

useEffect(() => {
if (!form.doctor_id || !selectedDate) return setAvailableSlots([]);
const sched = schedules.find(
s => Number(s.doctor_id) === Number(form.doctor_id) && s.schedule_date === selectedDate
);
if (!sched) return setAvailableSlots([]);
const start = new Date(`${sched.schedule_date}T${sched.start_time}`);
const end = new Date(`${sched.schedule_date}T${sched.end_time}`);
const slots = generateSlots(start, end);
setAvailableSlots(slots);
if (!slots.some(s => s.toISOString() === selectedSlot)) {
setSelectedSlot("");
setForm({ ...form, reservation_time: "" });
}
}, [form.doctor_id, selectedDate, schedules]);

if (loadingDropdowns) return <p>Loading form...</p>;

return ( <div className="min-vh-100 bg-light"> <Navbar /> <div className="container py-5"> <div className="card shadow-sm p-4"> <div className="text-center mb-4">
<i className="bi bi-calendar-plus text-primary" style={{ fontSize: "3rem" }}></i> <h2 className="fw-bold mt-2">{id ? "Edit Reservation" : "Create Reservation"}</h2> <p className="text-muted">Manage patient reservation</p> </div>
{error && <div className="alert alert-danger">{error}</div>}


      <form onSubmit={handleSubmit}>
        {/* Patient Typeahead */}
        <div className="mb-3 d-flex align-items-center">
          <i className="bi bi-person fs-4 me-2 text-primary"></i>
          <div className="w-100 d-flex flex-column">
            <label className="form-label fw-bold mb-1">Patient</label>
            <Typeahead
              id="patient-typeahead"
              labelKey={p => `${p.pesel} - ${p.user?.first_name || ""} ${p.user?.last_name || ""}`}
              options={patients}
              selected={patients.filter(p => p.patient_id === form.patient_id)}
              onChange={selected => {
                if (selected.length) setForm({ ...form, patient_id: selected[0].patient_id });
              }}
              placeholder="Select patient..."
            />
          </div>
        </div>

        {/* Doctor Typeahead */}
        <div className="mb-3 d-flex align-items-center">
          <i className="bi bi-person-badge fs-4 me-2 text-primary"></i>
          <div className="w-100 d-flex flex-column">
            <label className="form-label fw-bold mb-1">Doctor</label>
            <Typeahead
              id="doctor-typeahead"
              labelKey={d => `${d.doctor_id} - ${d.user?.first_name || ""} ${d.user?.last_name || ""}`}
              options={doctors}
              selected={doctors.filter(d => d.doctor_id === form.doctor_id)}
              onChange={selected => {
                if (selected.length) setForm({ ...form, doctor_id: selected[0].doctor_id });
              }}
              placeholder="Select doctor..."
            />
          </div>
        </div>

        {/* Nurse Typeahead */}
        <div className="mb-3 d-flex align-items-center">
          <i className="bi bi-heart-pulse fs-4 me-2 text-primary"></i>
          <div className="w-100 d-flex flex-column">
            <label className="form-label fw-bold mb-1">Nurse</label>
            <Typeahead
              id="nurse-typeahead"
              labelKey={n => `${n.nurse_id} - ${n.user?.first_name || ""} ${n.user?.last_name || ""}`}
              options={nurses}
              selected={nurses.filter(n => n.nurse_id === form.nurse_id)}
              onChange={selected => {
                if (selected.length) setForm({ ...form, nurse_id: selected[0].nurse_id });
                else setForm({ ...form, nurse_id: "" });
              }}
              placeholder="Select nurse..."
              clearButton
            />
          </div>
        </div>

        {/* Date picker */}
        {form.doctor_id && (
          <div className="mb-3 d-flex align-items-center">
            <i className="bi bi-calendar-date fs-4 me-2 text-primary"></i>
            <div className="w-100 d-flex flex-column">
              <label className="form-label fw-bold mb-1">Select date</label>
              <DatePicker
                selected={selectedDate ? new Date(selectedDate) : null}
                onChange={date => {
                  setSelectedDate(date.toISOString().split("T")[0]);
                  setSelectedSlot("");
                  setForm({ ...form, reservation_time: "" });
                }}
                includeDates={schedules
                  .filter(s => Number(s.doctor_id) === Number(form.doctor_id))
                  .map(s => new Date(s.schedule_date))}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select date..."
                className="form-control border-primary w-100"
              />
            </div>
          </div>
        )}

        {/* Available slots */}
        {availableSlots.length > 0 && (
          <div className="mb-3 d-flex flex-column">
            <label className="form-label fw-bold mb-1">Select time slot</label>
            <div className="d-flex flex-wrap gap-2">
              {availableSlots.map(slot => (
                <button
                  type="button"
                  key={slot.toISOString()}
                  className={`btn ${
                    selectedSlot === slot.toISOString() ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => {
                    setSelectedSlot(slot.toISOString());
                    setForm({ ...form, reservation_time: slot.toISOString() });
                  }}
                >
                  {slot.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="d-grid">
          <button className="btn btn-primary btn-lg" disabled={loading || !selectedSlot}>
            {loading ? "Saving..." : "Save Reservation"}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>


);
};

export default ReservationForm;

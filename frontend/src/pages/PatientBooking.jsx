import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import { resourceService } from "../services/resourceService";
import { useAuth } from "../context/AuthContext";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PatientBooking = () => {
  const { user } = useAuth();

  const [specialization, setSpecialization] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [patient, setPatient] = useState(null);

  const [formDoctor, setFormDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Load patient
  useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest("/patients/me", { method: "GET" });
        setPatient(data.data);
      } catch (err) {
        console.error("Failed to load patient", err);
      }
    })();
  }, []);

  // Load doctors + schedules
  useEffect(() => {
    (async () => {
      try {
        setDoctors(await resourceService.listDoctors());
        setSchedules(await resourceService.listSchedules());
      } catch (err) {
        console.error("Load error:", err);
      }
    })();
  }, []);

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
    if (!formDoctor || !selectedDate) {
      setTimeSlots([]);
      return;
    }
    const sched = schedules.find(
      (s) =>
        Number(s.doctor_id) === Number(formDoctor) &&
        s.schedule_date === selectedDate
    );
    if (!sched) return setTimeSlots([]);

    const start = new Date(`${sched.schedule_date}T${sched.start_time}`);
    const end = new Date(`${sched.schedule_date}T${sched.end_time}`);
    setTimeSlots(generateSlots(start, end));
  }, [formDoctor, selectedDate, schedules]);

  const specializations = [...new Set(doctors.map((d) => d.specialization))];

  const filteredDoctors =
    specialization === ""
      ? doctors
      : doctors.filter((d) => d.specialization === specialization);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!patient?.patient_id) {
      return setMessage({ type: "danger", text: "User not loaded yet!" });
    }
    if (!selectedSlot) {
      return setMessage({ type: "danger", text: "Select a time slot." });
    }

    setLoading(true);
    try {
      const resp = await apiRequest("/reservation/create", {
        method: "POST",
        body: JSON.stringify({
          patient_id: patient.patient_id,
          doctor_id: Number(formDoctor),
          reservation_time: selectedSlot,
          is_cancelled: false,
        }),
      });

      if (resp.success)
        setMessage({
          type: "success",
          text: "Reservation created successfully!",
        });
      else
        setMessage({
          type: "danger",
          text: resp.detail || "Failed to create reservation.",
        });
    } catch (err) {
      setMessage({ type: "danger", text: "Server error." });
    }
    setLoading(false);
  };

  if (!patient) return <div>Loading patient...</div>;

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <div className="container py-5" style={{ maxWidth: 800 }}>

        {message && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit} className="card p-4 shadow-sm">

          <div className="text-center mb-4">
            <i className="bi bi-calendar-check text-primary" style={{fontSize: "3rem"}}></i>
            <h2 className="fw-bold mt-3 mb-1">Book an Appointment</h2>
            <p className="text-muted">Choose a doctor and schedule your visit</p>
          </div>

          {/* Specialization */}
          <div className="mb-4">
            <label className="fw-bold mb-1 d-flex align-items-center">
              <i className="bi bi-bookmark me-2"></i> Doctor specialization
            </label>
            <Typeahead
                id="specialization"
                labelKey={(o) => o}
                options={specializations}
                placeholder="Start typing..."
                onChange={(selected) => {
                  setSpecialization(selected[0] || "");
                  setFormDoctor("");
                  setSelectedDate("");
                  setSelectedSlot("");
                }}
                selected={specialization ? [specialization] : []}
                clearButton
                inputProps={{className: "form-control"}}
            />
          </div>

          {/* Doctor */}
          <div className="mb-4">
            <label className="fw-bold mb-1 d-flex align-items-center">
              <i className="bi bi-person-badge me-2"></i> Doctor
            </label>
            <Typeahead
                id="doctor"
                labelKey={(d) => `${d.first_name} ${d.last_name}`}
                options={filteredDoctors}
                placeholder="Start typing..."
                onChange={(selected) => {
                  const val = selected[0]?.doctor_id || "";
                  setFormDoctor(val);
                  setSelectedDate("");
                  setSelectedSlot("");
                }}
                selected={
                  formDoctor
                      ? filteredDoctors.filter(
                          (d) => d.doctor_id === Number(formDoctor)
                      )
                      : []
                }
                clearButton
                disabled={!specialization}
                inputProps={{className: "form-control"}}
            />
          </div>

          {/* Date */}
          {formDoctor && (
              <div className="mb-3 d-flex align-items-center">
                <div className="w-100 d-flex flex-column">
                  <label className="form-label fw-bold mb-1">
                    <i className="bi bi-calendar-date me-2"></i>Select date</label>
                  <DatePicker
                      selected={selectedDate ? new Date(selectedDate) : null}
                      onChange={date => {
                        setSelectedDate(date.toISOString().split("T")[0]);
                      }}
                      includeDates={schedules
                          .filter(s => Number(s.doctor_id) === Number(formDoctor))
                          .map(s => new Date(s.schedule_date))}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select date..."
                      className="form-control border-primary w-100"
                  />
                </div>
              </div>
          )}

          {/* Time slots */}
          {selectedDate && (
              <div className="mb-4">
                <label className="fw-bold mb-2 d-flex align-items-center">
                  <i className="bi bi-clock me-2"></i> Available time slots
                </label>

                <div className="d-flex flex-wrap gap-2">
                  {timeSlots.length > 0 ? (
                      timeSlots.map((slot) => (
                          <button
                              key={slot.toISOString()}
                              type="button"
                              className={`btn px-3 py-2 ${
                                  selectedSlot === slot.toISOString()
                                      ? "btn-primary"
                                      : "btn-outline-primary"
                              }`}
                              style={{borderRadius: 10}}
                              onClick={() => setSelectedSlot(slot.toISOString())}
                          >
                            {slot.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </button>
                      ))
                  ) : (
                      <div className="text-muted">No slots available.</div>
                  )}
                </div>
              </div>
          )}

          <button
              className="btn btn-primary w-100 py-2"
              type="submit"
              disabled={loading || !selectedSlot}
          >
            <i className="bi bi-check-circle me-2"></i>
            Confirm booking
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientBooking;

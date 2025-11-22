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
  const {user} = useAuth();

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


  // Load logged-in patient
  useEffect(() => {
    const loadPatient = async () => {
      try {
        const data = await apiRequest("/patients/me", {method: "GET"});
        setPatient(data.data);
        console.log("Patient/me response:", data);
      } catch (err) {
        console.error("Failed to load patient", err);
      }
    };
    loadPatient();
  }, []);

  // Load doctors + schedules
  useEffect(() => {
    const load = async () => {
      try {
        const docs = await resourceService.listDoctors();
        const scheds = await resourceService.listSchedules();
        setDoctors(docs || []);
        setSchedules(scheds || []);
      } catch (err) {
        console.error("Load error:", err);
      }
    };
    load();
  }, []);

  // Generate 15-min slots
  const generateSlots = (start, end) => {
    const result = [];
    let current = new Date(start);
    while (current < end) {
      result.push(new Date(current));
      current = new Date(current.getTime() + 15 * 60 * 1000);
    }
    return result;
  };

  // Recompute slots when doctor/date changes
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
    if (!sched) {
      setTimeSlots([]);
      return;
    }
    const start = new Date(`${sched.schedule_date}T${sched.start_time}`);
    const end = new Date(`${sched.schedule_date}T${sched.end_time}`);
    setTimeSlots(generateSlots(start, end));
  }, [formDoctor, selectedDate, schedules]);

  const specializations = [...new Set(doctors.map((d) => d.specialization))];
  const filteredDoctors = specialization
      ? doctors.filter((d) => d.specialization === specialization)
      : doctors;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!patient?.patient_id) {
      setMessage({type: "danger", text: "User not loaded yet!"});
      return;
    }

    setLoading(true);

    try {
      const payload = {
        patient_id: patient.patient_id,
        doctor_id: Number(formDoctor),
        reservation_time: selectedSlot,
        is_cancelled: false,
      };

      console.log("Submitting payload:", payload);

      const resp = await apiRequest("/reservation/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (resp?.success) {
        setMessage({type: "success", text: "Reservation created successfully!"});
      } else {
        setMessage({
          type: "danger",
          text: resp?.detail || "Failed to create reservation.",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({type: "danger", text: "Server error."});
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading user data...</div>;
  if (!patient) {
    return <div>Loading patient data...</div>;
  }

  return (
      <div className="min-vh-100 bg-light">
        <Navbar/>
        <div className="container py-5">
          <h2 className="mb-4">Book an Appointment</h2>

          {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

          <form onSubmit={handleSubmit} className="card p-4">
            {/* Specialization */}
            <div className="mb-3 d-flex align-items-center">
              <i className="bi bi-bookmark fs-4 me-2 text-primary"></i>
              <div className="w-100 d-flex flex-column">
                <label className="form-label mb-1">Doctor specialization</label>
                <Typeahead
                    id="specialization"
                    labelKey="name"
                    options={specializations}
                    placeholder="Start typing..."
                    onChange={(selected) => {
                      const val = selected[0] || "";
                      setSpecialization(val);
                      setFormDoctor("");
                      setSelectedDate("");
                      setSelectedSlot("");
                    }}
                    selected={specialization ? [specialization] : []}
                    inputProps={{className: "form-control border-primary w-100"}}
                    allowNew={false}
                    clearButton
                />
              </div>
            </div>

            {/* Doctor */}
            <div className="mb-3 d-flex align-items-center">
              <i className="bi bi-person-badge fs-4 me-2 text-primary"></i>
              <div className="w-100 d-flex flex-column">
                <label className="form-label mb-1">Doctor</label>
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
                          ? filteredDoctors.filter((d) => d.doctor_id === Number(formDoctor))
                          : []
                    }
                    allowNew={false}
                    disabled={!specialization}
                    clearButton
                    inputProps={{className: "form-control border-primary w-100"}}
                />
              </div>
            </div>

            {/* Date */}
            {formDoctor && (
                <div className="mb-3 d-flex align-items-center">
                  <i className="bi bi-calendar-date fs-4 me-2 text-primary"></i>
                  <div className="w-100 d-flex flex-column">
                    <label className="form-label mb-1">Select date</label>
                    <DatePicker
                        selected={selectedDate ? new Date(selectedDate) : null}
                        onChange={(date) => {
                          setSelectedDate(date.toISOString().split("T")[0]);
                          setSelectedSlot("");
                        }}
                        includeDates={schedules
                            .filter((s) => Number(s.doctor_id) === Number(formDoctor))
                            .map((s) => new Date(s.schedule_date))
                        }
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select date..."
                        className="form-control border-primary w-100"
                    />
                  </div>
                </div>
            )}

            {/* Time slots */}
            {selectedDate && (
                <div className="mb-3 d-flex align-items-start">
                  <i className="bi bi-clock fs-4 me-2 text-primary mt-2"></i>
                  <div className="d-flex flex-wrap gap-2">
                    {timeSlots.length > 0 ? (
                        timeSlots.map((slot) => (
                            <button
                                key={slot.toISOString()}
                                type="button"
                                className={`btn ${
                                    selectedSlot === slot.toISOString()
                                        ? "btn-primary"
                                        : "btn-outline-primary"
                                }`}
                                onClick={() => setSelectedSlot(slot.toISOString())}
                            >
                              {slot.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}
                            </button>
                        ))
                    ) : (
                        <div>No slots available.</div>
                    )}
                  </div>
                </div>
            )}

            <button
                className="btn btn-primary mt-3"
                type="submit"
                disabled={loading || !selectedSlot || !patient?.patient_id}
            >
              Confirm booking
            </button>
          </form>
        </div>
      </div>
  );
}

export default PatientBooking;

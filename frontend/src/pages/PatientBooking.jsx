import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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

      if (resp.success) {
        setMessage({
          type: "success",
          text: "Reservation created successfully! Redirecting...",
        });
        // Redirect to appointments page after a short delay
        setTimeout(() => {
          navigate("/appointments");
        }, 1500);
      } else {
        setMessage({
          type: "danger",
          text: resp.detail || "Failed to create reservation.",
        });
        setLoading(false);
      }
    } catch (err) {
      setMessage({ type: "danger", text: "Server error." });
      setLoading(false);
    }
  };

  if (!patient) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-5">
          <div className="d-flex justify-content-center my-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="card shadow-sm border-0 mt-3">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <i
                    className="bi bi-calendar-check-fill text-primary"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h2 className="fw-bold mt-3 mb-2">Book an Appointment</h2>
                  <p className="text-muted">
                    Choose a doctor and schedule your visit
                  </p>
                </div>

                {/* Alerts */}
                {message && (
                  <div
                    className={`alert alert-${message.type} border-0 d-flex align-items-center`}
                    role="alert"
                  >
                    <i
                      className={`bi ${
                        message.type === "success"
                          ? "bi-check-circle-fill"
                          : "bi-exclamation-triangle-fill"
                      } me-2 fs-5`}
                    ></i>
                    <div>{message.text}</div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <div className="bg-light border rounded p-4 mb-4">
                    {/* Specialization */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-secondary small mb-2 d-block">
                        <i className="bi bi-bookmark me-1"></i>
                        Doctor Specialization *
                      </label>
                      <Typeahead
                        id="specialization"
                        labelKey={(o) => o}
                        options={specializations}
                        placeholder="Select or type specialization..."
                        onChange={(selected) => {
                          setSpecialization(selected[0] || "");
                          setFormDoctor("");
                          setSelectedDate("");
                          setSelectedSlot("");
                        }}
                        selected={specialization ? [specialization] : []}
                        clearButton
                      />
                    </div>

                    {/* Doctor */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-secondary small mb-2 d-block">
                        <i className="bi bi-person-badge me-1"></i>
                        Doctor *
                      </label>
                      <Typeahead
                        id="doctor"
                        labelKey={(d) => `${d.first_name} ${d.last_name}`}
                        options={filteredDoctors}
                        placeholder={
                          specialization
                            ? "Select or type doctor name..."
                            : "Please select specialization first"
                        }
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
                      />
                    </div>

                    {/* Date */}
                    {formDoctor && (
                      <div className="mb-4">
                        <label className="form-label fw-semibold text-secondary small mb-2 d-block">
                          <i className="bi bi-calendar-event me-1"></i>
                          Select Date *
                        </label>
                        <DatePicker
                          selected={
                            selectedDate
                              ? new Date(selectedDate + "T00:00:00")
                              : null
                          }
                          onChange={(date) => {
                            if (date) {
                              const year = date.getFullYear();
                              const month = String(
                                date.getMonth() + 1
                              ).padStart(2, "0");
                              const day = String(date.getDate()).padStart(
                                2,
                                "0"
                              );
                              setSelectedDate(`${year}-${month}-${day}`);
                              setSelectedSlot("");
                            }
                          }}
                          includeDates={schedules
                            .filter(
                              (s) => Number(s.doctor_id) === Number(formDoctor)
                            )
                            .map(
                              (s) => new Date(s.schedule_date + "T00:00:00")
                            )}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="Select available date..."
                          className="form-control"
                          minDate={new Date()}
                        />
                        {formDoctor &&
                          schedules.filter(
                            (s) => Number(s.doctor_id) === Number(formDoctor)
                          ).length === 0 && (
                            <small className="text-muted d-block mt-2">
                              <i className="bi bi-info-circle me-1"></i>
                              No schedules available for this doctor
                            </small>
                          )}
                      </div>
                    )}

                    <div className="mt-3">
                      <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        All fields marked with * are required
                      </small>
                    </div>
                  </div>

                  {/* Time slots */}
                  {selectedDate && (
                    <div className="mb-4">
                      <label className="form-label fw-semibold mb-3">
                        <i className="bi bi-clock me-2"></i>
                        Available Time Slots
                      </label>

                      <div className="row g-2">
                        {timeSlots.length > 0 ? (
                          timeSlots.map((slot) => {
                            const hours = String(slot.getHours()).padStart(
                              2,
                              "0"
                            );
                            const minutes = String(slot.getMinutes()).padStart(
                              2,
                              "0"
                            );
                            const seconds = "00";
                            const localSlot = `${selectedDate}T${hours}:${minutes}:${seconds}`;
                            return (
                              <div
                                key={localSlot}
                                className="col-6 col-sm-4 col-md-3 col-lg-2"
                              >
                                <button
                                  type="button"
                                  className={`btn py-2 w-100 ${
                                    selectedSlot === localSlot
                                      ? "btn-primary"
                                      : "btn-outline-primary"
                                  }`}
                                  onClick={() => setSelectedSlot(localSlot)}
                                >
                                  {slot.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-12">
                            <div className="alert alert-info border-0 w-100 mb-0">
                              <i className="bi bi-info-circle me-2"></i>
                              No time slots available for this date.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary btn-lg py-2"
                      type="submit"
                      disabled={loading || !selectedSlot}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Confirm Booking
                        </>
                      )}
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

export default PatientBooking;

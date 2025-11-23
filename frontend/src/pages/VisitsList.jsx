import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

const VisitsList = () => {
  const { user } = useAuth();
  const [visits, setVisits] = useState([]);
  const [users, setUsers] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const loggedDoctor = doctors.find(d => d.user_id === user?.user_id);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [visitsRes, usersRes, nursesRes, doctorsRes, reservationsRes] =
          await Promise.all([
            apiRequest("/visits"),
            apiRequest("/users"),
            apiRequest("/nurse"),
            apiRequest("/doctor"),
            apiRequest("/reservation"),
          ]);

        setVisits(visitsRes.data || []);
        setUsers(usersRes.data || []);
        setNurses(nursesRes.data || []);
        setDoctors(doctorsRes.data || []);
        setReservations(reservationsRes.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getNurseName = (nurse_id) => {
    const nurse = nurses.find((n) => n.nurse_id === nurse_id);
    if (!nurse) return nurse_id;
    const userObj = users.find((u) => u.user_id === nurse.user_id);
    return userObj ? `${userObj.first_name} ${userObj.last_name}` : nurse_id;
  };

  const getDoctorName = (reservation_id) => {
    const reservation = reservations.find(
      (r) => r.reservation_id === reservation_id
    );
    if (!reservation) return "-";
    const doctor = doctors.find((d) => d.doctor_id === reservation.doctor_id);
    if (!doctor) return `Doctor ${reservation.doctor_id}`;
    const userObj = users.find((u) => u.user_id === doctor.user_id);
    return userObj
      ? `${userObj.first_name} ${userObj.last_name}`
      : `Doctor ${doctor.doctor_id}`;
  };

  // ----------------------------
  // FILTROWANIE WIZYT DO DOCTOR
  // ----------------------------


    const filteredVisits =
      user?.role === "doctor" && loggedDoctor
        ? visits.filter((v) => {
            const res = reservations.find(
              (r) => r.reservation_id === v.reservation_id
            );
            return res && res.doctor_id === loggedDoctor.doctor_id;
          })
        : visits;

  // ----------------------------
  // ŚCIEŻKI DLA RÓL
  // ----------------------------

  const viewPath =
    user?.role === "doctor"
      ? "/doctor/visits/"
      : "/receptionist/visits/";

  const editPath =
    user?.role === "doctor"
      ? "/doctor/visits/edit/"
      : "/receptionist/visits/edit/";

  const handleDelete = async (visit_id) => {
    if (user?.role === "doctor") return; // bezpieczeństwo
    if (!window.confirm("Delete this visit?")) return;

    try {
      await apiRequest(`/visits/${visit_id}`, { method: "DELETE" });
      setVisits((prev) => prev.filter((v) => v.visit_id !== visit_id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete visit");
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning"></div>
      </div>
    );
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">

        <div className="card shadow-sm border-0 p-4 mb-4">
          <div className="text-center mb-3">
            <i
              className="bi bi-calendar-check text-warning"
              style={{ fontSize: "3rem" }}
            ></i>
            <h2 className="fw-bold mt-2 mb-2">
              {user?.role === "doctor" ? "My Visits" : "Visits"}
            </h2>
            <p className="text-muted">
              {user?.role === "doctor"
                ? "Visits assigned to you"
                : "Manage all visits"}
            </p>
          </div>

          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Visit ID</th>
                  <th>Reservation ID</th>
                  <th>Date</th>
                  <th>Nurse</th>
                  <th>Doctor</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.map((v, idx) => (
                  <tr key={v.visit_id}>
                    <td>{idx + 1}</td>
                    <td>{v.visit_id}</td>
                    <td>{v.reservation_id}</td>
                    <td>{v.visit_date}</td>
                    <td>{getNurseName(v.nurse_id)}</td>
                    <td>{getDoctorName(v.reservation_id)}</td>
                    <td>{v.visit_note || ""}</td>
                    <td>
                      <Link
                        to={`${viewPath}${v.visit_id}`}
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        View
                      </Link>

                      <Link
                        to={`${editPath}${v.visit_id}`}
                        className="btn btn-sm btn-outline-secondary me-2"
                      >
                        Edit
                      </Link>

                      {user?.role !== "doctor" && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(v.visit_id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VisitsList;

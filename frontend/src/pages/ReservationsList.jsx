import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";

const ReservationsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [filters, setFilters] = useState({
    patient: "",
    doctor: "",
    date: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [reservations, usersResp, patientsResp, doctorsResp] =
          await Promise.all([
            resourceService.listReservations(),
            apiRequest("/users"),
            apiRequest("/patients"),
            apiRequest("/doctor"),
          ]);

        setItems(reservations || []);
        setUsers(usersResp?.data || []);
        setPatients(patientsResp?.data || []);
        setDoctors(doctorsResp?.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getPatientLabel = (patient_id) => {
    const p = patients.find((pt) => pt.patient_id === patient_id);
    if (!p) return patient_id;
    const u = users.find((u) => u.user_id === p.user_id);
    return u ? `${p.pesel} - ${u.first_name} ${u.last_name}` : p.pesel;
  };

  const getDoctorLabel = (doctor_id) => {
    const d = doctors.find((doc) => doc.doctor_id === doctor_id);
    if (!d) return doctor_id;
    const u = users.find((u) => u.user_id === d.user_id);
    return u
      ? `${d.doctor_id} - ${u.first_name} ${u.last_name}`
      : `Doctor ${d.doctor_id}`;
  };

  const handleDelete = async (reservation_id) => {
    if (!window.confirm("Delete this reservation?")) return;
    try {
      await apiRequest(`/reservation/${reservation_id}`, { method: "DELETE" });
      setItems((prev) =>
        prev.filter((it) => it.reservation_id !== reservation_id)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to delete reservation");
    }
  };

  const filteredItems = items.filter((item) => {
    const matchPatient =
      !filters.patient ||
      getPatientLabel(item.patient_id)
        .toLowerCase()
        .includes(filters.patient.toLowerCase());

    const matchDoctor =
      !filters.doctor ||
      getDoctorLabel(item.doctor_id)
        .toLowerCase()
        .includes(filters.doctor.toLowerCase());

    const matchDate =
      !filters.date || item.reservation_time.startsWith(filters.date);

    return matchPatient && matchDoctor && matchDate;
  });

  const totalPages = Math.ceil(filteredItems.length / pageSize);

  const paginatedItems = filteredItems.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="min-vh-100 bg-light">
      {" "}
      <Navbar />{" "}
      <div className="container py-5">
        {" "}
        <div className="card shadow-sm border-0 p-4 mb-4">
          {" "}
          <div className="text-center mb-3">
            <i
              className="bi bi-calendar-check text-primary"
              style={{ fontSize: "3rem" }}
            ></i>{" "}
            <h2 className="fw-bold mt-2 mb-2">Reservations</h2>{" "}
            <p className="text-muted">Manage patient reservations</p>{" "}
          </div>
          {/* Filters */}
          <div className="row mb-3">
            <div className="col-md-4 mb-2">
              <label className="form-label">Patient</label>
              <input
                type="text"
                className="form-control"
                placeholder="Filter by patient"
                value={filters.patient}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, patient: e.target.value }))
                }
              />
            </div>
            <div className="col-md-4 mb-2">
              <label className="form-label">Doctor</label>
              <input
                type="text"
                className="form-control"
                placeholder="Filter by doctor"
                value={filters.doctor}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, doctor: e.target.value }))
                }
              />
            </div>
            <div className="col-md-4 mb-2">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.date}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
          </div>
          {/* Create Button */}
          <div className="d-grid mb-3">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate("/receptionist/reservations/create")}
            >
              Create Reservation
            </button>
          </div>
          {/* Table */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-warning"></div>
            </div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}
          {!loading && !error && (
            <div className="table-responsive">
              <table className="table table-striped ">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Time</th>
                    <th>Cancelled</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((r, idx) => (
                    <tr key={r.reservation_id}>
                      <td>{(page - 1) * pageSize + idx + 1}</td>
                      <td>{getPatientLabel(r.patient_id)}</td>
                      <td>{getDoctorLabel(r.doctor_id)}</td>
                      <td>
                        {new Date(r.reservation_time)
                          .toLocaleString("pl-PL", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          .replace(",", " godz.")}
                      </td>
                      <td>{r.is_cancelled ? "Yes" : "No"}</td>
                      <td>
                        <Link
                          to={`/receptionist/reservations/${r.reservation_id}`}
                          className="btn btn-sm btn-outline-primary me-2"
                        >
                          View
                        </Link>
                        <Link
                          to={`/receptionist/reservations/edit/${r.reservation_id}`}
                          className="btn btn-sm btn-outline-secondary me-2"
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(r.reservation_id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="d-flex justify-content-between mt-3">
                <button
                  className="btn btn-outline-secondary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <span>Page {page}</span>
                <button
                  className="btn btn-outline-secondary"
                  disabled={page * pageSize >= filteredItems.length}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationsList;

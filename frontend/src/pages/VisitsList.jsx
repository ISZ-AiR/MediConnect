import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

const VisitsList = () => {
  const { user } = useAuth();
  const [visits, setVisits] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ doctor: "", nurse: "", startDate: "", endDate: "" });
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const rolePrefix =
  user?.role === "doctor" ? "/doctor" :
  user?.role === "nurse" ? "/nurse" :
  "/receptionist";

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // pobieranie wizyt
        let visitsRes;
        if (user?.role === "doctor") {
          const myDoctorRes = await apiRequest("/doctor/me");
          const myDoctor = myDoctorRes.data;
          visitsRes = await apiRequest(`/visits/detailed/doctor/${myDoctor.doctor_id}`);
        } else if (user?.role === "nurse") {
          const myNurseRes = await apiRequest("/nurse/me");
          const myNurse = myNurseRes.data;
          visitsRes = await apiRequest(`/visits/detailed/nurse/${myNurse.nurse_id}`);
        } else {
          visitsRes = await apiRequest("/visits/detailed");
        }

        setVisits(visitsRes.data || []);

        // pobieranie listy doctorów i nurse (do filtrów)
        const [doctorsRes, nursesRes] = await Promise.all([
          apiRequest("/doctor"),
          apiRequest("/nurse")
        ]);
        setDoctors(doctorsRes.data || []);
        setNurses(nursesRes.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleDelete = async (visit_id) => {
    if (user?.role === "doctor") return;
    if (!window.confirm("Delete this visit?")) return;

    try {
      await apiRequest(`/visits/${visit_id}`, { method: "DELETE" });
      setVisits(prev => prev.filter(v => v.visit_id !== visit_id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete visit");
    }
  };

  // Filtrowanie
  const filteredVisits = visits.filter((v) => {
    const visitDate = new Date(v.visit_date);
    const doctorMatch =
      !filters.doctor || v.doctor.user_id === parseInt(filters.doctor);
    const nurseMatch =
      !filters.nurse || v.nurse.user_id === parseInt(filters.nurse);
    const startDateMatch =
      !filters.startDate || visitDate >= new Date(filters.startDate);
    const endDateMatch =
      !filters.endDate || visitDate <= new Date(filters.endDate);
    return doctorMatch && nurseMatch && startDateMatch && endDateMatch;
  });

  const totalPages = Math.ceil(filteredVisits.length / pageSize);
  const paginatedVisits = filteredVisits.slice((page - 1) * pageSize, page * pageSize);

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
            <i className="bi bi-calendar-check text-warning" style={{ fontSize: "3rem" }}></i>
            <h2 className="fw-bold mt-2 mb-2">{user?.role === "doctor" ? "My Visits" : "Visits"}</h2>
            <p className="text-muted">{user?.role === "doctor" ? "Visits assigned to you" : "Manage all visits"}</p>
          </div>

          {/* Filtry */}
          <div className="d-flex flex-wrap gap-3 mb-3">
            <div className="flex-grow-1" style={{ minWidth: "200px" }}>
              <label className="fw-bold">Doctor</label>
              <select
                className="form-select"
                value={filters.doctor}
                onChange={(e) => { setFilters({ ...filters, doctor: e.target.value }); setPage(1); }}
              >
                <option value="">All</option>
                {doctors.map(d => (
                  <option key={d.doctor_id} value={d.user_id}>{d.first_name} {d.last_name}</option>
                ))}
              </select>
            </div>
            {user?.role !== "nurse" && (
              <div className="flex-grow-1" style={{ minWidth: "200px" }}>
                <label className="fw-bold">Nurse</label>
                <select
                  className="form-select"
                  value={filters.nurse}
                  onChange={(e) => { setFilters({ ...filters, nurse: e.target.value }); setPage(1); }}
                >
                  <option value="">All</option>
                  {nurses.map(n => (
                    <option key={n.nurse_id} value={n.user_id}>{n.first_name} {n.last_name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex-grow-1" style={{ minWidth: "200px" }}>
              <label className="fw-bold">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.startDate}
                onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }}
              />
            </div>
            <div className="flex-grow-1" style={{ minWidth: "200px" }}>
              <label className="fw-bold">End Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.endDate}
                onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }}
              />
            </div>
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
                  <th>Patient</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVisits.map((v, idx) => (
                    <tr key={v.visit_id}>
                      <td>{(page - 1) * pageSize + idx + 1}</td>
                      <td>{v.visit_id}</td>
                      <td>{v.reservation.reservation_id}</td>
                      <td>{v.visit_date + " " + v.visit_time}</td>
                      <td>{v.nurse.first_name} {v.nurse.last_name}</td>
                      <td>{v.doctor.first_name} {v.doctor.last_name}</td>
                      <td>{v.patient.first_name} {v.patient.last_name}</td>
                      <td>{v.visit_note || ""}</td>
                      <td>
                        {/* View dostępny dla wszystkich */}
                        <Link
                            to={`${rolePrefix}/visits/${v.visit_id}`}
                            className="btn btn-sm btn-outline-primary me-2"
                        >
                          View
                        </Link>

                        {/* Edit: aktywny dla doctor, receptionist i admin */}
                        {["doctor", "receptionist", "admin"].includes(user?.role) ? (
                            <Link
                                to={`${rolePrefix}/visits/edit/${v.visit_id}`}
                                className="btn btn-sm btn-outline-secondary me-2"
                            >
                              Edit
                            </Link>
                        ) : (
                            <button className="btn btn-sm btn-outline-secondary me-2" disabled>
                              Edit
                            </button>
                        )}

                        {/* Delete: tylko dla receptionist i admin */}
                        {["receptionist", "admin"].includes(user?.role) && (
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

            {/* Paginacja */}
            <div className="d-flex justify-content-between mt-3">
              <button
                  className="btn btn-outline-secondary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
              >Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                  className="btn btn-outline-secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
              >Next
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VisitsList;

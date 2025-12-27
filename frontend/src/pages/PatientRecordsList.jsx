import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";

const PatientVisitsList = () => {
  const [visits, setVisits] = useState([]);
  const [users, setUsers] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [visitsRes, usersRes, nursesRes, doctorsRes, reservationsRes] = await Promise.all([
          apiRequest("/visits/me"),
          apiRequest("/users"),
          apiRequest("/nurse"),
          apiRequest("/doctor"),
          apiRequest("/reservation/me"),
        ]);

        setVisits(visitsRes.data || []);
        setUsers(usersRes.data || []);
        setNurses(nursesRes.data || []);
        setDoctors(doctorsRes?.data || []);
        setReservations(reservationsRes.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load your medical history");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getUserName = (userId) => {
    const u = users.find((u) => u.user_id === userId);
    return u ? `${u.first_name} ${u.last_name}` : "N/A";
  };

  const getNurseName = (nurseId) => {
    const n = nurses.find((n) => n.nurse_id === nurseId);
    if (!n) return "N/A";
    return getUserName(n.user_id);
  };

  const getDoctorName = (reservationId) => {
    const res = reservations.find((r) => r.reservation_id === reservationId);
    if (!res) return "N/A";

    const doc = doctors.find((d) => d.doctor_id === res.doctor_id);
    if (!doc) return "N/A";

    return getUserName(doc.user_id);
  };

  const filteredVisits = visits.filter((v) => {
    const vDate = new Date(v.visit_date);
    const start = !filters.startDate || vDate >= new Date(filters.startDate);
    const end = !filters.endDate || vDate <= new Date(filters.endDate);
    return start && end;
  }).sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));

  const paginatedVisits = filteredVisits.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-vh-100">
      <Navbar />
      <div className="container py-5">

        <div className="card shadow-sm border-0 p-4 mb-4 bg-white bg-opacity-10 text-center">
          <i className="bi bi-clipboard2-pulse text-primary mb-2" style={{ fontSize: "3rem" }}></i>
          <h2 className="fw-bold mb-1">Medical Visits History</h2>
          <p className="opacity-75 mb-0">View details of your past consultations</p>
        </div>

        <div className="card shadow-sm border-0 p-4 mb-4 bg-white bg-opacity-10">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="small fw-bold opacity-75 mb-1">From Date</label>
              <input
                type="date"
                className="form-control bg-transparent border-opacity-25"
                value={filters.startDate}
                onChange={e => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            <div className="col-md-6">
              <label className="small fw-bold opacity-75 mb-1">To Date</label>
              <input
                type="date"
                className="form-control bg-transparent border-opacity-25"
                value={filters.endDate}
                onChange={e => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 overflow-hidden bg-white bg-opacity-10">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-uppercase small fw-bold">
                  <tr>
                    <th className="px-4 py-3 border-0">Date & Time</th>
                    <th className="py-3 border-0">Doctor</th>
                    <th className="py-3 border-0">Nurse</th>
                    <th className="px-4 py-3 border-0 text-end">Details</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {paginatedVisits.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-5 opacity-50">No records found.</td></tr>
                  ) : (
                    paginatedVisits.map((v) => (
                      <tr key={v.visit_id}>
                        <td className="px-4 fw-bold">
                          {new Date(v.visit_date).toLocaleDateString()}
                          <div className="small fw-normal opacity-75">{v.visit_time}</div>
                        </td>
                        <td>{getDoctorName(v.reservation_id)}</td>
                        <td>{getNurseName(v.nurse_id)}</td>
                        <td className="px-4 text-end">
                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill px-4"
                            onClick={() => navigate(`/patient/records/${v.visit_id}`)}
                          >
                            View Record
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="card-footer bg-transparent border-top border-opacity-10 d-flex justify-content-between align-items-center p-3">
            <button
              className="btn btn-sm btn-link text-decoration-none"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span className="small opacity-75 fw-bold">Page {page}</span>
            <button
              className="btn btn-sm btn-link text-decoration-none"
              disabled={page * pageSize >= filteredVisits.length}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientVisitsList;
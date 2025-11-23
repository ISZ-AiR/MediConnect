import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";

const VisitsList = () => {
const [visits, setVisits] = useState([]);
const [users, setUsers] = useState([]);
const [nurses, setNurses] = useState([]);
const [doctors, setDoctors] = useState([]);
const [reservations, setReservations] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [filters, setFilters] = useState({
  doctor: "",
  nurse: "",
  startDate: "",
  endDate: "",
});

useEffect(() => {
const loadData = async () => {
try {
setLoading(true);
const [visitsRes, usersRes, nursesRes, doctorsRes, reservationsRes] = await Promise.all([
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
const user = users.find((u) => u.user_id === nurse.user_id);
return user ? `${user.first_name} ${user.last_name}` : nurse_id;
};

const getDoctorName = (reservation_id) => {
const reservation = reservations.find((r) => r.reservation_id === reservation_id);
if (!reservation) return "-";
const doctor = doctors.find((d) => d.doctor_id === reservation.doctor_id);
if (!doctor) return `Doctor ${reservation.doctor_id}`;
const user = users.find((u) => u.user_id === doctor.user_id);
return user ? `${user.first_name} ${user.last_name}` : `Doctor ${doctor.doctor_id}`;
};

const handleDelete = async (visit_id) => {
if (!window.confirm("Delete this visit?")) return;
try {
await apiRequest(`/visits/${visit_id}`, { method: "DELETE" });
setVisits((prev) => prev.filter((v) => v.visit_id !== visit_id));
} catch (err) {
console.error(err);
alert("Failed to delete visit");
}
};

if (loading) return <div className="text-center py-5"><div className="spinner-border text-warning"></div></div>;
if (error) return <div className="alert alert-danger">{error}</div>;

return (
    <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-5">
            <div className="card shadow-sm border-0 p-4 mb-4">
                <div className="text-center mb-3">
<i className="bi bi-calendar-check text-warning" style={{ fontSize: "3rem" }}></i>
                    <h2 className="fw-bold mt-2 mb-2">Visits</h2>
                    <p className="text-muted">Manage patient visits</p>
                </div>
        {/* FILTERS */}
        <div className="mb-3">
          <div className="d-flex flex-wrap gap-3">
            {/* Doctor filter */}
            <div className="d-flex flex-column flex-grow-1" style={{ minWidth: "200px" }}>
              <label className="fw-bold">Doctor</label>
              <select
                className="form-select"
                value={filters.doctor || ""}
                onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}
              >
                <option value="">All</option>
                {doctors.map((d) => {
                  const user = users.find((u) => u.user_id === d.user_id);
                  return (
                    <option key={d.doctor_id} value={d.user_id}>
                      {user ? `${user.first_name} ${user.last_name}` : `Doctor ${d.doctor_id}`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Nurse filter */}
            <div className="d-flex flex-column flex-grow-1" style={{ minWidth: "200px" }}>
              <label className="fw-bold">Nurse</label>
              <select
                className="form-select"
                value={filters.nurse || ""}
                onChange={(e) => setFilters({ ...filters, nurse: e.target.value })}
              >
                <option value="">All</option>
                {nurses.map((n) => {
                  const user = users.find((u) => u.user_id === n.user_id);
                  return (
                    <option key={n.nurse_id} value={n.user_id}>
                      {user ? `${user.first_name} ${user.last_name}` : `Nurse ${n.nurse_id}`}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-3 mt-2">
            {/* Start date */}
            <div className="d-flex flex-column flex-grow-1" style={{ minWidth: "200px" }}>
              <label className="fw-bold">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.startDate || ""}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            {/* End date */}
            <div className="d-flex flex-column flex-grow-1" style={{ minWidth: "200px" }}>
              <label className="fw-bold">End Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.endDate || ""}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
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
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visits
              .filter((v) => {
                const visitDate = new Date(v.visit_date);

                const doctorMatch =
                  !filters.doctor ||
                  getDoctorName(v.reservation_id) ===
                    users.find((u) => u.user_id === parseInt(filters.doctor))?.first_name +
                      " " +
                      users.find((u) => u.user_id === parseInt(filters.doctor))?.last_name;

                const nurseMatch =
                  !filters.nurse ||
                  getNurseName(v.nurse_id) ===
                    users.find((u) => u.user_id === parseInt(filters.nurse))?.first_name +
                      " " +
                      users.find((u) => u.user_id === parseInt(filters.nurse))?.last_name;

                const startMatch =
                  !filters.startDate || visitDate >= new Date(filters.startDate);

                const endMatch =
                  !filters.endDate || visitDate <= new Date(filters.endDate);

                return doctorMatch && nurseMatch && startMatch && endMatch;
              })
              .map((v, idx) => (
              <tr key={v.visit_id}>
                <td>{idx + 1}</td>
                <td>{v.visit_id}</td>
                <td>{v.reservation_id}</td>
                <td>{v.visit_date}</td>
                <td>{getNurseName(v.nurse_id)}</td>
                <td>{getDoctorName(v.reservation_id)}</td>
                <td>{v.visit_note || ""}</td>
                <td>
                  <Link to={`/receptionist/visits/${v.visit_id}`} className="btn btn-sm btn-outline-primary me-2">View</Link>
                  <Link to={`/receptionist/visits/edit/${v.visit_id}`} className="btn btn-sm btn-outline-secondary me-2">Edit</Link>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(v.visit_id)}>Delete</button>
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

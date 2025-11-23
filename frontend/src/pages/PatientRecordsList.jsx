import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ListToolbar from "../components/ListToolbar";
import { apiRequest } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

const PatientVisitsList = () => {
const { user } = useAuth();
const [visits, setVisits] = useState([]);
const [users, setUsers] = useState([]);
const [reservations, setReservations] = useState([]);
const [nurses, setNurses] = useState([]);
const [doctors, setDoctors] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [search, setSearch] = useState("");
const [page, setPage] = useState(1);
const pageSize = 20;
const [filters, setFilters] = useState({ doctor: "", nurse: "", startDate: "", endDate: "" });

const navigate = useNavigate();

useEffect(() => {
const loadData = async () => {
try {
setLoading(true);
const [visitsRes, usersRes, nursesRes, reservationsRes, doctorsRes] = await Promise.all([
apiRequest("/visits"),
apiRequest("/users"),
apiRequest("/nurse"),
apiRequest("/reservation/me"),
apiRequest("/doctor")
]);
setVisits(visitsRes.data || []);
setUsers(usersRes.data || []);
setReservations(reservationsRes.data || []);
setNurses(nursesRes.data || []);
setDoctors(doctorsRes?.data || []);
} catch (err) {
console.error(err);
setError("Failed to load your visits");
} finally {
setLoading(false);
}
};
loadData();
}, []);

const getUserName = (user_id) => {
const user = users.find(u => u.user_id === user_id);
return user ? `${user.first_name} ${user.last_name}` : "N/A";
};

const getNurseName = (nurse_id) => {
const nurse = nurses.find(n => n.nurse_id === nurse_id);
if (!nurse) return "N/A";
return getUserName(nurse.user_id);
};

const getDoctorName = (reservation_id) => {
const reservation = reservations.find(r => r.reservation_id === reservation_id);
if (!reservation) return "N/A";
const doctor = doctors.find(d => d.doctor_id === reservation.doctor_id);
if (!doctor) return "N/A";
return getUserName(doctor.user_id);
};

const totalPages = Math.ceil(visits.length / pageSize);
const paginatedVisits = visits.slice((page - 1) * pageSize, page * pageSize);

const filteredVisits = paginatedVisits.filter((v) => {
const visitDate = new Date(v.visit_date);


const doctorMatch =
  !filters.doctor || getDoctorName(v.reservation_id) === getUserName(parseInt(filters.doctor));
const nurseMatch =
  !filters.nurse || getNurseName(v.nurse_id) === getUserName(parseInt(filters.nurse));
const startDateMatch = !filters.startDate || visitDate >= new Date(filters.startDate);
const endDateMatch = !filters.endDate || visitDate <= new Date(filters.endDate);

return doctorMatch && nurseMatch && startDateMatch && endDateMatch;


});

return ( <div className="min-vh-100 bg-light"> <Navbar /> <div className="container py-5">
        <div className="card shadow-sm border-0 p-4 mb-4">
            <div className="text-center mb-3">
                <i className="bi bi-calendar-plus text-success" style={{fontSize: "3rem"}}></i> <h2
                className="fw-bold mt-2 mb-2">My Visits</h2> <p className="text-muted">All your scheduled visits</p>
            </div>


            <div className="mb-3">
                <div className="d-flex flex-wrap gap-3">
                    <div className="d-flex flex-column flex-grow-1" style={{minWidth: "200px"}}>
                        <label className="fw-bold">Doctor</label>
                        <select
                            className="form-select"
                            value={filters.doctor || ""}
                            onChange={(e) => setFilters({...filters, doctor: e.target.value})}
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

                    
                    <div className="d-flex flex-column flex-grow-1" style={{minWidth: "200px"}}>
                        <label className="fw-bold">Nurse</label>
                        <select
                            className="form-select"
                            value={filters.nurse || ""}
                            onChange={(e) => setFilters({...filters, nurse: e.target.value})}
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
                    <div className="d-flex flex-column flex-grow-1" style={{minWidth: "200px"}}>
                        <label className="fw-bold">Start Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={filters.startDate || ""}
                            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                        />
                    </div>

                    
                    <div className="d-flex flex-column flex-grow-1" style={{minWidth: "200px"}}>
                        <label className="fw-bold">End Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={filters.endDate || ""}
                            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                        />
                    </div>
                    

                </div>
            </div>


            {loading && (
                <div className="text-center my-5">
                    <div className="spinner-border " role="status"></div>
                </div>
            )}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Reservation ID</th>
                            <th>Visit Date</th>
                            <th>Nurse</th>
                            <th>Doctor</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredVisits
                            .filter(
                                (v) =>
                                    !search || JSON.stringify(v).toLowerCase().includes(search.toLowerCase())
                            )
                            .map((v, idx) => (
                                <tr key={v.visit_id}>
                                    <td>{(page - 1) * pageSize + idx + 1}</td>
                                    <td>{v.reservation_id}</td>
                                    <td>{v.visit_date}</td>
                                    <td>{getNurseName(v.nurse_id)}</td>
                                    <td>{getDoctorName(v.reservation_id)}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => navigate(`/patient/records/${v.visit_id}`)}
                                        >
                                            View
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
                            disabled={page * pageSize >= visits.length}
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

export default PatientVisitsList;

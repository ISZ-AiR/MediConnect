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

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [visitsRes, usersRes, nursesRes, reservationsRes, doctorsRes] =
          await Promise.all([
            apiRequest("/visits"),
            apiRequest("/users"),
            apiRequest("/nurse"),
            apiRequest("/reservation/me"),
            apiRequest("/doctor"),
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

  const getNurseName = (nurse_id) => {
    const nurse = nurses.find((n) => n.nurse_id === nurse_id);
    if (!nurse) return "N/A";
    const user = users.find((u) => u.user_id === nurse.user_id);
    return user ? `${user.first_name} ${user.last_name}` : "N/A";
  };

  const getDoctorName = (reservation_id) => {
    const reservation = reservations.find(
      (r) => r.reservation_id === reservation_id
    );
    if (!reservation) return "N/A";
    const doctor = doctors.find((d) => d.doctor_id === reservation.doctor_id);
    if (!doctor) return "N/A";
    const doctorUser = users.find((u) => u.user_id === doctor.user_id);
    return doctorUser
      ? `${doctorUser.first_name} ${doctorUser.last_name}`
      : "N/A";
  };

  const totalPages = Math.ceil(visits.length / pageSize);
  const paginatedVisits = visits.slice((page - 1) * pageSize, page * pageSize);

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
              className="bi bi-calendar-plus text-warning"
              style={{ fontSize: "3rem" }}
            ></i>{" "}
            <h2 className="fw-bold mt-2 mb-2">My Visits</h2>{" "}
            <p className="text-muted">All your scheduled visits</p>{" "}
          </div>
          <ListToolbar
            search={search}
            onSearch={(val) => setSearch(val)}
            page={page}
            pageSize={pageSize}
            total={visits.length}
            onPageChange={(newPage) => setPage(newPage)}
          />
          {loading && (
            <div className="text-center my-5">
              <div className="spinner-border text-warning" role="status"></div>
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
                  {paginatedVisits
                    .filter(
                      (v) =>
                        !search ||
                        JSON.stringify(v)
                          .toLowerCase()
                          .includes(search.toLowerCase())
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
                            onClick={() =>
                              navigate(`/patient/records/${v.visit_id}`)
                            }
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

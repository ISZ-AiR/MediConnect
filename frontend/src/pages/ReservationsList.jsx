import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ListToolbar from "../components/ListToolbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";

const ReservationsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [reservations, usersResp, patientsResp, doctorsResp] = await Promise.all([
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
  // Funkcje do mapowania pacjenta/lekarza na pełną nazwę
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
    return u ? `${d.doctor_id} - ${u.first_name} ${u.last_name}` : `Doctor ${d.doctor_id}`;
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Reservations</h2>
          <div>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/admin/reservations/create")}
            >
              Create Reservation
            </button>
          </div>
        </div>

        <ListToolbar
          search={search}
          onSearch={(v) => setSearch(v)}
          page={1}
          pageSize={20}
          total={items.length}
          onPageChange={() => {}}
        />

        {loading && (
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && (
          <div className="table-responsive">
            <table className="table table-striped">
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
                {items
                  .filter(
                    (it) =>
                      !search ||
                      JSON.stringify(it)
                        .toLowerCase()
                        .includes(search.toLowerCase())
                  )
                  .map((r, idx) => (
                    <tr key={r.reservation_id || idx}>
                      <td>{idx + 1}</td>
                      <td>{getPatientLabel(r.patient_id)}</td>
                      <td>{getDoctorLabel(r.doctor_id)}</td>
                      <td>{new Date(r.reservation_time).toLocaleString("pl-PL", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).replace(",", " godz.")}</td>
                      <td>{r.is_cancelled ? "Yes" : "No"}</td>
                      <td>
                        <Link
                          to={`/admin/reservations/${r.reservation_id}`}
                          className="btn btn-sm btn-outline-primary me-2"
                        >
                          View
                        </Link>
                        <Link
                          to={`/admin/reservations/edit/${r.reservation_id}`}
                          className="btn btn-sm btn-outline-secondary me-2"
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={async () => {
                            if (!confirm("Delete this reservation?")) return;
                            try {
                              await apiRequest(`/reservation/${r.reservation_id}`, {
                                method: "DELETE",
                              });
                              setItems((prev) =>
                                prev.filter(
                                  (item) => item.reservation_id !== r.reservation_id
                                )
                              );
                            } catch (err) {
                              console.error(err);
                              alert("Failed to delete reservation");
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsList;

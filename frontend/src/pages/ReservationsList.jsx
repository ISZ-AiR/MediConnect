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
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await resourceService.listReservations();
        setItems(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load reservations");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
                  <th>Patient ID</th>
                  <th>Doctor ID</th>
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
                      <td>{r.patient_id}</td>
                      <td>{r.doctor_id}</td>
                      <td>{r.reservation_time}</td>
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
                              await apiRequest(
                                `/reservation/${r.reservation_id}`,
                                { method: "DELETE" }
                              );
                              setItems((prev) =>
                                prev.filter(
                                  (item) =>
                                    item.reservation_id !== r.reservation_id
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

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ListToolbar from "../components/ListToolbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";

const VisitsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await resourceService.listVisits();
        setItems(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load visits");
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
        <h2 className="mb-4">Visits</h2>
        <div className="mb-3">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/admin/visits/create")}
          >
            Create Visit
          </button>
        </div>
        <ListToolbar
          search={search}
          onSearch={(val) => setSearch(val)}
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
                  <th>Reservation ID</th>
                  <th>Visit Date</th>
                  <th>Nurse ID</th>
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
                  .map((v, idx) => (
                    <tr key={v.visit_id || idx}>
                      <td>{idx + 1}</td>
                      <td>{v.reservation_id}</td>
                      <td>{v.visit_date}</td>
                      <td>{v.nurse_id}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              navigate(`/admin/visits/${v.visit_id}`)
                            }
                          >
                            View
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              navigate(`/admin/visits/edit/${v.visit_id}`)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={async () => {
                              if (!window.confirm("Delete this visit?")) return;
                              try {
                                await apiRequest(`/visits/${v.visit_id}`, {
                                  method: "DELETE",
                                });
                                setItems((prev) =>
                                  prev.filter(
                                    (it) => it.visit_id !== v.visit_id
                                  )
                                );
                              } catch (err) {
                                console.error(err);
                                alert("Failed to delete visit");
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
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

export default VisitsList;

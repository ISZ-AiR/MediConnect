import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import ListToolbar from "../components/ListToolbar";
import { apiRequest } from "../services/apiClient";

const SchedulesList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await resourceService.listSchedules();
        setItems(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load schedules");
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
        <h2 className="mb-4">Schedules</h2>
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <div>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/admin/schedules/create")}
            >
              Create Schedule
            </button>
          </div>
          <div style={{ width: "50%" }}>
            <ListToolbar
              search={search}
              onSearch={(v) => setSearch(v)}
              page={1}
              pageSize={20}
              total={items.length}
              onPageChange={() => {}}
            />
          </div>
        </div>
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
                  <th>Doctor ID</th>
                  <th>Date</th>
                  <th>Start</th>
                  <th>End</th>
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
                  .map((s, idx) => (
                    <tr key={s.schedule_id || idx}>
                      <td>{idx + 1}</td>
                      <td>{s.doctor_id}</td>
                      <td>{s.schedule_date}</td>
                      <td>{s.start_time}</td>
                      <td>{s.end_time}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              navigate(`/admin/schedules/${s.schedule_id}`)
                            }
                          >
                            View
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              navigate(`/admin/schedules/edit/${s.schedule_id}`)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={async () => {
                              if (!window.confirm("Delete this schedule?"))
                                return;
                              try {
                                const resp = await apiRequest(
                                  `/schedules/${s.schedule_id}`,
                                  { method: "DELETE" }
                                );
                                // if apiRequest returns success-wrapped
                                if (resp && resp.success === true) {
                                  setItems((prev) =>
                                    prev.filter(
                                      (it) => it.schedule_id !== s.schedule_id
                                    )
                                  );
                                } else if (
                                  resp &&
                                  resp.status ===
                                    "Schedule deleted successfully"
                                ) {
                                  setItems((prev) =>
                                    prev.filter(
                                      (it) => it.schedule_id !== s.schedule_id
                                    )
                                  );
                                } else {
                                  // attempt to refresh list
                                  setItems(
                                    (await resourceService.listSchedules()) ||
                                      []
                                  );
                                }
                              } catch (err) {
                                console.error(err);
                                alert("Failed to delete schedule");
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

export default SchedulesList;

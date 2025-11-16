import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ListToolbar from "../components/ListToolbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";

const ManagersList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await resourceService.listManagers();
        setItems(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load managers");
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
        <h2 className="mb-4">Managers</h2>
        <div className="mb-3">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/admin/managers/create")}
          >
            Create Manager
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
                  <th>Name</th>
                  <th>Email</th>
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
                  .map((m, idx) => (
                    <tr key={m.user_id || idx}>
                      <td>{idx + 1}</td>
                      <td>
                        {m.first_name} {m.last_name}
                      </td>
                      <td>{m.email}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              navigate(`/admin/managers/${m.user_id}`)
                            }
                          >
                            View
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              navigate(`/admin/managers/edit/${m.user_id}`)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={async () => {
                              if (!window.confirm("Delete this manager?"))
                                return;
                              try {
                                await apiRequest(`/managers/${m.user_id}`, {
                                  method: "DELETE",
                                });
                                setItems((prev) =>
                                  prev.filter((it) => it.user_id !== m.user_id)
                                );
                              } catch (err) {
                                console.error(err);
                                alert("Failed to delete manager");
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

export default ManagersList;

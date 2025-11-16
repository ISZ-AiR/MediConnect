import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ListToolbar from "../components/ListToolbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";

const PrescriptionsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await resourceService.listPrescriptions();
        setItems(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load prescriptions");
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
        <h2 className="mb-4">Prescriptions</h2>
        <div className="mb-3">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/admin/prescriptions/create")}
          >
            Create Prescription
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
                  <th>Visit ID</th>
                  <th>Medication</th>
                  <th>Dosage</th>
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
                  .map((p, idx) => (
                    <tr key={p.prescription_id || idx}>
                      <td>{idx + 1}</td>
                      <td>{p.visit_id}</td>
                      <td>{p.medication}</td>
                      <td>{p.dosage}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              navigate(
                                `/admin/prescriptions/${p.prescription_id}`
                              )
                            }
                          >
                            View
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              navigate(
                                `/admin/prescriptions/edit/${p.prescription_id}`
                              )
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={async () => {
                              if (!window.confirm("Delete this prescription?"))
                                return;
                              try {
                                await apiRequest(
                                  `/prescriptions/${p.prescription_id}`,
                                  { method: "DELETE" }
                                );
                                setItems((prev) =>
                                  prev.filter(
                                    (it) =>
                                      it.prescription_id !== p.prescription_id
                                  )
                                );
                              } catch (err) {
                                console.error(err);
                                alert("Failed to delete prescription");
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

export default PrescriptionsList;

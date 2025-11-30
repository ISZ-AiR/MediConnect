import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { Link } from "react-router-dom";

const PrescriptionsList = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const data = await resourceService.listPrescriptions();
      setPrescriptions(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) return;
    try {
      await resourceService.deletePrescription(id);
      setPrescriptions(prev => prev.filter(p => p.prescription_id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete prescription");
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  if (loading)
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-5 text-center">
          <div className="spinner-border text-warning" role="status"></div>
        </div>
      </div>
    );

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="text-center mb-4">
          <i className="bi bi-capsule text-warning" style={{ fontSize: "3rem" }}></i>
          <h2 className="fw-bold mt-3">Prescriptions</h2>
          <p className="text-muted">Manage all prescriptions</p>

        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body">
            {prescriptions.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Visit ID</th>
                      <th>Medication</th>
                      <th>Dosage</th>
                      <th>Instruction</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((p) => (
                      <tr key={p.prescription_id}>
                        <td>{p.visit_id}</td>
                        <td>{p.medication}</td>
                        <td>{p.dosage}</td>
                        <td>{p.instruction || ""}</td>
                        <td>
                          <div className="btn-group">
                            <Link
                              to={`/admin/prescriptions/${p.prescription_id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              View
                            </Link>
                            <Link
                              to={`/admin/prescriptions/edit/${p.prescription_id}`}
                              className="btn btn-sm btn-outline-secondary"
                            >
                              Edit
                            </Link>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(p.prescription_id)}
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
            ) : (
              <div className="text-center py-5">No prescriptions found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionsList;

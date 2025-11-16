import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";

const PrescriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await resourceService.getPrescription(id);
        setItem(data || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load prescription");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this prescription?")) return;
    try {
      await resourceService.deletePrescription(id);
      navigate("/admin/prescriptions");
    } catch (err) {
      console.error(err);
      alert("Failed to delete prescription");
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">Prescription Details</h2>
        {loading && <div className="spinner-border" role="status" />}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && !error && item && (
          <div className="card">
            <div className="card-body">
              <p>
                <strong>Prescription ID:</strong> {item.prescription_id}
              </p>
              <p>
                <strong>Visit ID:</strong> {item.visit_id}
              </p>
              <p>
                <strong>Medication:</strong> {item.medication}
              </p>
              <p>
                <strong>Dosage:</strong> {item.dosage}
              </p>
              <p>
                <strong>Instruction:</strong> {item.instruction}
              </p>

              <div className="mt-3">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() =>
                    navigate(
                      `/admin/prescriptions/edit/${item.prescription_id}`
                    )
                  }
                >
                  Edit
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
                <button
                  className="btn btn-link ms-2"
                  onClick={() => navigate("/admin/prescriptions")}
                >
                  Back to list
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionDetail;

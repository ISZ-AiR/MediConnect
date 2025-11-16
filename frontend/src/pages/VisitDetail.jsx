import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";

const VisitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await resourceService.getVisit(id);
        setItem(data || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load visit");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this visit?")) return;
    try {
      await resourceService.deleteVisit(id);
      navigate("/admin/visits");
    } catch (err) {
      console.error(err);
      alert("Failed to delete visit");
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">Visit Details</h2>
        {loading && <div className="spinner-border" role="status" />}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && !error && item && (
          <div className="card">
            <div className="card-body">
              <p>
                <strong>Visit ID:</strong> {item.visit_id}
              </p>
              <p>
                <strong>Reservation ID:</strong> {item.reservation_id}
              </p>
              <p>
                <strong>Visit Date:</strong> {item.visit_date}
              </p>
              <p>
                <strong>Nurse ID:</strong> {item.nurse_id}
              </p>
              <p>
                <strong>Notes:</strong> {item.visit_note}
              </p>

              <div className="mt-3">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() =>
                    navigate(`/admin/visits/edit/${item.visit_id}`)
                  }
                >
                  Edit
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
                <button
                  className="btn btn-link ms-2"
                  onClick={() => navigate("/admin/visits")}
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

export default VisitDetail;

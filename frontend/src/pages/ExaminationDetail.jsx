import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";

const ExaminationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await resourceService.getExamination(id);
        setItem(data || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load examination");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this examination?")) return;
    try {
      await resourceService.deleteExamination(id);
      navigate("/admin/examinations");
    } catch (err) {
      console.error(err);
      alert("Failed to delete examination");
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">Examination Details</h2>
        {loading && <div className="spinner-border" role="status" />}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && !error && item && (
          <div className="card">
            <div className="card-body">
              <p>
                <strong>ID:</strong> {item.examination_id}
              </p>
              <p>
                <strong>Name:</strong> {item.name}
              </p>
              <p>
                <strong>Type:</strong> {item.type}
              </p>
              <p>
                <strong>Description:</strong> {item.description}
              </p>

              <div className="mt-3">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() =>
                    navigate(`/admin/examinations/edit/${item.examination_id}`)
                  }
                >
                  Edit
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
                <button
                  className="btn btn-link ms-2"
                  onClick={() => navigate("/admin/examinations")}
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

export default ExaminationDetail;

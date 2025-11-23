import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";

const ManagerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await resourceService.getManager(id);
        setItem(data || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load manager");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this manager?")) return;
    try {
      await resourceService.deleteManager(id);
      navigate("/admin/managers");
    } catch (err) {
      console.error(err);
      alert("Failed to delete manager");
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">Manager Details</h2>
        {loading && <div className="spinner-border" role="status" />}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && !error && item && (
          <div className="card">
            <div className="card-body">
              <p>
                <strong>User ID:</strong> {item.user_id}
              </p>
              <p>
                <strong>Name:</strong> {item.first_name} {item.last_name}
              </p>
              <p>
                <strong>Email:</strong> {item.email}
              </p>
              <p>
                <strong>Phone:</strong> {item.phone}
              </p>
              <p>
                <strong>Role:</strong> {item.role}
              </p>

              <div className="mt-3">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() =>
                    navigate(`/admin/managers/edit/${item.user_id}`)
                  }
                >
                  Edit
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
                <button
                  className="btn btn-link ms-2"
                  onClick={() => navigate("/admin/managers")}
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

export default ManagerDetail;

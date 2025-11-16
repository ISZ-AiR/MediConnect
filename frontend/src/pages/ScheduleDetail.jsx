import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";

const ScheduleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await resourceService.getSchedule(id);
        setItem(data || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await resourceService.deleteSchedule(id);
      navigate("/admin/schedules");
    } catch (err) {
      console.error(err);
      alert("Failed to delete schedule");
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">Schedule Details</h2>
        {loading && <div className="spinner-border" role="status" />}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && !error && item && (
          <div className="card">
            <div className="card-body">
              <p>
                <strong>Schedule ID:</strong> {item.schedule_id}
              </p>
              <p>
                <strong>Doctor ID:</strong> {item.doctor_id}
              </p>
              <p>
                <strong>Date:</strong> {item.schedule_date}
              </p>
              <p>
                <strong>Start:</strong> {item.start_time}
              </p>
              <p>
                <strong>End:</strong> {item.end_time}
              </p>

              <div className="mt-3">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() =>
                    navigate(`/admin/schedules/edit/${item.schedule_id}`)
                  }
                >
                  Edit
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
                <button
                  className="btn btn-link ms-2"
                  onClick={() => navigate("/admin/schedules")}
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

export default ScheduleDetail;

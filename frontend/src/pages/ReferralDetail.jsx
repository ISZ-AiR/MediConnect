import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";

const ReferralDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await resourceService.getReferral(id);
        setItem(data || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load referral");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this referral?")) return;
    try {
      await resourceService.deleteReferral(id);
      navigate("/admin/referrals");
    } catch (err) {
      console.error(err);
      alert("Failed to delete referral");
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">Referral Details</h2>
        {loading && <div className="spinner-border" role="status" />}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && !error && item && (
          <div className="card">
            <div className="card-body">
              <p>
                <strong>Referral ID:</strong> {item.referral_id}
              </p>
              <p>
                <strong>Visit ID:</strong> {item.visit_id}
              </p>
              <p>
                <strong>Patient ID:</strong> {item.patient_id}
              </p>
              <p>
                <strong>Examination ID:</strong> {item.examination_id}
              </p>
              <p>
                <strong>Doctor ID:</strong> {item.doctor_id}
              </p>
              <p>
                <strong>Referral Date:</strong> {item.referral_date}
              </p>
              <p>
                <strong>Notes:</strong> {item.notes}
              </p>

              <div className="mt-3">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() =>
                    navigate(`/admin/referrals/edit/${item.referral_id}`)
                  }
                >
                  Edit
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
                <button
                  className="btn btn-link ms-2"
                  onClick={() => navigate("/admin/referrals")}
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

export default ReferralDetail;

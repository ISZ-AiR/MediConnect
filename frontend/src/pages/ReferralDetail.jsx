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
    const loadReferral = async () => {
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
    if (id) loadReferral();
  }, [id]);

  const handleEdit = () => {
    navigate(`/admin/referrals/edit/${item.referral_id}`);
  };

  const handleBack = () => {
    navigate("/admin/referrals");
  };

  if (loading)
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-5 text-center">
          <div className="spinner-border text-warning" role="status" />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );

  if (!item)
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-5 text-center">Referral not found</div>
      </div>
    );

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5 d-flex justify-content-center">
        <div className="bg-white p-4 rounded shadow-sm" style={{ maxWidth: "600px", width: "100%" }}>

          {/* Ikonka i nagłówek */}
          <div className="text-center mb-4">
            <i className="bi bi-card-checklist text-warning" style={{ fontSize: "3rem" }}></i>
            <h2 className="fw-bold mt-3">Referral Details</h2>
          </div>

          {/* Sekcja: wizyta i pacjent */}
          <div className="mb-3 pb-3 border-bottom">
            <p><span className="fw-bold">Referral ID:</span> {item.referral_id}</p>
            <p><span className="fw-bold">Visit ID:</span> {item.visit_id}</p>
            <p><span className="fw-bold">Patient:</span> {item.patient_name || item.patient_id}</p>
            <p><span className="fw-bold">PESEL:</span> {item.patient_pesel || "-"}</p>
            <p><span className="fw-bold">Doctor:</span> {item.doctor_name || item.doctor_id}</p>
            <p><span className="fw-bold">Referral Date:</span> {item.referral_date}</p>
          </div>

          {/* Sekcja: szczegóły skierowania */}
          <div className="mb-4">
            <p><span className="fw-bold">Examination:</span> {item.examination_name || item.examination_id}</p>
            <p><span className="fw-bold">Notes:</span> {item.notes || "-"}</p>
          </div>

          {/* Przyciski */}
          <div className="d-grid gap-2">
            <button className="btn btn-warning btn-lg" onClick={handleEdit}>
              Edit Referral
            </button>
            <button className="btn btn-outline-secondary btn-lg" onClick={handleBack}>
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDetail;

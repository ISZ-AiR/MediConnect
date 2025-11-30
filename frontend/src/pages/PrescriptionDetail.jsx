import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import {useAuth} from "../context/AuthContext.jsx";

const PrescriptionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const rolePrefix = user?.role === "doctor" ? "doctor" : "admin";
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPrescription = async () => {
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
    if (id) loadPrescription();
  }, [id]);

  const handleEdit = () => {
    navigate(`/${rolePrefix}/prescriptions/edit/${item.prescription_id}`);
  };

  const handleBack = () => {
    navigate('/${rolePrefix}/prescriptions');
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
        <div className="container py-5 text-center">Prescription not found</div>
      </div>
    );

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5 d-flex justify-content-center">
        <div className="bg-white p-4 rounded shadow-sm" style={{ maxWidth: "600px", width: "100%" }}>

          {/* Ikonka i nagłówek */}
          <div className="text-center mb-4">
            <i className="bi bi-capsule text-warning" style={{ fontSize: "3rem" }}></i>
            <h2 className="fw-bold mt-3">Prescription Details</h2>
          </div>

          {/* Sekcja: wizyta i pacjent */}
          <div className="mb-3 pb-3 border-bottom">
            <p><span className="fw-bold">Prescription ID:</span> {item.prescription_id}</p>
            <p><span className="fw-bold">Visit ID:</span> {item.visit_id}</p>
            <p><span className="fw-bold">Visit Date:</span> {item.visit_date}</p>
            <p><span className="fw-bold">Patient:</span> {item.patient_name}</p>
            <p><span className="fw-bold">PESEL:</span> {item.patient_pesel}</p>
            <p><span className="fw-bold">Doctor:</span> {item.doctor_name}</p>
          </div>

          {/* Sekcja: lek i instrukcje */}
          <div className="mb-4">
            <p><span className="fw-bold">Medication:</span> {item.medication}</p>
            <p><span className="fw-bold">Dosage:</span> {item.dosage}</p>
            <p><span className="fw-bold">Instruction:</span> {item.instruction || "-"}</p>
          </div>

          {/* Przyciski */}
          <div className="d-grid gap-2">
            <button className="btn btn-warning btn-lg" onClick={handleEdit}>
              Edit Prescription
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

export default PrescriptionDetail;

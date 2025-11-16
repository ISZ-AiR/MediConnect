import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import { useParams, Link } from "react-router-dom";

const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/patients/${id}`, { method: "GET" });
        setPatient(res.success ? res.data : res);
      } catch (err) {
        console.error(err);
        setError("Failed to load patient");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading)
    return (
      <div className="min-vh-100">
        <Navbar />
        <div className="container py-5">Loading...</div>
      </div>
    );
  if (error)
    return (
      <div className="min-vh-100">
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  if (!patient)
    return (
      <div className="min-vh-100">
        <Navbar />
        <div className="container py-5">Patient not found</div>
      </div>
    );

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            Patient: {patient.user?.first_name} {patient.user?.last_name}
          </h2>
          <div>
            <Link
              to={`/admin/patients`}
              className="btn btn-outline-secondary me-2"
            >
              Back
            </Link>
            <Link
              to={`/admin/patients/edit/${patient.patient_id}`}
              className="btn btn-primary"
            >
              Edit
            </Link>
          </div>
        </div>

        <div className="card p-4">
          <p>
            <strong>Email:</strong> {patient.user?.email}
          </p>
          <p>
            <strong>Phone:</strong> {patient.user?.phone}
          </p>
          <p>
            <strong>PESEL:</strong> {patient.pesel}
          </p>
          <p>
            <strong>Birth date:</strong> {patient.birth_date}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;

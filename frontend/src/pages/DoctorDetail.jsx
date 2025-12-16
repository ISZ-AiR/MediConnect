import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import { useParams, Link, useNavigate } from "react-router-dom";

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/doctor/${id}`, { method: "GET" });
        setDoctor(res.success ? res.data : res);
      } catch (err) {
        console.error(err);
        setError("Failed to load doctor");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning"></div>
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

  if (!doctor)
    return (
      <div className="min-vh-100">
        <Navbar />
        <div className="container py-5">Doctor not found</div>
      </div>
    );

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            Doctor: {doctor.user?.first_name} {doctor.user?.last_name}
          </h2>
          <div>
            <Link
              to={`/admin/doctors`}
              className="btn btn-outline-secondary me-2"
            >
              Back
            </Link>
            <Link
              to={`/admin/doctors/edit/${doctor.doctor_id}`}
              className="btn btn-primary"
            >
              Edit
            </Link>
          </div>
        </div>

        <div className="card p-4">
          <p>
            <strong>Email:</strong> {doctor.user?.email}
          </p>
          <p>
            <strong>Phone:</strong> {doctor.user?.phone}
          </p>
          <p>
            <strong>Specialization:</strong> {doctor.specialization}
          </p>
          <p>
            <strong>License:</strong> {doctor.license_number}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;

import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import { useParams, useNavigate } from "react-router-dom";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [patientRes, usersRes] = await Promise.all([
          apiRequest(`/patients/${id}`),
          apiRequest("/users"),
        ]);

        const patientData = patientRes.success ? patientRes.data : patientRes;
        const usersData = usersRes?.data || [];

        setPatient(patientData);
        setUsers(usersData);
      } catch (err) {
        console.error(err);
        setError("Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id]);

  const getUser = (user_id) => {
    return users.find((u) => u.user_id === user_id);
  };

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

  const user = getUser(patient.user_id);

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-9 col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-5 text-center">
                <i
                  className="bi bi-person-circle text-primary"
                  style={{ fontSize: "3rem" }}
                ></i>

                <h2 className="fw-bold mt-3 mb-2">Patient Details</h2>
                <p className="text-muted">Review Patient Details</p>

                <div className="text-start mt-4">
                  <h5 className="mb-3">
                    <i className="bi bi-person-vcard me-2"></i>
                    Personal Information
                  </h5>

                  <div className="mb-3">
                    <strong>First Name:</strong> {user?.first_name}
                  </div>
                  <div className="mb-3">
                    <strong>Last Name:</strong> {user?.last_name}
                  </div>
                  <div className="mb-3">
                    <strong>Email:</strong> {user?.email}
                  </div>
                  <div className="mb-3">
                    <strong>Phone:</strong> {user?.phone}
                  </div>
                  <div className="mb-3">
                    <strong>PESEL:</strong> {patient.pesel}
                  </div>
                  <div className="mb-3">
                    <strong>Birth Date:</strong> {patient.birth_date}
                  </div>
                </div>

                <div className="mt-4 d-grid gap-2">
                  <button
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => navigate("/receptionist/patients")}
                  >
                    Back
                  </button>

                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() =>
                      navigate(
                        `/receptionist/patients/edit/${patient.patient_id}`
                      )
                    }
                  >
                    Edit Patient
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;

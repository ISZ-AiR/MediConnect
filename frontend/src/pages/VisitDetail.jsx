import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";

const VisitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visit, setVisit] = useState(null);
  const [users, setUsers] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [
          visitRes,
          usersRes,
          nursesRes,
          reservationsRes,
          doctorsRes,
          prescriptionsRes,
          referralsRes,
          diagnosesRes,
        ] = await Promise.all([
          apiRequest(`/visits/${id}`),
          apiRequest("/users"),
          apiRequest("/nurse"),
          apiRequest("/reservation"),
          apiRequest("/doctor"),
          apiRequest("/prescriptions"),
          apiRequest("/referrals"),
          apiRequest("/diagnosis"),
        ]);

        setVisit(visitRes?.data || null);
        setUsers(usersRes?.data || []);
        setNurses(nursesRes?.data || []);
        setReservations(reservationsRes?.data || []);
        setDoctors(doctorsRes?.data || []);
        setPrescriptions(
          (prescriptionsRes?.data || []).filter(
            (p) => p.visit_id === parseInt(id)
          )
        );
        setReferrals(
          (referralsRes?.data || []).filter((r) => r.visit_id === parseInt(id))
        );
        setDiagnoses(
          (diagnosesRes?.data || []).filter((d) => d.visit_id === parseInt(id))
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load visit details");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadData();
  }, [id]);

  const getUserName = (user_id) => {
    const user = users.find((u) => u.user_id === user_id);
    return user ? `${user.first_name} ${user.last_name}` : "N/A";
  };

  const getNurseName = (nurse_id) => {
    const nurse = nurses.find((n) => n.nurse_id === nurse_id);
    if (!nurse) return "N/A";
    return getUserName(nurse.user_id);
  };

  const getDoctorName = (reservation_id) => {
    const reservation = reservations.find(
      (r) => r.reservation_id === reservation_id
    );
    if (!reservation) return "N/A";
    const doctor = doctors.find((d) => d.doctor_id === reservation.doctor_id);
    if (!doctor) return "N/A";
    return getUserName(doctor.user_id);
  };

  if (loading)
    return (
      <div className="min-vh-100">
        {" "}
        <Navbar />{" "}
        <div className="container py-5 text-center">
          {" "}
          <div className="spinner-border text-warning" role="status"></div>{" "}
        </div>{" "}
      </div>
    );

  if (error)
    return (
      <div className="min-vh-100">
        {" "}
        <Navbar />{" "}
        <div className="container py-5">
          {" "}
          <div className="alert alert-danger">{error}</div>{" "}
        </div>{" "}
      </div>
    );

  if (!visit)
    return (
      <div className="min-vh-100">
        {" "}
        <Navbar />{" "}
        <div className="container py-5 text-center">Visit not found</div>{" "}
      </div>
    );

  return (
    <div className="min-vh-100 bg-light">
      {" "}
      <Navbar />{" "}
      <div className="container py-5">
        {" "}
        <div className="row justify-content-center">
          {" "}
          <div className="col-md-9 col-lg-8">
            {" "}
            <div className="card shadow-sm border-0">
              {" "}
              <div className="card-body p-5 text-center">
                <i
                  className="bi bi-calendar-plus text-warning"
                  style={{ fontSize: "3rem" }}
                ></i>{" "}
                <h2 className="fw-bold mt-3 mb-2">Visit Details</h2>{" "}
                <p className="text-muted">Review visit information</p>
                <div className="text-start mt-4">
                  <h5 className="mb-3">
                    <i className="bi bi-info-circle me-2"></i>General
                    Information
                  </h5>
                  <div className="mb-2">
                    <i className="bi bi-hash me-2"></i>
                    <strong>Visit ID:</strong> {visit.visit_id || "N/A"}
                  </div>
                  <div className="mb-2">
                    <i className="bi bi-card-list me-2"></i>
                    <strong>Reservation ID:</strong>{" "}
                    {visit.reservation_id || "N/A"}
                  </div>
                  <div className="mb-2">
                    <i className="bi bi-calendar-event me-2"></i>
                    <strong>Visit Date:</strong> {visit.visit_date || "N/A"}
                  </div>
                  <div className="mb-2">
                    <i className="bi bi-person-lines-fill me-2"></i>
                    <strong>Nurse:</strong> {getNurseName(visit.nurse_id)}
                  </div>
                  <div className="mb-2">
                    <i className="bi bi-person-badge me-2"></i>
                    <strong>Doctor:</strong>{" "}
                    {getDoctorName(visit.reservation_id)}
                  </div>
                  <div className="mb-2">
                    <i className="bi bi-journal-text me-2"></i>
                    <strong>Notes:</strong> {visit.visit_note || "N/A"}
                  </div>

                  <h5 className="mt-4 mb-2">
                    <i className="bi bi-capsule me-2"></i>Prescriptions
                  </h5>
                  {prescriptions.length > 0 ? (
                    <ul>
                      {prescriptions.map((p) => (
                        <li key={p.prescription_id}>
                          {p.medication} - {p.dosage} ({p.instruction})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>N/A</p>
                  )}

                  <h5 className="mt-4 mb-2">
                    <i className="bi bi-card-checklist me-2"></i>Referrals
                  </h5>
                  {referrals.length > 0 ? (
                    <ul>
                      {referrals.map((r) => (
                        <li key={r.referral_id}>
                          Examination: {r.examination?.name || "N/A"}, Notes:{" "}
                          {r.notes || "N/A"}, Completed:{" "}
                          {r.is_completed ? "Yes" : "No"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>N/A</p>
                  )}

                  <h5 className="mt-4 mb-2">
                    <i className="bi bi-heart-pulse me-2"></i>Diagnoses
                  </h5>
                  {diagnoses.length > 0 ? (
                    <ul>
                      {diagnoses.map((d) => (
                        <li key={d.diagnosis_id}>
                          {d.disease?.name || "N/A"} - Notes:{" "}
                          {d.doctor_notes || "N/A"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>N/A</p>
                  )}
                </div>
                <div className="mt-4 d-grid gap-2">
                  <button
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => navigate("/receptionist/visits")}
                  >
                    Back
                  </button>
                  <button
                    className="btn btn-warning btn-lg"
                    onClick={() =>
                      navigate(`/receptionist/visits/edit/${visit.visit_id}`)
                    }
                  >
                    Edit Visit
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

export default VisitDetail;

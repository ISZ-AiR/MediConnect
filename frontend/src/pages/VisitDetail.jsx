import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import VisitDetailsPanel from "../components/VisitDetailsPanel";
import { useVisitDetails } from "../hooks/useVisitDetails";

const VisitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    visit,
    prescriptions,
    referrals,
    diagnoses,
    loading,
    error,
    getNurseName,
    getDoctorNameFromReservation,
  } = useVisitDetails(id);

  if (loading)
    return (
      <div className="min-vh-100">
        <Navbar />
        <div className="container py-5 text-center">
          <div className="spinner-border text-warning" role="status"></div>
        </div>
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

  if (!visit)
    return (
      <div className="min-vh-100">
        <Navbar />
        <div className="container py-5 text-center">Visit not found</div>
      </div>
    );

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-9 col-lg-8">
            <VisitDetailsPanel
              visit={visit}
              prescriptions={prescriptions}
              referrals={referrals}
              diagnoses={diagnoses}
              getNurseName={getNurseName}
              getDoctorName={getDoctorNameFromReservation}
              color="warning"
              onBack={() => navigate("/receptionist/visits")}
              onEdit={() =>
                navigate(`/receptionist/visits/edit/${visit.visit_id}`)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitDetail;

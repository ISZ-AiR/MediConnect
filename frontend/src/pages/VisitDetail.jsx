import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import VisitDetailsPanel from "../components/VisitDetailsPanel";
import { useVisitDetails } from "../hooks/useVisitDetails";
import { useAuth } from "../context/AuthContext";
import { resourceService } from "../services/resourceService";

const VisitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDoctor = user?.role === "doctor";
  const rolePrefix = isDoctor ? "doctor" : "receptionist";

  const {
    visit,
    prescriptions,
    referrals,
    diagnoses,
    loading,
    error,
    getPatientNameFromReservation,
    getPatientPESELFromReservation,
    getNurseName,
    getDoctorNameFromReservation
  } = useVisitDetails(id, user?.role);

  const prescriptionsData = isDoctor ? prescriptions : [];
  const referralsData = isDoctor ? referrals : [];
  const diagnosesData = isDoctor ? diagnoses : [];

  const handleDelete = async (type, itemId) => {
    if (!isDoctor) return;

    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      switch(type) {
        case "prescriptions":
          await resourceService.deletePrescription(itemId);
          break;
        case "referrals":
          await resourceService.deleteReferral(itemId);
          break;
        case "diagnoses":
          await resourceService.deleteDiagnosis(itemId);
          break;
        default:
          console.warn("Unknown type for deletion:", type);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete item. Try again.");
    }
  };

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
              prescriptions={prescriptionsData}
              referrals={referralsData}
              diagnoses={diagnosesData}
              getPatientName={getPatientNameFromReservation}
              getPatientPESEL={getPatientPESELFromReservation}
              getNurseName={getNurseName}
              getDoctorName={getDoctorNameFromReservation}
              color="warning"
              isDoctor={isDoctor}

              onBack={() => navigate(`/${rolePrefix}/visits`)}

              onEdit={(section, itemId) => {
                if (section === "prescriptions" || section === "referrals" || section === "diagnoses") {
                  if (!isDoctor) return;
                  if (section === "prescriptions")
                    return navigate(`/${rolePrefix}/prescriptions/edit/${visit.visit_id}/${itemId}`);
                  if (section === "referrals")
                    return navigate(`/${rolePrefix}/referrals/edit/${visit.visit_id}/${itemId}`);
                  if (section === "diagnoses")
                    return navigate(`/${rolePrefix}/diagnosis/edit/${visit.visit_id}/${itemId}`);
                } else {
                  return navigate(`/${rolePrefix}/visits/edit/${visit.visit_id}`);
                }
              }}

              onAdd={(section) => {
                if (!isDoctor) return;
                if (section === "prescriptions")
                  return navigate(`/${rolePrefix}/prescriptions/add/${visit.visit_id}`);
                if (section === "referrals")
                  return navigate(`/${rolePrefix}/referrals/add/${visit.visit_id}`);
                if (section === "diagnoses")
                  return navigate(`/${rolePrefix}/diagnosis/add/${visit.visit_id}`);
              }}

              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitDetail;

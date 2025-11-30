import React, { useEffect, useState } from "react";
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

  const {
    visit,
    prescriptions: prescData,
    referrals: refData,
    diagnoses: diagData,
    loading,
    error,
    getPatientNameFromReservation,
    getPatientPESELFromReservation,
    getNurseName,
    getDoctorNameFromReservation
  } = useVisitDetails(id);

  const [prescriptions, setPrescriptions] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);

  const [referralsWithName, setReferralsWithName] = useState([]);
  const [diagnosesWithName, setDiagnosesWithName] = useState([]);

  useEffect(() => {
    setPrescriptions(prescData || []);
    setReferrals(refData || []);
    setDiagnoses(diagData || []);
  }, [prescData, refData, diagData]);

  useEffect(() => {
    const enrichData = async () => {
      try {
        const examList = await resourceService.listExaminations();
        const diseaseList = await resourceService.listDiseases();

        setReferralsWithName(
          (referrals || []).map(r => ({
            ...r,
            examination: examList.find(e => e.examination_id === r.examination_id) || { name: "N/A" }
          }))
        );

        setDiagnosesWithName(
          (diagnoses || []).map(d => ({
            ...d,
            disease: diseaseList.find(x => x.disease_id === d.disease_id) || { name: "N/A" }
          }))
        );
      } catch (err) {
        console.error("Failed to enrich referral/diagnosis data:", err);
      }
    };

    enrichData();
  }, [referrals, diagnoses]);

  const handleDelete = async (type, itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      switch(type) {
        case "prescriptions":
          await resourceService.deletePrescription(itemId);
          setPrescriptions(prev => prev.filter(p => p.prescription_id !== itemId));
          break;
        case "referrals":
          await resourceService.deleteReferral(itemId);
          setReferrals(prev => prev.filter(r => r.referral_id !== itemId));
          break;
        case "diagnoses":
          await resourceService.deleteDiagnosis(itemId);
          setDiagnoses(prev => prev.filter(d => d.diagnosis_id !== itemId));
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

  const rolePrefix = user?.role === "doctor" ? "/doctor" : "/receptionist";

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-9 col-lg-8">
            <VisitDetailsPanel
              visit={visit}
              prescriptions={prescriptions}
              referrals={referralsWithName}
              diagnoses={diagnosesWithName}
              getPatientName={getPatientNameFromReservation}
              getPatientPESEL={getPatientPESELFromReservation}
              getNurseName={getNurseName}
              getDoctorName={getDoctorNameFromReservation}
              color="warning"
              isDoctor={user?.role === "doctor"}

              onBack={() => navigate(`${rolePrefix}/visits`)}

              onEdit={(section, itemId) => {
                if (section === "prescriptions")
                  return navigate(`${rolePrefix}/prescriptions/edit/${visit.visit_id}/${itemId}`);
                if (section === "referrals")
                  return navigate(`${rolePrefix}/referrals/edit/${visit.visit_id}/${itemId}`);
                if (section === "diagnoses")
                  return navigate(`${rolePrefix}/diagnosis/edit/${visit.visit_id}/${itemId}`);
                return navigate(`${rolePrefix}/visits/edit/${visit.visit_id}`);
              }}

              onAdd={(section) => {
                if (section === "prescriptions")
                  return navigate(`${rolePrefix}/prescriptions/add/${visit.visit_id}`);
                if (section === "referrals")
                  return navigate(`${rolePrefix}/referrals/add/${visit.visit_id}`);
                if (section === "diagnoses")
                  return navigate(`${rolePrefix}/diagnosis/add/${visit.visit_id}`);
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

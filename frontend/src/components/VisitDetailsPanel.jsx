import React from "react";

export const VisitDetailsPanel = ({
  visit,
  prescriptions,
  referrals,
  diagnoses,
  getPatientName,
  getPatientPESEL,
  getNurseName,
  getDoctorName,
  color = "warning",
  onBack,
  onEdit,
  onAdd,
  onDelete,
  isDoctor = false,
  isNurse = false
}) => {
  if (!visit) return <div className="text-center py-5">Visit not found</div>;

const sectionItem = (title, items, type) => {
  const typeIdMap = {
    prescriptions: "prescription_id",
    referrals: "referral_id",
    diagnoses: "diagnosis_id",
  };

  const idKey = typeIdMap[type];

  return (
    <div className="mb-4">
      <h5 className="mb-3">
        <i className={`bi ${type === "prescriptions" ? "bi-capsule" : "bi-card-checklist"} me-2`}></i>
        {title}
      </h5>

      {items.length > 0 ? (
        items.map((item) => (
          <div key={item[idKey]} className="p-3 mb-3 border rounded">

            {type === "prescriptions" && (
              <>
                <div><strong>Medication:</strong> {item.medication}</div>
                <div><strong>Dosage:</strong> {item.dosage}</div>
                <div><strong>Instruction:</strong> {item.instruction}</div>
              </>
            )}

            {type === "referrals" && (
              <>
                <div>
                  <strong>Exam:</strong> {item.examination_id} – {item.examination?.name || "N/A"}
                </div>
                <div><strong>Notes:</strong> {item.notes || "N/A"}</div>
                <div><strong>Completed:</strong> {item.is_completed ? "Yes" : "No"}</div>
              </>
            )}

            {type === "diagnoses" && (
              <>
                <div>
                  <strong>Disease:</strong> {item.disease_id} – {item.disease?.name || "N/A"}
                </div>
                <div><strong>Date:</strong> {item.diagnosis_date}</div>
                <div><strong>Notes:</strong> {item.doctor_notes}</div>
              </>
            )}

            {isDoctor && (
              <div className="mt-2 d-flex gap-2 justify-content-end">
                <button
                  className="btn btn-sm btn-outline-warning"
                  onClick={() => onEdit(type, item[idKey])}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onDelete(type, item[idKey])}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>N/A</p>
      )}

      {isDoctor && (
        <button
          className={`btn btn-${color} btn-lg mt-2`}
          onClick={() => onAdd(type)}
        >
          Add {type.slice(0, -1).charAt(0).toUpperCase() + type.slice(1, -1)}
        </button>
      )}
    </div>
  );
};


  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-5 text-center">
        <i className={`bi bi-calendar-plus text-${color}`} style={{ fontSize: "3rem" }}></i>
        <h2 className="fw-bold mt-3 mb-2">Visit Details</h2>
        <p className="text-muted">Review visit information</p>

        <div className="text-start mt-4" style={{maxWidth: "900px", margin: "0 auto"}}>
          {/* GENERAL INFO */}
          <h5 className="mb-3"><i className="bi bi-info-circle me-2"></i>General Information</h5>
          <div className="mb-3 border-bottom pb-2"><strong>Visit ID:</strong> {visit.visit_id}</div>
          <div className="mb-3 border-bottom pb-2"><strong>Reservation ID:</strong> {visit.reservation_id}</div>
          <div className="mb-3 border-bottom pb-2"><strong>Visit Date:</strong> {visit.visit_date + " " + visit.visit_time}</div>
          <div className="mb-3 border-bottom pb-2"><strong>Patient:</strong> {getPatientName(visit.reservation_id)}</div>
          <div className="mb-3 border-bottom pb-2"><strong>Patient PESEL:</strong> {getPatientPESEL(visit.reservation_id)}</div>
          <div className="mb-3 border-bottom pb-2"><strong>Nurse:</strong> {getNurseName(visit.nurse_id)}</div>
          <div className="mb-3 border-bottom pb-2"><strong>Doctor:</strong> {getDoctorName(visit.reservation_id)}</div>

          {/* SECTIONS */}
          {sectionItem("Prescriptions", prescriptions, "prescriptions")}
          {sectionItem("Referrals", referrals, "referrals")}
          {sectionItem("Diagnoses", diagnoses, "diagnoses")}

        </div>

        {/* FOOTER */}
        <div className="mt-4 d-grid gap-2">
          {onBack && <button className="btn btn-outline-secondary btn-lg" onClick={onBack}>Back</button>}
          {onEdit && <button className={`btn btn-${color} btn-lg`} onClick={() => onEdit("visit")} disabled={isNurse}>Edit Visit</button>}
        </div>
      </div>
    </div>
  );
};

export default VisitDetailsPanel;

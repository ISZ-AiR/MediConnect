import React from "react";

// Reusable panel for visit details. Accepts all entities + helper name resolvers.
export const VisitDetailsPanel = ({
  visit,
  prescriptions,
  referrals,
  diagnoses,
  getNurseName,
  getDoctorName,
  color = "warning", // bootstrap color variant for icon
  onBack,
  onEdit,
}) => {
  if (!visit) return <div className="text-center py-5">Visit not found</div>;

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-5 text-center">
        <i
          className={`bi bi-calendar-plus text-${color}`}
          style={{ fontSize: "3rem" }}
        ></i>
        <h2 className="fw-bold mt-3 mb-2">Visit Details</h2>
        <p className="text-muted">Review visit information</p>
        <div className="text-start mt-4">
          <h5 className="mb-3">
            <i className="bi bi-info-circle me-2"></i>General Information
          </h5>
          <div className="mb-2">
            <i className="bi bi-hash me-2"></i>
            <strong>Visit ID:</strong> {visit.visit_id || "N/A"}
          </div>
          <div className="mb-2">
            <i className="bi bi-card-list me-2"></i>
            <strong>Reservation ID:</strong> {visit.reservation_id || "N/A"}
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
            <strong>Doctor:</strong> {getDoctorName(visit.reservation_id)}
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
                  {r.notes || "N/A"}, Completed: {r.is_completed ? "Yes" : "No"}
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
                  {d.disease?.name || "N/A"} - Notes: {d.doctor_notes || "N/A"}
                </li>
              ))}
            </ul>
          ) : (
            <p>N/A</p>
          )}
        </div>
        <div className="mt-4 d-grid gap-2">
          {onBack && (
            <button
              className="btn btn-outline-secondary btn-lg"
              onClick={onBack}
            >
              Back
            </button>
          )}
          {onEdit && (
            <button className={`btn btn-${color} btn-lg`} onClick={onEdit}>
              Edit Visit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitDetailsPanel;

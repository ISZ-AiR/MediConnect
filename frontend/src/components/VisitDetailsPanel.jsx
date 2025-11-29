import React from "react";

export const VisitDetailsPanel = ({
  visit,
  prescriptions,
  referrals,
  diagnoses,
  getNurseName,
  getDoctorName,
  color = "warning",
  onBack,
  onEdit,
  onAdd,
  isDoctor = false
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
          {/* ---------------- GENERAL ---------------- */}
          <h5 className="mb-3">
            <i className="bi bi-info-circle me-2"></i>General Information
          </h5>

          <div className="mb-2">
            <strong>Visit ID:</strong> {visit.visit_id}
          </div>
          <div className="mb-2">
            <strong>Reservation ID:</strong> {visit.reservation_id}
          </div>
          <div className="mb-2">
            <strong>Visit Date:</strong> {visit.visit_date}
          </div>
          <div className="mb-2">
            <strong>Nurse:</strong> {getNurseName(visit.nurse_id)}
          </div>
          <div className="mb-2">
            <strong>Doctor:</strong> {getDoctorName(visit.reservation_id)}
          </div>

          {/* ---------------- PRESCRIPTIONS ---------------- */}
          <h5 className="mt-4 mb-2">
            <i className="bi bi-capsule me-2"></i>Prescriptions
          </h5>

          {prescriptions.length > 0 ? (
            <ul>
              {prescriptions.map((p) => (
                <li key={p.prescription_id}>
                  {p.medication} – {p.dosage} ({p.instruction})
                </li>
              ))}
            </ul>
          ) : (
            <p>N/A</p>
          )}

          {isDoctor && (
            <div className="mt-2 d-flex gap-2">
              {prescriptions.length > 0 && (
                <button
                  className={`btn btn-outline-${color} btn-lg`}
                  onClick={() => onEdit("prescriptions")}
                >
                  Edit Prescription
                </button>
              )}
              {prescriptions.length === 0 && (
                <button
                  className={`btn btn-${color} btn-lg`}
                  onClick={() => onAdd("prescriptions")}
                >
                  Add Prescription
                </button>
              )}
            </div>
          )}

          {/* ---------------- REFERRALS ---------------- */}
          <h5 className="mt-4 mb-2">
            <i className="bi bi-card-checklist me-2"></i>Referrals
          </h5>

          {referrals.length > 0 ? (
            <ul>
              {referrals.map((r) => (
                <li key={r.referral_id}>
                  Exam: {r.examination?.name}, Notes: {r.notes || "N/A"},
                  Completed: {r.is_completed ? "Yes" : "No"}
                </li>
              ))}
            </ul>
          ) : (
            <p>N/A</p>
          )}

          {isDoctor && (
            <div className="mt-2 d-flex gap-2">
              {referrals.length > 0 && (
                <button
                  className={`btn btn-outline-${color} btn-lg`}
                  onClick={() => onEdit("referrals")}
                >
                  Edit Referral
                </button>
              )}
              {referrals.length === 0 && (
                <button
                  className={`btn btn-${color} btn-lg`}
                  onClick={() => onAdd("referrals")}
                >
                  Add Referral
                </button>
              )}
            </div>
          )}

          {/* ---------------- DIAGNOSES ---------------- */}
          <h5 className="mt-4 mb-2">
            <i className="bi bi-heart-pulse me-2"></i>Diagnoses
          </h5>

          {diagnoses.length > 0 ? (
            <ul>
              {diagnoses.map((d) => (
                <li key={d.diagnosis_id}>
                  {d.disease?.name} — Notes: {d.doctor_notes || "N/A"}
                </li>
              ))}
            </ul>
          ) : (
            <p>N/A</p>
          )}

          {isDoctor && (
            <div className="mt-2 d-flex gap-2">
              {diagnoses.length > 0 && (
                <button
                  className={`btn btn-outline-${color} btn-lg`}
                  onClick={() => onEdit("diagnoses")}
                >
                  Edit Diagnoses
                </button>
              )}
              {diagnoses.length === 0 && (
                <button
                  className={`btn btn-${color} btn-lg`}
                  onClick={() => onAdd("diagnoses")}
                >
                  Add Diagnoses
                </button>
              )}
            </div>
          )}
        </div>

        {/* ---------------- FOOTER ---------------- */}
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
            <button
              className={`btn btn-${color} btn-lg`}
              onClick={() => onEdit("visit")}
            >
              Edit Visit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitDetailsPanel;

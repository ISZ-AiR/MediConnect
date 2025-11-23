import React, { useMemo } from "react";
import PropTypes from "prop-types";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import ListScaffold from "../components/ListScaffold";
import { Link } from "react-router-dom";
import { useFetchResource } from "../hooks/useFetchResource";

// Custom wrapper to aggregate related resources then derive columns.
const VisitsListInner = () => {
  // Visits will be fetched directly by ListScaffold via fetchFn; no local hook needed.
  const { items: users } = useFetchResource(
    async () => (await apiRequest("/users"))?.data || []
  );
  const { items: nurses } = useFetchResource(
    async () => (await apiRequest("/nurse"))?.data || []
  );
  const { items: reservations } = useFetchResource(
    async () => (await apiRequest("/reservation"))?.data || []
  );
  const { items: doctors } = useFetchResource(
    async () => (await apiRequest("/doctor"))?.data || []
  );

  const nurseName = (nurse_id) => {
    const nurse = nurses.find((n) => n.nurse_id === nurse_id);
    if (!nurse) return nurse_id;
    const user = users.find((u) => u.user_id === nurse.user_id);
    return user ? `${user.first_name} ${user.last_name}` : nurse_id;
  };
  const doctorName = (reservation_id) => {
    const reservation = reservations.find(
      (r) => r.reservation_id === reservation_id
    );
    if (!reservation) return "-";
    const doctor = doctors.find((d) => d.doctor_id === reservation.doctor_id);
    if (!doctor) return `Doctor ${reservation.doctor_id}`;
    const docUser = users.find((u) => u.user_id === doctor.user_id);
    return docUser
      ? `${docUser.first_name} ${docUser.last_name}`
      : `Doctor ${doctor.doctor_id}`;
  };

  const columns = useMemo(
    () => [
      { header: "Visit ID", render: (v) => v.visit_id },
      { header: "Reservation ID", render: (v) => v.reservation_id },
      { header: "Date", render: (v) => v.visit_date },
      { header: "Nurse", render: (v) => nurseName(v.nurse_id) },
      { header: "Doctor", render: (v) => doctorName(v.reservation_id) },
      { header: "Note", render: (v) => v.visit_note || "" },
    ],
    [nurses, users, reservations, doctors]
  );

  return (
    <ListScaffold
      title="Visits"
      fetchFn={async () => (await apiRequest("/visits"))?.data || []}
      createLabel={null}
      columns={columns}
      actions={renderVisitActions}
    />
  );
};

function VisitActions({ visit, onDeleted }) {
  return (
    <div className="btn-group">
      <Link
        to={`/receptionist/visits/${visit.visit_id}`}
        className="btn btn-sm btn-outline-primary"
      >
        View
      </Link>
      <Link
        to={`/receptionist/visits/edit/${visit.visit_id}`}
        className="btn btn-sm btn-outline-secondary"
      >
        Edit
      </Link>
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={async () => {
          if (!globalThis.confirm("Delete this visit?")) return;
          try {
            await apiRequest(`/visits/${visit.visit_id}`, { method: "DELETE" });
            onDeleted();
          } catch (err) {
            console.error(err);
            alert("Failed to delete visit");
          }
        }}
      >
        Delete
      </button>
    </div>
  );
}

VisitActions.propTypes = {
  visit: PropTypes.object.isRequired,
  onDeleted: PropTypes.func.isRequired,
};

// Row renderer receives (row, index, utils) from ListScaffold; use utils.reload
const renderVisitActions = (v, _i, utils) => (
  <VisitActions visit={v} onDeleted={utils.reload} />
);

const VisitsList = () => (
  <div className="min-vh-100 bg-light">
    <Navbar />
    <div className="container py-5">
      <VisitsListInner />
    </div>
  </div>
);

export default VisitsList;

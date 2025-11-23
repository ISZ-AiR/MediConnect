import React from "react";
import PropTypes from "prop-types";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";
import ListScaffold from "../components/ListScaffold";
import { Link } from "react-router-dom";

function PrescriptionActions({ prescription }) {
  return (
    <div className="btn-group">
      <Link
        to={`/admin/prescriptions/${prescription.prescription_id}`}
        className="btn btn-sm btn-outline-primary"
      >
        View
      </Link>
      <Link
        to={`/admin/prescriptions/edit/${prescription.prescription_id}`}
        className="btn btn-sm btn-outline-secondary"
      >
        Edit
      </Link>
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={async () => {
          if (!globalThis.confirm("Delete this prescription?")) return;
          try {
            await apiRequest(`/prescriptions/${prescription.prescription_id}`, {
              method: "DELETE",
            });
            globalThis.location.reload();
          } catch (err) {
            console.error(err);
            alert("Failed to delete prescription");
          }
        }}
      >
        Delete
      </button>
    </div>
  );
}

PrescriptionActions.propTypes = {
  prescription: PropTypes.object.isRequired,
};

const renderPrescriptionActions = (p) => (
  <PrescriptionActions prescription={p} />
);

const PrescriptionsList = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <ListScaffold
        title="Prescriptions"
        fetchFn={resourceService.listPrescriptions}
        createLabel="Create Prescription"
        createPath="/admin/prescriptions/create"
        columns={[
          { header: "Visit ID", render: (p) => p.visit_id },
          { header: "Medication", render: (p) => p.medication },
          { header: "Dosage", render: (p) => p.dosage },
          { header: "Instruction", render: (p) => p.instruction || "" },
        ]}
        actions={renderPrescriptionActions}
      />
    </div>
  );
};

export default PrescriptionsList;

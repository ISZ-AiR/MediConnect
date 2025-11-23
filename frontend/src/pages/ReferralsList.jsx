import React from "react";
import PropTypes from "prop-types";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";
import ListScaffold from "../components/ListScaffold";
import { Link } from "react-router-dom";

function ReferralActions({ referral }) {
  return (
    <div className="btn-group">
      <Link
        to={`/admin/referrals/${referral.referral_id}`}
        className="btn btn-sm btn-outline-primary"
      >
        View
      </Link>
      <Link
        to={`/admin/referrals/edit/${referral.referral_id}`}
        className="btn btn-sm btn-outline-secondary"
      >
        Edit
      </Link>
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={async () => {
          if (!globalThis.confirm("Delete this referral?")) return;
          try {
            await apiRequest(`/referrals/${referral.referral_id}`, {
              method: "DELETE",
            });
            globalThis.location.reload();
          } catch (err) {
            console.error(err);
            alert("Failed to delete referral");
          }
        }}
      >
        Delete
      </button>
    </div>
  );
}

ReferralActions.propTypes = {
  referral: PropTypes.object.isRequired,
};

const renderReferralActions = (r) => <ReferralActions referral={r} />;

const ReferralsList = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <ListScaffold
        title="Referrals"
        fetchFn={resourceService.listReferrals}
        createLabel="Create Referral"
        createPath="/admin/referrals/create"
        columns={[
          { header: "Visit ID", render: (r) => r.visit_id },
          { header: "Examination ID", render: (r) => r.examination_id },
          { header: "Doctor ID", render: (r) => r.doctor_id },
          {
            header: "Completed",
            render: (r) => (r.is_completed ? "Yes" : "No"),
          },
          { header: "Notes", render: (r) => r.notes || "" },
        ]}
        actions={renderReferralActions}
      />
    </div>
  );
};

export default ReferralsList;

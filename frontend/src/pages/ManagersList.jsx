import React from "react";
import PropTypes from "prop-types";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";
import ListScaffold from "../components/ListScaffold";
import { Link } from "react-router-dom";

function ManagerActions({ manager }) {
  return (
    <div className="btn-group">
      <Link
        to={`/admin/managers/${manager.user_id}`}
        className="btn btn-sm btn-outline-primary"
      >
        View
      </Link>
      <Link
        to={`/admin/managers/edit/${manager.user_id}`}
        className="btn btn-sm btn-outline-secondary"
      >
        Edit
      </Link>
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={async () => {
          if (!globalThis.confirm("Delete this manager?")) return;
          try {
            await apiRequest(`/managers/${manager.user_id}`, {
              method: "DELETE",
            });
            globalThis.location.reload();
          } catch (err) {
            console.error(err);
            alert("Failed to delete manager");
          }
        }}
      >
        Delete
      </button>
    </div>
  );
}

ManagerActions.propTypes = {
  manager: PropTypes.object.isRequired,
};

const renderManagerActions = (m) => <ManagerActions manager={m} />;

const ManagersList = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <ListScaffold
        title="Managers"
        fetchFn={resourceService.listManagers}
        createLabel="Create Manager"
        createPath="/admin/managers/create"
        columns={[
          {
            header: "Name",
            render: (m) => {
              const fn = m.first_name || "";
              const ln = m.last_name || "";
              const name = `${fn} ${ln}`.trim();
              return name || "(no name)";
            },
          },
          { header: "Email", render: (m) => m.email || "" },
          { header: "Phone", render: (m) => m.phone || "" },
        ]}
        actions={renderManagerActions}
      />
    </div>
  );
};

export default ManagersList;

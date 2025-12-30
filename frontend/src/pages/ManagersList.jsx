import React from "react";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";
import ListScaffold from "../components/ListScaffold";
import { Link } from "react-router-dom";

const ManagerActions = (m) => (
  <div className="btn-group shadow-sm rounded-pill overflow-hidden" role="group">
    <Link
      to={`/admin/managers/${m.user_id}`}
      className="btn btn-sm btn-white border border-end-0 px-3"
      title="View Details"
    >
      <i className="bi bi-eye text-primary"></i>
    </Link>
    <Link
      to={`/admin/managers/edit/${m.user_id}`}
      className="btn btn-sm btn-white border border-end-0 px-3"
      title="Edit Manager"
    >
      <i className="bi bi-pencil text-secondary"></i>
    </Link>
    <button
      className="btn btn-sm btn-white border px-3"
      title="Delete Manager"
      onClick={async () => {
        if (!window.confirm("Delete this manager? This will remove the account.")) return;
        try {
          await apiRequest(`/managers/${m.user_id}`, { method: "DELETE" });
          globalThis.location.reload();
        } catch (err) {
          console.error(err);
          alert("Failed to delete manager");
        }
      }}
    >
      <i className="bi bi-trash text-danger"></i>
    </button>
  </div>
);

const ManagersList = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">

        {/* 1. Header Tile */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle me-4">
                  <i className="bi bi-person-gear text-success fs-2"></i>
                </div>
                <div>
                  <h1 className="display-6 fw-bold text-dark mb-1">Managers</h1>
                  <p className="text-muted mb-0">System administration and management staff</p>
                </div>
              </div>
              <Link to="/admin/managers/create" className="btn btn-success px-4 py-2 rounded-pill shadow-sm text-white">
                <i className="bi bi-plus-circle me-2"></i>
                Create Manager
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Main Content Card */}
        <div className="card border-0 shadow-sm bg-white overflow-hidden">
          <div className="card-body p-0">
            <ListScaffold
              title=""
              fetchFn={resourceService.listManagers}
              hideCreateButton={true}
              columns={[
                {
                  header: "Manager Name",
                  render: (m) => {
                    const name = `${m.first_name || ""} ${m.last_name || ""}`.trim();
                    return (
                      <div className="d-flex align-items-center py-2">
                        <div className="bg-light rounded-circle p-2 me-3 text-success shadow-sm border">
                          <i className="bi bi-person-badge-fill"></i>
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{name || "Unnamed Manager"}</div>
                          <div className="small text-muted">{m.email}</div>
                        </div>
                      </div>
                    );
                  },
                },
                {
                  header: "Account Details",
                  render: (m) => (
                    <div className="small">
                      <span className="badge bg-light text-dark border px-2 py-1 fw-normal">
                        User ID: {m.user_id}
                      </span>
                    </div>
                  )
                },
                {
                  header: "Contact",
                  render: (m) => (
                    <div className="small text-dark">
                      <i className="bi bi-telephone me-2 text-muted"></i>
                      {m.phone || "---"}
                    </div>
                  ),
                },
              ]}
              actions={ManagerActions}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManagersList;
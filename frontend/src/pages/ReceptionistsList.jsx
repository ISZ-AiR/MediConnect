import React from "react";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";
import ListScaffold from "../components/ListScaffold";
import { Link } from "react-router-dom";

const ReceptionistActions = (r) => (
  <div className="text-start">
    <button
      className="btn btn-sm btn-outline-danger rounded-pill px-3 shadow-sm"
      title="Delete Receptionist"
      onClick={async () => {
        if (!window.confirm("Are you sure you want to delete this receptionist?")) return;
        try {
          await apiRequest(`/receptionist/${r.receptionist_id}`, { method: "DELETE" });
          globalThis.location.reload();
        } catch (err) {
          console.error(err);
          alert("Failed to delete receptionist");
        }
      }}
    >
      <i className="bi bi-trash me-1"></i>
    </button>
  </div>
);

const ReceptionistsList = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">

        {/* Header Tile */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-4">
                  <i className="bi bi-person-workspace text-warning fs-2"></i>
                </div>
                <div>
                  <h1 className="display-6 fw-bold text-dark mb-1">Receptionists</h1>
                  <p className="text-muted mb-0">Front desk staff management</p>
                </div>
              </div>
              <Link to="/admin/register-staff" className="btn btn-warning px-4 py-2 rounded-pill shadow-sm text-dark fw-bold">
                <i className="bi bi-person-plus-fill me-2"></i>
                Create Receptionist
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="card border-0 shadow-sm bg-white overflow-hidden">
          <div className="card-body p-0">
            <ListScaffold
              title=""
              fetchFn={resourceService.listReceptionists}
              hideCreateButton={true}
              columns={[
                {
                  header: "Staff Member",
                  render: (r) => {
                    const name = `${r.first_name || ""} ${r.last_name || ""}`.trim();
                    return (
                      <div className="d-flex align-items-center py-2">
                        <div className="bg-light rounded-circle p-2 me-3 text-warning shadow-sm border">
                          <i className="bi bi-person-vcard"></i>
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{name || "Unnamed Staff"}</div>
                          <div className="small text-muted">{r.email}</div>
                        </div>
                      </div>
                    );
                  },
                },
                {
                  header: "System ID",
                  render: (r) => (
                    <span className="badge bg-light text-dark border px-3 py-2 fw-normal rounded-pill">
                      RID: {r.receptionist_id}
                    </span>
                  )
                },
                {
                  header: "Contact",
                  render: (r) => (
                    <div className="small text-dark">
                      <i className="bi bi-telephone me-2 text-muted"></i>
                      {r.phone || "---"}
                    </div>
                  ),
                },
              ]}
              actions={ReceptionistActions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistsList;
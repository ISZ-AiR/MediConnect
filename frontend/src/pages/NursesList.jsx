import React from "react";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";
import ListScaffold from "../components/ListScaffold";
import { Link } from "react-router-dom";

const NurseActions = (n) => (
  <div className="btn-group shadow-sm rounded-pill overflow-hidden" role="group">
    <button
      className="btn btn-sm btn-white border px-3"
      title="Delete Nurse"
      onClick={async () => {
        if (!window.confirm("Are you sure you want to delete this nurse?")) return;
        try {
          await apiRequest(`/nurse/${n.nurse_id}`, { method: "DELETE" });
          globalThis.location.reload();
        } catch (err) {
          console.error(err);
          alert("Failed to delete nurse");
        }
      }}
    >
      <i className="bi bi-trash text-danger"></i>
    </button>
  </div>
);

const NursesList = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">

        {/* 1. Header Tile */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center">
                <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-4">
                  <i className="bi bi-heart-pulse-fill text-danger fs-2"></i>
                </div>
                <div>
                  <h1 className="display-6 fw-bold text-dark mb-1">Nurses Registry</h1>
                  <p className="text-muted mb-0">Management of nursing staff accounts</p>
                </div>
              </div>
              <Link to="/admin/register-staff" className="btn btn-danger px-4 py-2 rounded-pill shadow-sm">
                <i className="bi bi-person-plus-fill me-2"></i>
                Register Nurse
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Main Content Card */}
        <div className="card border-0 shadow-sm bg-white overflow-hidden">
          <div className="card-body p-0">
            <ListScaffold
              title=""
              fetchFn={resourceService.listNurses}
              hideCreateButton={true}
              columns={[
                {
                  header: "Nurse Details",
                  render: (n) => {
                    const name = `${n.first_name || ""} ${n.last_name || ""}`.trim();

                    return (
                      <div className="d-flex align-items-center py-2">
                        <div className="bg-light rounded-circle p-2 me-3 text-danger shadow-sm border">
                          <i className="bi bi-person-heart"></i>
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{name || "Name not found"}</div>
                          <div className="small text-muted">{n.email || "No email provided"}</div>
                        </div>
                      </div>
                    );
                  },
                },
                {
                  header: "System ID",
                  render: (n) => (
                    <span className="badge bg-light text-dark border px-3 py-2 fw-normal rounded-pill">
                      ID: {n.nurse_id}
                    </span>
                  )
                },
                {
                  header: "Contact",
                  render: (n) => (
                    <div className="small text-dark">
                      <i className="bi bi-telephone me-2 text-muted"></i>
                      {n.phone || "---"}
                    </div>
                  ),
                },
              ]}
              actions={NurseActions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NursesList;
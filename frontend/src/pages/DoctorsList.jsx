import React from "react";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";
import ListScaffold from "../components/ListScaffold";
import { Link } from "react-router-dom";

const DoctorActions = (d) => (
  <div className="btn-group shadow-sm rounded-pill overflow-hidden" role="group">
    <Link
      to={`/admin/doctors/${d.doctor_id}`}
      className="btn btn-sm btn-white border border-end-0 px-3"
      title="View Details"
    >
      <i className="bi bi-eye text-primary"></i>
    </Link>
    <Link
      to={`/admin/doctors/edit/${d.doctor_id}`}
      className="btn btn-sm btn-white border border-end-0 px-3"
      title="Edit Doctor"
    >
      <i className="bi bi-pencil text-secondary"></i>
    </Link>
    <button
      className="btn btn-sm btn-white border px-3"
      title="Delete Doctor"
      onClick={async () => {
        if (
          !window.confirm(
            "Delete this doctor? This will remove the doctor record and related data."
          )
        )
          return;
        try {
          await apiRequest(`/doctor/${d.doctor_id}`, {
            method: "DELETE",
          });
          globalThis.location.reload();
        } catch (err) {
          console.error(err);
          alert("Failed to delete doctor");
        }
      }}
    >
      <i className="bi bi-trash text-danger"></i>
    </button>
  </div>
);

const DoctorsList = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">

        {/* 1. Header Tile */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-4">
                  <i className="bi bi-person-vcard-fill text-primary fs-2"></i>
                </div>
                <div>
                  <h1 className="display-6 fw-bold text-dark mb-1">Doctors Database</h1>
                  <p className="text-muted mb-0">Manage medical staff, specializations and licenses</p>
                </div>
              </div>
              <Link to="/admin/doctors/create" className="btn btn-primary px-4 py-2 rounded-pill shadow-sm">
                <i className="bi bi-plus-circle me-2"></i>
                Create Doctor
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Main Content Card (Wraps ListScaffold) */}
        <div className="card border-0 shadow-sm bg-white overflow-hidden">
          <div className="card-body p-0"> {/* P-0 because ListScaffold usually has its own table padding */}
            <ListScaffold
              title="" // Empty title because we have the Header Tile above
              fetchFn={resourceService.listDoctors}
              hideCreateButton={true} // We have the button in the Header Tile
              columns={[
                {
                  header: "Doctor Details",
                  render: (d) => {
                    const first = d.user?.first_name || d.first_name || "";
                    const last = d.user?.last_name || d.last_name || "";
                    const name = `${first} ${last}`.trim() || "(no name)";
                    return (
                      <div className="d-flex align-items-center py-2">
                        <div className="bg-light rounded-circle p-2 me-3 text-primary shadow-sm border">
                          <i className="bi bi-person-badge"></i>
                        </div>
                        <div className="fw-bold text-dark">{name}</div>
                      </div>
                    );
                  },
                },
                {
                  header: "License Number",
                  render: (d) => (
                    <span className="badge bg-light text-dark border px-3 py-2 fw-normal">
                      <i className="bi bi-card-text me-2 text-muted"></i>
                      {d.user?.license_number || d.license_number || "N/A"}
                    </span>
                  ),
                },
                {
                  header: "Specialization",
                  render: (d) => (
                    <span className="badge bg-info-subtle text-info px-3 py-2 rounded-pill">
                      {d.specialization}
                    </span>
                  )
                },
              ]}
              actions={DoctorActions}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorsList;
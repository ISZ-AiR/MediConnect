import React from "react";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";
import ListScaffold from "../components/ListScaffold";
import { Link } from "react-router-dom";

// Inline actions renderer kept small; extracted if grows.
const DoctorActions = (d) => (
  <>
    <Link
      to={`/admin/doctors/${d.doctor_id}`}
      className="btn btn-sm btn-outline-primary me-2"
    >
      View
    </Link>
    <Link
      to={`/admin/doctors/edit/${d.doctor_id}`}
      className="btn btn-sm btn-outline-secondary me-2"
    >
      Edit
    </Link>
    <button
      className="btn btn-sm btn-outline-danger"
      onClick={async () => {
        if (
          !confirm(
            "Delete this doctor? This will remove the user account as well."
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
      Delete
    </button>
  </>
);

const DoctorsList = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <ListScaffold
        title="Doctors"
        fetchFn={resourceService.listDoctors}
        createLabel="Create Doctor"
        createPath="/admin/doctors/create"
        columns={[
          {
            header: "Name",
            render: (d) => {
              const first = d.user?.first_name || d.first_name || "";
              const last = d.user?.last_name || d.last_name || "";
              const name = `${first} ${last}`.trim();
              return name || "(no name)";
            },
          },
          {
            header: "License Number",
            render: (d) => d.user?.license_number || d.license_number || "",
          },
          { header: "Specialization", render: (d) => d.specialization },
        ]}
        actions={DoctorActions}
      />
    </div>
  );
};

export default DoctorsList;

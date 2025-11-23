import React from "react";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import ListScaffold from "../components/ListScaffold";

const ReceptionistsList = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <ListScaffold
        title="Receptionists"
        fetchFn={resourceService.listReceptionists}
        createLabel="Create Receptionist"
        createPath="/admin/register-staff"
        columns={[
          {
            header: "Name",
            render: (r) => {
              const fn = r.user?.first_name || r.first_name || "";
              const ln = r.user?.last_name || r.last_name || "";
              const name = `${fn} ${ln}`.trim();
              return name || "(no name)";
            },
          },
          {
            header: "Email",
            render: (r) => r.user?.email || r.email || "",
          },
          {
            header: "Phone",
            render: (r) => r.user?.phone || r.phone || "",
          },
        ]}
      />
    </div>
  );
};

export default ReceptionistsList;

import React from "react";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import ListScaffold from "../components/ListScaffold";

const NursesList = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <ListScaffold
        title="Nurses"
        fetchFn={resourceService.listNurses}
        createLabel="Create Nurse"
        createPath="/admin/register-staff"
        columns={[
          {
            header: "Name",
            render: (n) => {
              const fn = n.user?.first_name || n.first_name || "";
              const ln = n.user?.last_name || n.last_name || "";
              const name = `${fn} ${ln}`.trim();
              return name || "(no name)";
            },
          },
          {
            header: "Email",
            render: (n) => n.user?.email || n.email || "",
          },
          {
            header: "Phone",
            render: (n) => n.user?.phone || n.phone || "",
          },
        ]}
      />
    </div>
  );
};

export default NursesList;

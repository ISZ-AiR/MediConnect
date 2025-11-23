import React from "react";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import ListScaffold from "../components/ListScaffold";

const AdminsList = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <ListScaffold
        title="Administrators"
        fetchFn={resourceService.listAdmins}
        createLabel="Create Admin"
        createPath="/admin/register-staff"
        columns={[
          {
            header: "Name",
            render: (a) => {
              const fn = a.first_name || "";
              const ln = a.last_name || "";
              const name = `${fn} ${ln}`.trim();
              return name || "(no name)";
            },
          },
          { header: "Email", render: (a) => a.email || "" },
          { header: "Phone", render: (a) => a.phone || "" },
        ]}
      />
    </div>
  );
};

export default AdminsList;

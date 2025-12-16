import React from "react";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import ListScaffold from "../components/ListScaffold";
import { useAuth } from "../context/AuthContext";

const ExaminationsList = () => {
  const { user: authUser } = useAuth();
  const rolePrefix = authUser?.role ? `/${authUser.role}` : "";
  const createPathVar = `${rolePrefix}/examinations/create`;

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <ListScaffold
        title="Examinations"
        fetchFn={resourceService.listExaminations}
        createLabel="Create Examination"
        createPath={createPathVar}
        columns={[
          { header: "ID", render: (e) => e.examination_id || "" },
          { header: "Name", render: (e) => e.name },
          { header: "Type", render: (e) => e.type },
        ]}
      />
    </div>
  );
};

export default ExaminationsList;

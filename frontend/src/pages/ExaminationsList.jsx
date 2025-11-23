import React from "react";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import ListScaffold from "../components/ListScaffold";

const ExaminationsList = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <ListScaffold
        title="Examinations"
        fetchFn={resourceService.listExaminations}
        createLabel="Create Examination"
        createPath="/admin/examinations/create"
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

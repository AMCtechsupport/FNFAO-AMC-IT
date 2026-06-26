"use client";

import { useState } from "react";
import AssignAdvocate from "./assign-advocate-client";
import AssignClientSelector from "./assigned-client-selector";

export default function AdminAssignWorkspace({ clientsData, advocatesData }) {
  const [assignmentRefreshKey, setAssignmentRefreshKey] = useState(0);

  const handleAssignmentChange = () => {
    setAssignmentRefreshKey((key) => key + 1);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <AssignAdvocate
        clients={clientsData}
        advocates={advocatesData}
        onAssignmentChange={handleAssignmentChange}
      />
      <AssignClientSelector
        advocates={advocatesData}
        refreshKey={assignmentRefreshKey}
      />
    </div>
  );
}

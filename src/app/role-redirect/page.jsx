// src/app/admin/page.jsx
import { fetchClientsAndAdvocates } from "../lib/assign-advocate";
import AssignAdvocate from "../../../components/assign-advocate-client";
import AssignClientSelector from "../../../components/assigned-client-selector";
import UserHome from "../user-home/page";

export default async function AssignPage() {
  // RBAC is enforced by middleware now

  const { clientsData, advocatesData } = await fetchClientsAndAdvocates();

  return (
    <UserHome>
      <div className="assign-page-wrapper flex space-x-8">
        <div className="flex-1 p-4 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            Assign Client to Advocate
          </h2>
          <AssignAdvocate clients={clientsData} advocates={advocatesData} />
        </div>

        <div className="flex-1 p-4 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            Select Advocate and View Clients
          </h2>
          <AssignClientSelector advocates={advocatesData} />
        </div>
      </div>
    </UserHome>
  );
}

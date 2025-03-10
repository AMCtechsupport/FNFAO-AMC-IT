import { fetchClientsAndAdvocates } from "../lib/assign-advocate";
import AssignAdvocate from "../../../components/assign-advocate-client";
import AssignClientSelector from "../../../components/assigned-client-selector";

export default async function AssignPage() {
  // Fetch clients and advocates from the external function
  const { clientsData, advocatesData } = await fetchClientsAndAdvocates();

  return (
    <div className="assign-page-wrapper flex space-x-8">
      {/* Left side: AssignAdvocate component */}
      <div className="flex-1 p-4 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Assign Advocate to Client
        </h2>
        {/* Pass clients and advocates data as props to the AssignAdvocate component */}
        <AssignAdvocate clients={clientsData} advocates={advocatesData} />
      </div>

      {/* Right side: AssignClientSelector component */}
      <div className="flex-1 p-4 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Select Advocate and View Clients
        </h2>
        {/* Render the AssignClientSelector to allow user to select an advocate and see assigned clients */}
        <AssignClientSelector advocates={advocatesData} />
      </div>
    </div>
  );
}

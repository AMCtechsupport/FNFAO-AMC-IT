import { fetchClientsAndAdvocates } from "../lib/assign-advocate";
import AssignAdvocate from "../../../components/assign-advocate-client";
import AssignClientSelector from "../../../components/assigned-client-selector";
import UserHome from "../user-home/page";

export const dynamic = "force-dynamic";

export default async function AssignPage() {
  const { clientsData, advocatesData } = await fetchClientsAndAdvocates();

  return (
    <UserHome>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
            <p className="text-sm text-gray-500 mt-1">
              Assign advocates to clients and manage assignments
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AssignAdvocate clients={clientsData} advocates={advocatesData} />
          <AssignClientSelector advocates={advocatesData} />
        </div>
      </main>
    </UserHome>
  );
}

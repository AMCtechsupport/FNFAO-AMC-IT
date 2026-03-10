import { fetchClientsAndAdvocates } from "../lib/assign-advocate";
import AssignAdvocate from "../../../components/assign-advocate-client";
import AssignClientSelector from "../../../components/assigned-client-selector";
import UserHome from "../user-home/page";

import { createClerkSupabaseClientSsr } from "../ssr/clerk-user";
import { auth } from "@clerk/nextjs/server";

export default async function AssignPage() {
  // Retrieve the Clerk authentication token and the user's info
  const { userId } = await auth();
  const supabase = await createClerkSupabaseClientSsr();

  // Fetch clients and advocates from the external function
  const { clientsData, advocatesData } = await fetchClientsAndAdvocates();

  return (
    <UserHome>
      <main className="min-h-screen bg-gray-100 p-6">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
            <p className="text-sm text-gray-500 mt-1">Assign advocates to clients and manage assignments</p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AssignAdvocate clients={clientsData} advocates={advocatesData} />
          <AssignClientSelector advocates={advocatesData} />
        </div>

      </main>
    </UserHome>
  );
}

import { getAdvocateProfile } from "../lib/get-advocate-server";
import UserHome from "../user-home/page";
import AssignedClientsList from "../../../components/user-assigned-clients";
import { redirect } from "next/navigation";

export default async function AssignedClientsToAdvocate() {
  let advocate = null;
  let advocateError = null;

  try {
    advocate = await getAdvocateProfile();
  } catch (err) {
    console.error("Error fetching advocate:", err.message);
    advocateError = err.message || "Could not load advocate profile";
  }

  return (
    <UserHome>
      {/* Match User Logs / Client List page spacing */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {advocate
              ? `Clients assigned to ${advocate.firstName} ${advocate.lastName || ""}`
              : "Clients assigned"}
          </h2>

          {advocateError && (
            <p className="text-red-500 mb-4">{advocateError}</p>
          )}

          {advocate ? (
            <AssignedClientsList advocateId={advocate.advocate_id} />
          ) : null}
        </div>
      </div>
    </UserHome>
  );
}

import { getAdvocateProfile } from "../lib/get-advocate-server";
import UserHome from "../user-home/page";
import AssignedClientsList from "../../../components/user-assigned-clients";

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
      <main className="min-h-screen bg-gray-100 p-6">
        {advocateError && (
          <p className="text-red-500 mb-4">{advocateError}</p>
        )}
        {advocate ? (
          <AssignedClientsList advocateId={advocate.advocate_id} />
        ) : null}
      </main>
    </UserHome>
  );
}

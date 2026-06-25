import { getAdvocateProfile } from "../lib/get-advocate-server";
import UserHome from "../user-home/page";
import AssignedClientsList from "../../../components/user-assigned-clients";
import ChangePassword from "../../../components/change-password";

export const dynamic = "force-dynamic";

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
        <div className="mb-6 max-w-lg">
          <ChangePassword />
        </div>
        {advocate ? (
          <AssignedClientsList advocateId={advocate.advocate_id} />
        ) : null}
      </main>
    </UserHome>
  );
}

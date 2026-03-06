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
      <div className="max-w-6xl mx-auto px-6 py-8">
        {advocateError && (
          <p className="text-red-500 mb-4">{advocateError}</p>
        )}
        {advocate ? (
          <AssignedClientsList advocateId={advocate.advocate_id} />
        ) : null}
      </div>
    </UserHome>
  );
}

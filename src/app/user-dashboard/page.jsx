"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import UserHome from "../user-home/page";
import AssignedClientsList from "../../../components/user-assigned-clients";
import supabase from "../lib/supabase";

export default function AssignedClientsToAdvocate() {
  const { user } = useUser();
  const [advocate, setAdvocate] = useState(null);
  const [loadingAdvocate, setLoadingAdvocate] = useState(true);
  const [advocateError, setAdvocateError] = useState(null);

  useEffect(() => {
    const fetchAdvocate = async () => {
      if (!user) return;
      setLoadingAdvocate(true);
      setAdvocateError(null);

      try {
        // Preferred: match Clerk user -> Advocates record
        let result = await supabase
          .from("Advocates")
          .select("advocate_id, firstName, lastName, email, clerk_user_id")
          .eq("clerk_user_id", user.id)
          .single();

        // Fallback: match by email if clerk_user_id not linked yet
        if (result.error) {
          const email =
            user?.primaryEmailAddress?.emailAddress ||
            user?.emailAddresses?.[0]?.emailAddress;

          if (email) {
            result = await supabase
              .from("Advocates")
              .select("advocate_id, firstName, lastName, email, clerk_user_id")
              .eq("email", email.toLowerCase())
              .single();
          }
        }

        if (result.error) throw new Error(result.error.message);

        setAdvocate(result.data);
      } catch (err) {
        console.error("Error fetching advocate:", err.message);
        setAdvocate(null);
        setAdvocateError(
          "Could not find an Advocate record for this user. Please ask an admin to link your account."
        );
      } finally {
        setLoadingAdvocate(false);
      }
    };

    fetchAdvocate();
  }, [user]);

  return (
    <UserHome>
      <div className="assigned-clients-container">
        <h2 className="text-xl font-bold mb-4 p-2">
          {loadingAdvocate
            ? "Loading..."
            : advocate
            ? `Clients assigned to ${advocate.firstName} ${advocate.lastName || ""}`
            : "Clients assigned"}
        </h2>

        {advocateError && <p className="text-red-500 px-2 pb-2">{advocateError}</p>}

        {advocate ? <AssignedClientsList advocateId={advocate.advocate_id} /> : null}
      </div>
    </UserHome>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import UserHome from "../user-home/page";
import AssignedClientsList from "../../../components/user-assigned-clients";
import supabase from "../lib/supabase";

export default function AssignedClientsToAdvocate() {
  const { user } = useUser();
  const [advocate, setAdvocate] = useState(null);

  useEffect(() => {
    const fetchAdvocate = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("Advocates")
        .select("advocate_id, firstName, lastName")
        .eq("clerk_user_id", user.id);

      if (error) {
        console.error("Error fetching advocate:", error.message);
      } else {
        setAdvocate(data);
      }
    };

    fetchAdvocate();
  }, [user]);

  return (
    <UserHome>
      <div className="assigned-clients-container">
        <h2 className="text-xl font-bold mb-4 p-2">
          {advocate
            ? `Clients assigned to ${advocate.firstName} ${
                advocate.lastName || ""
              }`
            : "Loading..."}
        </h2>

        {advocate ? (
          <AssignedClientsList advocateId={advocate.advocate_id} />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </UserHome>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import UserHome from "../user-home/page";
import AssignedClientsList from "../../../components/user-assigned-clients";
import supabase from "../lib/supabase";

export default function AssignedClientsToAdvocate() {
  const { user } = useUser();
  const [advocate, setAdvocate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsLinking, setNeedsLinking] = useState(false);

  useEffect(() => {
    const fetchAdvocate = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        // First, try to find advocate by clerk_user_id
        const { data, error } = await supabase
          .from("Advocates")
          .select("advocate_id, firstName, lastName, email")
          .eq("clerk_user_id", user.id)
          .single();

        if (error) {
          // If no advocate found with clerk_user_id, try to find by email
          if (error.code === 'PGRST116') { // No rows returned
            const { data: emailData, error: emailError } = await supabase
              .from("Advocates")
              .select("advocate_id, firstName, lastName, email")
              .eq("email", user.emailAddresses[0]?.emailAddress)
              .single();

            if (emailError) {
              if (emailError.code === 'PGRST116') {
                // No advocate found with this email either
                setError("No advocate account found. Please contact an administrator to create your advocate account.");
                setNeedsLinking(true);
              } else {
                setError("Error fetching advocate: " + emailError.message);
              }
            } else {
              // Found advocate by email, but needs linking
              setAdvocate(emailData);
              setNeedsLinking(true);
            }
          } else {
            setError("Error fetching advocate: " + error.message);
          }
        } else {
          // Found advocate with clerk_user_id
          setAdvocate(data);
          setNeedsLinking(false);
        }
      } catch (err) {
        setError("Error fetching advocate: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvocate();
  }, [user]);

  const handleLinkAccount = async () => {
    if (!user || !advocate) return;

    try {
      const { error } = await supabase
        .from("Advocates")
        .update({ clerk_user_id: user.id })
        .eq("advocate_id", advocate.advocate_id);

      if (error) {
        setError("Error linking account: " + error.message);
      } else {
        setNeedsLinking(false);
        setAdvocate({ ...advocate, clerk_user_id: user.id });
      }
    } catch (err) {
      setError("Error linking account: " + err.message);
    }
  };

  if (loading) {
    return (
      <UserHome>
        <div className="assigned-clients-container">
          <p>Loading...</p>
        </div>
      </UserHome>
    );
  }

  if (error) {
    return (
      <UserHome>
        <div className="assigned-clients-container">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Account Setup Required</h3>
            <p className="text-red-700 mb-4">{error}</p>
            {needsLinking && advocate && (
              <button
                onClick={handleLinkAccount}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Link My Account
              </button>
            )}
          </div>
        </div>
      </UserHome>
    );
  }

  return (
    <UserHome>
      <div className="assigned-clients-container">
        {needsLinking && advocate && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Account Linking Required</h3>
            <p className="text-yellow-700 mb-4">
              We found an advocate account for {advocate.firstName} {advocate.lastName} ({advocate.email}), 
              but it needs to be linked to your current login. Click the button below to link your account.
            </p>
            <button
              onClick={handleLinkAccount}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Link My Account
            </button>
          </div>
        )}

        <h2 className="text-xl font-bold mb-4 p-2">
          {advocate
            ? `Clients assigned to ${advocate.firstName} ${
                advocate.lastName || ""
              }`
            : "Loading..."}
        </h2>

        {advocate && !needsLinking ? (
          <AssignedClientsList advocateId={advocate.advocate_id} />
        ) : (
          <p>Please link your account to view assigned clients.</p>
        )}
      </div>
    </UserHome>
  );
}

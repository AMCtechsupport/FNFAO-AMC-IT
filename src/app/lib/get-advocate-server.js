"use server";

import { currentUser } from "@clerk/nextjs/server";
import supabase from "./supabase";

export const getAdvocateProfile = async () => {
  // Get current user from Clerk
  const user = await currentUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    // Try to find advocate by Clerk user ID first
    let result = await supabase
      .from("Advocates")
      .select("advocate_id, firstName, lastName, email, clerk_user_id")
      .eq("clerk_user_id", user.id)
      .single();

    // Fallback: match by email if clerk_user_id not linked yet
    if (result.error) {
      const email = user?.primaryEmailAddress?.emailAddress;

      if (email) {
        result = await supabase
          .from("Advocates")
          .select("advocate_id, firstName, lastName, email, clerk_user_id")
          .eq("email", email.toLowerCase())
          .single();

        // Auto-link: persist the Clerk user ID so future logins use the fast path
        if (!result.error && result.data && !result.data.clerk_user_id) {
          await supabase
            .from("Advocates")
            .update({ clerk_user_id: user.id })
            .eq("advocate_id", result.data.advocate_id);

          result.data.clerk_user_id = user.id;
        }
      }
    }

    if (result.error) {
      if (result.error.code === "PGRST116") {
        throw new Error(
          "Could not find an Advocate record for this user. Please ask an admin to link your account.",
        );
      }
      throw new Error(result.error.message);
    }

    return result.data;
  } catch (err) {
    console.error("Error fetching advocate profile:", err);
    throw err;
  }
};

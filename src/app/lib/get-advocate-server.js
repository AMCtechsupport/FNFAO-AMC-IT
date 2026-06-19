"use server";

import { getSessionUser } from "./auth-server";
import supabase from "./supabase.server";

export const getAdvocateProfile = async () => {
  const user = await getSessionUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const result = await supabase
      .from("Advocates")
      .select("advocate_id, firstName, lastName, email, role")
      .eq("advocate_id", user.advocateId)
      .single();

    if (result.error) {
      if (result.error.code === "PGRST116") {
        throw new Error(
          "Could not find an Advocate record for this user. Please ask an admin for assistance.",
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

"use server";

import supabase from "./supabase";

/**
 * Verifies if an advocate exists in the Advocates table
 * @param {string} userId - The Clerk user ID
 * @returns {Promise<{exists: boolean}>} Object with exists boolean
 */
export const verifyAdvocateExists = async (userId) => {
  if (!userId) {
    return { exists: false };
  }

  try {
    const { data: advocate, error } = await supabase
      .from("Advocates")
      .select("advocate_id")
      .eq("clerk_user_id", userId)
      .single();

    if (error) {
      // PGRST116 means no rows found, which is expected if user doesn't exist
      if (error.code === "PGRST116") {
        return { exists: false };
      }
      // Log other errors but don't throw - default to denying access for safety
      console.error("Error verifying advocate:", error);
      return { exists: false };
    }

    return { exists: !!advocate };
  } catch (err) {
    console.error("Error in verifyAdvocateExists:", err);
    // Default to denying access on any error
    return { exists: false };
  }
};

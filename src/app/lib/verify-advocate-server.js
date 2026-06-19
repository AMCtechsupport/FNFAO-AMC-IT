"use server";

import { getSessionUser } from "./auth-server";
import supabase from "./supabase.server";

export const verifyAdvocateExists = async (advocateId) => {
  if (!advocateId) {
    return { exists: false };
  }

  try {
    const { data: advocate, error } = await supabase
      .from("Advocates")
      .select("advocate_id")
      .eq("advocate_id", advocateId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { exists: false };
      }
      console.error("Error verifying advocate:", error);
      return { exists: false };
    }

    return { exists: !!advocate };
  } catch (err) {
    console.error("Error in verifyAdvocateExists:", err);
    return { exists: false };
  }
};

export const verifyCurrentAdvocateExists = async () => {
  const user = await getSessionUser();
  if (!user?.advocateId) return { exists: false };
  return verifyAdvocateExists(user.advocateId);
};

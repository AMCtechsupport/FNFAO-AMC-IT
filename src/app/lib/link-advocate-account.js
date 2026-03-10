"use server";

import { currentUser, createClerkClient } from "@clerk/nextjs/server";
import supabase from "./supabase";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const linkAdvocateAccount = async () => {
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");

  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!email) throw new Error("No email address found on this account");

  // Find advocate in Supabase by email
  const { data, error } = await supabase
    .from("Advocates")
    .select("advocate_id, clerk_user_id")
    .eq("email", email)
    .single();

  if (error || !data) {
    throw new Error(
      "No advocate account found for this email. Please ask an admin for Assistance in linking your account.",
    );
  }

  // Store clerk_user_id in Supabase if not already set
  if (!data.clerk_user_id) {
    await supabase
      .from("Advocates")
      .update({ clerk_user_id: user.id })
      .eq("advocate_id", data.advocate_id);
  }

  // Set role in Clerk metadata so middleware lets them through
  await clerkClient.users.updateUserMetadata(user.id, {
    publicMetadata: { role: "advocate" },
  });

  return { success: true };
};

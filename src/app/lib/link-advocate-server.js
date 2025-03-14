// src/app/lib/link-advocate-server.js
"use server";

import { currentUser } from "@clerk/nextjs/server"; // Import currentUser
import supabase from "./supabase";

export const linkAdvocate = async (firstName, lastName, email) => {
  // Retrieve the current user
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found or not authenticated");
  }

  try {
    const { data, error } = await supabase.from("Advocates").insert({
      firstName: firstName,
      lastName: lastName,
      email: email,
      clerk_user_id: user.id, // Use user.id for Clerk user ID
      profileImage: user.profile_image_url,
    });

    if (error) {
      console.error("Error inserting advocate:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error linking advocate:", err);
    throw err;
  }
};

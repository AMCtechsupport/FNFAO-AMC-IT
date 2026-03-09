"use server";

import supabase from "./supabase";

export const createAdvocate = async ({ firstName, lastName, email }) => {
  if (!firstName || !lastName || !email) {
    throw new Error("First name, last name, and email are required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if email already exists in Supabase
  const { data: existing, error: checkError } = await supabase
    .from("Advocates")
    .select("advocate_id")
    .eq("email", normalizedEmail)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    throw new Error("Error checking existing email: " + checkError.message);
  }

  if (existing) {
    throw new Error("An advocate with this email already exists");
  }

  const { data, error } = await supabase
    .from("Advocates")
    .insert({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      clerk_user_id: null,
    })
    .select()
    .single();

  if (error) {
    throw new Error("Error creating advocate: " + error.message);
  }

  return {
    success: true,
    message: `Advocate ${firstName} ${lastName} created successfully. Their Clerk account will be linked automatically when they sign in.`,
    advocate: data,
  };
};

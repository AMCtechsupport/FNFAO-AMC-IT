"use server";

import supabase from "./supabase.server";
import { emailEligibleForMicrosoftSso, isAzureSsoConfigured } from "./sso-config";

export const createAdvocate = async ({ firstName, lastName, email, role = "advocate" }) => {
  if (!firstName || !lastName || !email) {
    throw new Error("First name, last name, and email are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedRole = role === "admin" ? "admin" : "advocate";

  if (isAzureSsoConfigured() && !emailEligibleForMicrosoftSso(normalizedEmail)) {
    throw new Error(
      "Email address not recognized by AMC. Please check the email address and try again.",
    );
  }

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
      password_hash: null,
      role: normalizedRole,
    })
    .select()
    .single();

  if (error) {
    throw new Error("Error creating advocate: " + error.message);
  }

  return {
    success: true,
    message: `Advocate ${firstName} ${lastName} created successfully.`,
    advocate: data,
  };
};

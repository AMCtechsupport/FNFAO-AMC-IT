"use server";

import bcrypt from "bcryptjs";
import supabase from "./supabase.server";

export const createAdvocate = async ({ firstName, lastName, email, password, role = "advocate" }) => {
  if (!firstName || !lastName || !email || !password) {
    throw new Error("First name, last name, email, and password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedRole = role === "admin" ? "admin" : "advocate";

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

  const password_hash = await bcrypt.hash(password, 12);

  const { data, error } = await supabase
    .from("Advocates")
    .insert({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password_hash,
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

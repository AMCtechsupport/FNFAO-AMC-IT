"use server";

import { currentUser } from "@clerk/nextjs/server";
import supabase from "./supabase";

export const getAssignedClients = async (advocateId) => {
  // Verify user is authenticated
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  if (!advocateId) {
    throw new Error("No advocate linked to this account");
  }

  try {
    const { data, error } = await supabase
      .from("Assigned Advocates")
      .select(
        "assigned_advocate_id, dateAssigned, Clients(client_id, firstName, middleName, lastName)",
      )
      .eq("advocate_id", advocateId)
      .order("dateAssigned", { ascending: false });

    if (error) throw new Error(error.message);

    const filteredData = (data || []).filter((row) => row.Clients !== null);

    return {
      data: filteredData,
      error: null,
    };
  } catch (err) {
    console.error("Error fetching assigned clients:", err);
    throw err;
  }
};

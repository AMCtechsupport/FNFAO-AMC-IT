"use server";

import { requireUser } from "./auth-server";
import supabase from "./supabase.server";

export const getAssignedClients = async (advocateId) => {
  await requireUser();

  const advocateIdNum = Number(advocateId);
  if (!Number.isFinite(advocateIdNum) || advocateIdNum <= 0) {
    throw new Error("Invalid advocate id");
  }

  try {
    const { data, error } = await supabase
      .from("Assigned Advocates")
      .select(
        "assigned_advocate_id, dateAssigned, client_id, Clients(client_id, firstName, middleName, lastName, clientType, clientStatus)",
      )
      .eq("advocate_id", advocateIdNum)
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

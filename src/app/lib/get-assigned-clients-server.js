"use server";

import { currentUser } from "@clerk/nextjs/server";
import supabase from "./supabase";

export const getAssignedClients = async (
  advocateId,
  page = 1,
  clientsPerPage = 5,
  searchQuery = "",
) => {
  // Verify user is authenticated
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  if (!advocateId) {
    throw new Error("No advocate linked to this account");
  }

  try {
    const hasSearch = !!searchQuery?.trim();
    const numericClientId = hasSearch ? Number(searchQuery.trim()) : null;

    if (hasSearch && Number.isNaN(numericClientId)) {
      return {
        data: [],
        count: 0,
        error: "Please enter a valid numeric value for the Client ID.",
      };
    }

    // Build the query
    let query = supabase
      .from("Assigned Advocates")
      .select(
        "assigned_advocate_id, dateAssigned, Clients(client_id, firstName, middleName, lastName)",
        { count: "exact" },
      )
      .eq("advocate_id", advocateId)
      .order("dateAssigned", { ascending: false });

    // Apply search filter if provided
    if (hasSearch) {
      query = query.eq("Clients.client_id", numericClientId);
    }

    // Get total count
    const { count, error: countError } = await query;
    if (countError) throw new Error(countError.message);

    // Get paginated data
    let dataQuery = supabase
      .from("Assigned Advocates")
      .select(
        "assigned_advocate_id, dateAssigned, Clients(client_id, firstName, middleName, lastName)",
      )
      .eq("advocate_id", advocateId)
      .order("dateAssigned", { ascending: false });

    // Apply search filter if provided
    if (hasSearch) {
      dataQuery = dataQuery.eq("Clients.client_id", numericClientId);
    }

    const { data, error: dataError } = await dataQuery.range(
      (page - 1) * clientsPerPage,
      page * clientsPerPage - 1
    );

    if (dataError) throw new Error(dataError.message);

    const filteredData = (data || []).filter((row) => row.Clients !== null);

    return {
      data: filteredData,
      count: count || 0,
      error: null,
    };
  } catch (err) {
    console.error("Error fetching assigned clients:", err);
    throw err;
  }
};

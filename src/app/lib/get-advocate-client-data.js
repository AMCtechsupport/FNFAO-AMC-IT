"use server";

import supabase from "./supabase.server";

export async function getAdvocateClientData(advocateId) {
  try {
    // fetch advocate details
    const { data: advocateData, error: advocateError } = await supabase
      .from("Advocates")
      .select("firstName, lastName")
      .eq("advocate_id", advocateId)
      .single();

    if (advocateError) throw advocateError;

    const advocateName = `${advocateData.firstName} ${advocateData.lastName}`;

    // fetch client IDs assigned to this advocate
    const { data: assignedData, error: assignedError } = await supabase
      .from("Assigned Advocates")
      .select("client_id")
      .eq("advocate_id", advocateId);

    if (assignedError) throw assignedError;

    if (!assignedData || assignedData.length === 0) {
      return { advocateName, clients: [], error: null };
    }

    const clientIds = assignedData.map((item) => item.client_id);

    // fetch client details
    const { data: clientsData, error: clientsError } = await supabase
      .from("Clients")
      .select(
        `client_id,
         firstName,
         lastName,
         dateOfBirth,
         cfsAgency,
         firstNationMembership,
         clientStatus,
         createdAt`
      )
      .in("client_id", clientIds);

    if (clientsError) throw clientsError;

    // count children for each client
    const clientsWithChildCount = await Promise.all(
      (clientsData || []).map(async (client) => {
        const { count, error: childError } = await supabase
          .from("Childs")
          .select("*", { count: "exact", head: true })
          .eq("client_id", client.client_id);

        if (childError) throw childError;

        return {
          ...client,
          childCount: count || 0,
        };
      })
    );

    return { advocateName, clients: clientsWithChildCount, error: null };
  } catch (err) {
    console.error("Error fetching advocate client data:", err);
    return {
      advocateName: "",
      clients: [],
      error: err instanceof Error ? err.message : "Failed to load advocate data",
    };
  }
}

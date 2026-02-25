"use server";

import supabase from "./supabase";

export async function getAdvocatesWithClientCounts(
  active: boolean,
  inactive: boolean,
  startDate: string,
  endDate: string
) {
  try {
    // Fetch all advocates
    const { data: advocatesData, error: advocatesError } = await supabase
      .from("Advocates")
      .select("advocate_id, firstName, lastName");

    if (advocatesError) throw advocatesError;

    // Fetch all assignments
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from("Assigned Advocates")
      .select("advocate_id, client_id");

    if (assignmentsError) throw assignmentsError;

    // Determine status filter
    let statusFilters: string[] = [];
    if (active) statusFilters.push("Active");
    if (inactive) statusFilters.push("Inactive");

    // Fetch clients based on status and date range
    let clientsQuery = supabase.from("Clients").select("client_id, clientStatus, createdAt");

    if (statusFilters.length > 0) {
      clientsQuery = clientsQuery.in("clientStatus", statusFilters);
    } else if (!active && !inactive) {
      // No status selected, return empty
      return { data: [], error: null };
    }

    if (startDate) {
      const startISO = new Date(startDate).toISOString();
      clientsQuery = clientsQuery.gte("createdAt", startISO);
    }

    if (endDate) {
      const endDate_obj = new Date(endDate);
      endDate_obj.setDate(endDate_obj.getDate() + 1);
      const endISO = endDate_obj.toISOString();
      clientsQuery = clientsQuery.lt("createdAt", endISO);
    }

    const { data: clientsData, error: clientsError } = await clientsQuery;

    if (clientsError) throw clientsError;

    // Create set of valid client IDs
    const activeClientIds = new Set((clientsData || []).map((client) => client.client_id));

    // Calculate three months ago
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Merge and calculate counts
    const mergedData = (advocatesData || []).map((advocate) => {
      const assignedClients = (assignmentsData || []).filter(
        (item) =>
          item.advocate_id === advocate.advocate_id &&
          activeClientIds.has(item.client_id)
      );

      const count = assignedClients.length;

      // Calculate new clients
      const newClientCount = assignedClients.filter((item) => {
        const cl = (clientsData || []).find(
          (c) => c.client_id === item.client_id
        );
        const createdAt = cl?.createdAt ? new Date(cl.createdAt) : null;
        if (!createdAt) return false;

        // If explicit date range provided, consider new if created within that range
        if (startDate || endDate) {
          const start = startDate ? new Date(startDate) : new Date(0);
          const end = endDate ? new Date(endDate) : new Date();
          return createdAt >= start && createdAt <= end;
        }

        // Otherwise fallback to 3 months rule
        return createdAt >= threeMonthsAgo;
      }).length;

      return {
        advocate_id: advocate.advocate_id,
        name: `${advocate.firstName} ${advocate.lastName}`,
        clientCount: count,
        newClientCount,
      };
    });

    return { data: mergedData, error: null };
  } catch (err) {
    console.error("Error fetching advocates with client counts:", err);
    return {
      data: [],
      error: err instanceof Error ? err.message : "Failed to load advocates",
    };
  }
}

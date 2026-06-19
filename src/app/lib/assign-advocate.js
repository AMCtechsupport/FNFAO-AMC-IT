// lib/assign-advocate.js
import supabase from "./supabase.server";

// Server function to fetch clients and advocates
export async function fetchClientsAndAdvocates() {
  try {
    const { data: clientsData, error: clientsError } = await supabase
      .from("Clients")
      .select("*");

    const { data: advocatesData, error: advocatesError } = await supabase
      .from("Advocates")
      .select("*");

    if (clientsError || advocatesError) {
      throw new Error(clientsError?.message || advocatesError?.message);
    }

    return { clientsData, advocatesData };
  } catch (err) {
    throw new Error("Error fetching data: " + err.message);
  }
}

export async function assignAdvocateToClient(client_id, advocate_id) {
  const { data, error } = await supabase.from("Assigned Advocates").insert([
    {
      client_id,
      advocate_id,
      dateAssigned: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error("Error assigning advocate:", error.message);
    return { error: error.message };
  }

  return data;
}

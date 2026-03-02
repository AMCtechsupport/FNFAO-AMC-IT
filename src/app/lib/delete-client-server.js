"use server";

import { currentUser } from "@clerk/nextjs/server";
import supabase from "./supabase";

export const deleteClient = async (clientId) => {
  // Retrieve the current user
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found or not authenticated");
  }

  // Note: You might want to add role-based authorization here
  // For example, check if the user has admin privileges

  try {
    // Delete related data first (foreign key constraints)

    // Delete Emergency Contacts
    await supabase
      .from("Emergency Contacts")
      .delete()
      .eq("client_id", clientId);

    // Delete Home Members
    await supabase.from("Home Members").delete().eq("client_id", clientId);

    // Delete Educational Support Persons (if exists for youth clients)
    await supabase
      .from("Educational Support Persons")
      .delete()
      .eq("client_id", clientId);

    // Delete Children (if exists for adult clients)
    await supabase.from("Childs").delete().eq("client_id", clientId);

    // Delete Notes
    await supabase.from("Notes").delete().eq("client_id", clientId);

    // Delete Important Family and Friends
    await supabase
      .from("Important Family and Friends")
      .delete()
      .eq("client_id", clientId);

    // Delete EIA Workers
    await supabase.from("EIA Workers").delete().eq("client_id", clientId);

    // Delete Assigned Advocates
    await supabase
      .from("Assigned Advocates")
      .delete()
      .eq("client_id", clientId);

    // Finally, delete the client
    const { data: clientData, error: selectError } = await supabase
      .from("Clients")
      .select("firstName, lastName")
      .eq("client_id", clientId)
      .single();

    if (selectError) {
      if (selectError.code === "PGRST116") {
        throw new Error("Client not found");
      }
      throw new Error("Error finding client: " + selectError.message);
    }

    const { error: clientError } = await supabase
      .from("Clients")
      .delete()
      .eq("client_id", clientId);

    if (clientError) {
      throw clientError;
    }

    return {
      success: true,
      message: `${clientData.firstName} ${clientData.lastName} has been successfully deleted.`,
    };
  } catch (err) {
    console.error("Error deleting client:", err);
    throw err;
  }
};

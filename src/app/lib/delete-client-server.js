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

    // Look up advocate_id and name for the current user
    const { data: advocateData } = await supabase
      .from("Advocates")
      .select("advocate_id, firstName, lastName")
      .eq("clerk_user_id", user.id)
      .single();
    const advocate_id = advocateData?.advocate_id || null;
    const advocateName = advocateData
      ? `${advocateData.firstName || ""} ${advocateData.lastName || ""}`.trim()
      : null;

    // Insert DELETE log before removing the client record
    // Embed advocate name so it survives advocate deletion
    const deleteDescription = `Client deleted: ${clientData.firstName} ${clientData.lastName}${advocateName ? `||by:${advocateName}` : ""}`;
    await supabase.from("User Logs").insert([{
      description: deleteDescription,
      logType: "DELETE",
      advocate_id,
      client_id: clientId,
    }]);

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

"use server";

import { requireUser } from "./auth-server";
import supabase from "./supabase.server";

export const deleteClient = async (clientId) => {
  const user = await requireUser();

  try {

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

    // Delete Files
    await supabase.from("Files").delete().eq("client_id", clientId);

    // Finally, delete the client
    const { data: clientData, error: selectError } = await supabase
      .from("Clients")
      .select("firstName, lastName, clientType")
      .eq("client_id", clientId)
      .single();

    if (selectError) {
      if (selectError.code === "PGRST116") {
        throw new Error("Client not found");
      }
      throw new Error("Error finding client: " + selectError.message);
    }

    const advocate_id = user.advocateId || null;
    const advocateName = user.name || null;

    // Insert DELETE log before removing the client record
    // Embed clientType and advocate name so they survive deletion
    const deleteDescription = `Client deleted: ${clientData.firstName} ${clientData.lastName}${clientData.clientType ? `||formType:${clientData.clientType}` : ""}${advocateName ? `||by:${advocateName}` : ""}`;
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

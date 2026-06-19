"use server";

import { requireAdmin, requireUser } from "./auth-server";
import supabase from "./supabase.server";

export const deleteAdvocate = async (advocateId) => {
  const user = await requireUser();

  if (String(user.advocateId) === String(advocateId)) {
    throw new Error("You cannot delete your own account.");
  }

  if (user.role === "admin") {
    const { data: targetAdvocate } = await supabase
      .from("Advocates")
      .select("role")
      .eq("advocate_id", advocateId)
      .single();

    if (targetAdvocate?.role === "admin") {
      throw new Error("You cannot delete an admin account.");
    }
  }

  try {
    const { data: advocate, error: selectError } = await supabase
      .from("Advocates")
      .select("advocate_id, firstName, lastName")
      .eq("advocate_id", advocateId)
      .single();

    if (selectError) {
      if (selectError.code === "PGRST116") {
        throw new Error("Advocate not found");
      }
      throw new Error("Error finding advocate: " + selectError.message);
    }

    const { data: assignedClients, error: checkError } = await supabase
      .from("Assigned Advocates")
      .select("client_id")
      .eq("advocate_id", advocateId);

    if (checkError) {
      throw new Error("Error checking assigned clients: " + checkError.message);
    }

    if (assignedClients && assignedClients.length > 0) {
      throw new Error(
        `Cannot delete advocate. They have ${assignedClients.length} assigned client(s). Please unassign all clients first.`,
      );
    }

    await supabase.from("Notes").update({ advocate_id: null }).eq("advocate_id", advocateId);
    await supabase
      .from("Notes")
      .update({ modified_by_advocate_id: null })
      .eq("modified_by_advocate_id", advocateId);

    await supabase.from("User Logs").update({ advocate_id: null }).eq("advocate_id", advocateId);

    const { error: deleteError } = await supabase
      .from("Advocates")
      .delete()
      .eq("advocate_id", advocateId);

    if (deleteError) {
      throw new Error("Error deleting advocate from database: " + deleteError.message);
    }

    return {
      success: true,
      message: `Advocate ${advocate.firstName} ${advocate.lastName} has been successfully deleted.`,
    };
  } catch (error) {
    console.error("Error in deleteAdvocate:", error);
    throw error;
  }
};

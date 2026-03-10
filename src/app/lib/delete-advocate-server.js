"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/nextjs/server";
import supabase from "./supabase";

// Create clerk client instance
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const deleteAdvocate = async (advocateId) => {
  // Retrieve the current user
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found or not authenticated");
  }

  // Note: You might want to add role-based authorization here
  // For example, check if the user has admin privileges
  // This would depend on how you've implemented role management in your app

  try {
    // First, check if the advocate exists and get their Clerk user ID
    const { data: advocate, error: selectError } = await supabase
      .from("Advocates")
      .select("advocate_id, firstName, lastName, clerk_user_id")
      .eq("advocate_id", advocateId)
      .single();

    if (selectError) {
      if (selectError.code === "PGRST116") {
        throw new Error("Advocate not found");
      }
      throw new Error("Error finding advocate: " + selectError.message);
    }

    // Check if advocate has any assigned clients
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

    // Delete from Clerk first (if they have a Clerk account)
    let deletedFromClerk = false;
    if (advocate.clerk_user_id) {
      try {
        await clerkClient.users.deleteUser(advocate.clerk_user_id);
        deletedFromClerk = true;
        console.log(`Deleted Clerk user: ${advocate.clerk_user_id}`);
      } catch (clerkError) {
        console.error("Error deleting from Clerk:", clerkError);
        // Don't throw error here - we'll still try to delete from database
        // But we'll mention it in the success message
      }
    }

    // Delete advocate's notes first to satisfy foreign key constraint
    const { error: notesDeleteError } = await supabase
      .from("Notes")
      .delete()
      .eq("advocate_id", advocateId);

    if (notesDeleteError) {
      throw new Error(
        "Error deleting advocate's notes: " + notesDeleteError.message,
      );
    }

    // Delete from Supabase database
    const { error: deleteError } = await supabase
      .from("Advocates")
      .delete()
      .eq("advocate_id", advocateId);

    if (deleteError) {
      throw new Error(
        "Error deleting advocate from database: " + deleteError.message,
      );
    }

    // Build success message
    let successMessage = `Advocate ${advocate.firstName} ${advocate.lastName} has been successfully deleted from the database`;

    if (advocate.clerk_user_id) {
      if (deletedFromClerk) {
        successMessage += " and their user account has been removed";
      } else {
        successMessage +=
          " (Note: Could not remove user account - may need manual cleanup)";
      }
    }

    return {
      success: true,
      message: successMessage,
      deletedFromClerk: deletedFromClerk,
      hadClerkAccount: !!advocate.clerk_user_id,
    };
  } catch (err) {
    console.error("Error deleting advocate:", err);
    throw err;
  }
};

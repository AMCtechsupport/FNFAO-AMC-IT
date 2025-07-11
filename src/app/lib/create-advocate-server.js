"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/nextjs/server";
import supabase from "./supabase";

// Create clerk client instance
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const createAdvocate = async ({ firstName, lastName, email, createClerkAccount = false, sendInvitation = false }) => {
  // Retrieve the current user
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found or not authenticated");
  }

  // Note: You might want to add role-based authorization here
  // For example, check if the user has admin privileges
  // This would depend on how you've implemented role management in your app

  try {
    // Validate required fields
    if (!firstName || !lastName || !email) {
      throw new Error("First name, last name, and email are required");
    }

    // We always send invitations - this allows users to create their own secure accounts

    // Check if email already exists in database
    const { data: existingAdvocate, error: checkError } = await supabase
      .from("Advocates")
      .select("advocate_id")
      .eq("email", email.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is what we want
      throw new Error("Error checking existing email: " + checkError.message);
    }

    if (existingAdvocate) {
      throw new Error("An advocate with this email already exists");
    }



    // Send invitation instead of creating user directly
    // This allows user to create their own account with their chosen password
    let invitationId = null;
    let invitationUrl = null;
    
    try {
      // Check if user already exists in Clerk
      console.log("Checking for existing users with email:", email.toLowerCase().trim());
      const existingUsers = await clerkClient.users.getUserList({ 
        emailAddress: [email.toLowerCase().trim()] 
      });
      console.log("Found existing users:", existingUsers.data.length);
      
      if (existingUsers.data.length > 0) {
        throw new Error("A user with this email already exists in Clerk");
      }
      
      // Check if there's already a pending invitation
      console.log("Checking for existing invitations...");
      const existingInvitations = await clerkClient.invitations.getInvitationList();
      console.log("Total invitations found:", existingInvitations.data.length);
      
      // Filter invitations for this specific email
      const emailInvitations = existingInvitations.data.filter(
        inv => inv.emailAddress && inv.emailAddress.toLowerCase() === email.toLowerCase().trim()
      );
      console.log(`Invitations for ${email}:`, emailInvitations.length);
      
      if (emailInvitations.length > 0) {
        console.log(`Found ${emailInvitations.length} existing invitations for this email. Canceling them...`);
        for (const invitation of emailInvitations) {
          try {
            await clerkClient.invitations.revokeInvitation({ invitationId: invitation.id });
            console.log(`Canceled invitation ${invitation.id} for ${invitation.emailAddress}`);
          } catch (revokeError) {
            console.log(`Failed to cancel invitation ${invitation.id} (might already be expired/used):`, revokeError.message);
            // Continue anyway - the invitation might be expired or already used
          }
        }
      }

      // Send invitation - user will create their own account
      const invitation = await clerkClient.invitations.createInvitation({
        emailAddress: email.toLowerCase().trim(),
        publicMetadata: {
          role: "advocate",
          createdBy: user.id,
          firstName: firstName.trim(),
          lastName: lastName.trim()
        }
      });

      invitationId = invitation.id;
      invitationUrl = invitation.url;
      console.log("Invitation sent successfully with ID:", invitationId);
      console.log("Invitation URL:", invitationUrl);
      console.log("Environment:", process.env.NODE_ENV);
      console.log("Clerk environment:", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "Set" : "Not set");

    } catch (clerkError) {
      console.error("Error with Clerk invitation:", clerkError);
      throw new Error("Error sending invitation: " + clerkError.message);
    }

    // Create the advocate in database (without clerk_user_id for now)
    const { data, error } = await supabase
      .from("Advocates")
      .insert({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        clerk_user_id: null, // Will be updated when user accepts invitation
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating advocate:", error);
      throw new Error("Error creating advocate: " + error.message);
    }

    const successMessage = `Advocate ${firstName} ${lastName} has been successfully created and invitation sent. They will receive an email to set up their account.`;

    return {
      success: true,
      message: successMessage,
      advocate: data,
      invitationId: invitationId,
      invitationUrl: invitationUrl // Include invitation URL for development
    };

  } catch (err) {
    console.error("Error creating advocate:", err);
    throw err;
  }
}; 
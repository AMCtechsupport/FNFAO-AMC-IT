import { NextResponse } from "next/server";
import { createClerkClient, currentUser } from "@clerk/nextjs/server";
import supabase from "../../lib/supabase";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function requireAdmin() {
  const user = await currentUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const role = user.publicMetadata?.role;
  if (role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true };
}

export async function PATCH(req) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { userId, firstName, lastName } = body;

    if (!userId || !firstName || !lastName) {
      return NextResponse.json(
        { error: "userId, firstName, and lastName are required" },
        { status: 400 },
      );
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      return NextResponse.json(
        { error: "firstName and lastName cannot be empty" },
        { status: 400 },
      );
    }

    // Update Supabase Advocates table
    const { error: supabaseError } = await supabase
      .from("Advocates")
      .update({ firstName: trimmedFirstName, lastName: trimmedLastName })
      .eq("clerk_user_id", userId);

    if (supabaseError) {
      throw new Error(
        `Failed to update Supabase: ${supabaseError.message || "Unknown error"}`,
      );
    }

    // Update Clerk user
    const existing = await clerkClient.users.getUser(userId);
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...(existing.publicMetadata || {}),
      },
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
    });

    const fullName = `${trimmedFirstName} ${trimmedLastName}`;

    return NextResponse.json({
      success: true,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      fullName,
    });
  } catch (error) {
    console.error("Error updating user name:", error);
    return NextResponse.json(
      { error: "Failed to update user name" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/nextjs/server";
import supabase from "../../lib/supabase";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function GET(request) {
  const user = await currentUser();

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    // Start with base query
    let query = supabase.from("Advocates").select("*");

    // If search term provided, apply filters
    if (search && search.trim()) {
      const trimmedSearch = search.trim().toLowerCase();

      // Check if it's a numeric ID
      const isNumeric = /^\d+$/.test(trimmedSearch);

      if (isNumeric) {
        // If numeric, search by both ID and name containing the number
        query = query.or(
          `advocate_id.eq.${parseInt(trimmedSearch, 10)},` +
            `firstName.ilike.%${trimmedSearch}%,` +
            `lastName.ilike.%${trimmedSearch}%,` +
            `email.ilike.%${trimmedSearch}%`,
        );
      } else {
        // If text, search by name or email
        query = query.or(
          `firstName.ilike.%${trimmedSearch}%,` +
            `lastName.ilike.%${trimmedSearch}%,` +
            `email.ilike.%${trimmedSearch}%`,
        );
      }
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error("[/api/advocates] Error fetching advocates:", error);
      return NextResponse.json(
        {
          error: "Error fetching advocates",
          details: error.message,
          code: error.code,
        },
        { status: 500 },
      );
    }

    // Get current user role from Clerk if authenticated
    let currentUserRole = null;
    let currentUserId = null;
    if (user?.id) {
      try {
        const clerkUser = await clerkClient.users.getUser(user.id);
        currentUserRole = clerkUser?.publicMetadata?.role || null;
        currentUserId = user.id;
      } catch (err) {
        console.error("Error fetching current user role:", err);
      }
    }

    return NextResponse.json({
      advocates: data || [],
      count: data?.length || 0,
      currentUserId: currentUserId,
      currentUserRole: currentUserRole,
    });
  } catch (err) {
    console.error("[/api/advocates] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 },
    );
  }
}

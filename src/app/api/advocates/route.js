import { NextResponse } from "next/server";
import supabase from "../../lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    console.log("[/api/advocates] Request params:", { search });
    console.log(
      "[/api/advocates] Using service role key:",
      process.env.SUPABASE_SERVICE_ROLE_KEY ? "YES" : "NO (using anon key)",
    );

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
          `email.ilike.%${trimmedSearch}%`
        );
      } else {
        // If text, search by name or email
        query = query.or(
          `firstName.ilike.%${trimmedSearch}%,` +
          `lastName.ilike.%${trimmedSearch}%,` +
          `email.ilike.%${trimmedSearch}%`
        );
      }
    }

    // Execute query
    const { data, error } = await query;

    console.log("[/api/advocates] Result:", {
      dataLength: data?.length,
      error,
    });

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

    console.log("[/api/advocates] Success:", { dataLength: data?.length });

    return NextResponse.json({
      advocates: data || [],
      count: data?.length || 0,
    });
  } catch (err) {
    console.error("[/api/advocates] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 },
    );
  }
}

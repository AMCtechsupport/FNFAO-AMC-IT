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

    let query = supabase.from("Advocates").select("*");

    // Filter by search term (name or email)
    if (search) {
      query = query.or(
        `firstName.ilike.%${search}%,lastName.ilike.%${search}%,email.ilike.%${search}%,advocate_id.ilike.%${search}%`,
      );
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

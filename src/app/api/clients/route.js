import { NextResponse } from "next/server";
import supabase from "../../lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientType = searchParams.get("clientType");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const search = searchParams.get("search") || "";
    const dateOfBirth = searchParams.get("dateOfBirth") || "";
    const countOnly = searchParams.get("count") === "true";

    console.log("[/api/clients] Request params:", {
      clientType,
      page,
      pageSize,
      search,
      dateOfBirth,
      countOnly,
    });
    console.log(
      "[/api/clients] Using service role key:",
      process.env.SUPABASE_SERVICE_ROLE_KEY ? "YES" : "NO (using anon key)",
    );

    if (!clientType) {
      return NextResponse.json(
        { error: "clientType parameter is required" },
        { status: 400 },
      );
    }

    let query = supabase.from("Clients").select("*", { count: "exact" });

    // Filter by client type
    query = query.eq("clientType", clientType);

    // Filter by search term (name or client_id)
    if (search) {
      query = query.or(
        `firstName.ilike.%${search}%,lastName.ilike.%${search}%,client_id.ilike.%${search}%`,
      );
    }

    // Filter by date of birth
    if (dateOfBirth) {
      query = query.eq("dateOfBirth", dateOfBirth);
    }

    // Get total count
    const { count, error: countError } = await query;

    console.log("[/api/clients] Count result:", { count, countError });

    if (countError) {
      console.error("[/api/clients] Error getting count:", countError);
      return NextResponse.json(
        {
          error: "Error fetching client count",
          details: countError.message,
          code: countError.code,
        },
        { status: 500 },
      );
    }

    // If only count is requested, return it
    if (countOnly) {
      console.log("[/api/clients] Returning count only:", count);
      return NextResponse.json({ count: count || 0 });
    }

    // Add pagination
    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);

    // Execute query
    const { data, error } = await query;

    console.log("[/api/clients] Data result:", {
      dataLength: data?.length,
      error,
    });

    if (error) {
      console.error("[/api/clients] Error fetching clients:", error);
      return NextResponse.json(
        {
          error: "Error fetching clients",
          details: error.message,
          code: error.code,
        },
        { status: 500 },
      );
    }

    console.log("[/api/clients] Success:", {
      dataLength: data?.length,
      count,
      page,
      pageSize,
    });

    return NextResponse.json({
      data: data || [],
      count: count || 0,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("[/api/clients] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 },
    );
  }
}

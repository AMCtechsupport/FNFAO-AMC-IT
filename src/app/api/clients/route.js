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

    // Helper function to build base query with filters
    const buildQuery = (baseQuery) => {
      let filtered = baseQuery.eq("clientType", clientType);

      // Apply search filter if provided (search by firstName, lastName, or client_id)
      if (search && search.trim()) {
        const searchTerm = search.trim();
        const numericId = !isNaN(searchTerm) && searchTerm !== "" ? parseInt(searchTerm, 10) : null;

        // Check if search contains spaces (multi-word search like "John Doe")
        const words = searchTerm.split(/\s+/).filter(w => w.length > 0);

        let orConditions;

        if (words.length > 1) {
          // Multi-word search: match first word in firstName AND last word in lastName
          const firstWord = words[0];
          const lastWord = words[words.length - 1];

          // Build OR conditions for multi-word search
          // Match specific pattern: first word in firstName, last word in lastName
          orConditions = `firstName.ilike.%${firstWord}%,lastName.ilike.%${lastWord}%`;

          // Also try reverse pattern in case names are reversed
          if (firstWord !== lastWord) {
            orConditions += `,firstName.ilike.%${lastWord}%,lastName.ilike.%${firstWord}%`;
          }
        } else {
          // Single word search: search in both firstName and lastName
          orConditions = `firstName.ilike.%${searchTerm}%,lastName.ilike.%${searchTerm}%`;
        }

        // Add numeric ID condition if search term is numeric
        if (numericId !== null) {
          orConditions = `client_id.eq.${numericId},` + orConditions;
        }

        // Apply all conditions in a single OR filter
        filtered = filtered.or(orConditions);
      }

      // Always filter by dateOfBirth if provided
      if (dateOfBirth) {
        filtered = filtered.eq("dateOfBirth", dateOfBirth);
      }

      return filtered;
    };

    // Get total count
    let countQuery = supabase
      .from("Clients")
      .select("*", { count: "exact", head: true });
    countQuery = buildQuery(countQuery);

    const { count, error: countError } = await countQuery;

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

    // Get paginated data
    let dataQuery = supabase.from("Clients").select("*");
    dataQuery = buildQuery(dataQuery);
    dataQuery = dataQuery
      .order("dateModified", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error } = await dataQuery;

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

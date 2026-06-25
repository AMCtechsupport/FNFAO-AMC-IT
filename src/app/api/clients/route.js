import { NextResponse } from "next/server";
import supabase from "../../lib/supabase.server";
import { requireApiUser } from "../../lib/api-auth";

// Builds PostgREST or() conditions that match any client_id whose decimal
// representation starts with `termStr`, e.g. "4" matches 4, 40-49, 400-499…
// Uses nested and(gte,lte) pairs so no type-cast syntax is needed.
function buildIdStartsWithConditions(termStr, maxDigits = 7) {
  const base = parseInt(termStr, 10);
  const k = termStr.length;
  const parts = [];
  for (let d = k; d <= maxDigits; d++) {
    const scale = Math.pow(10, d - k);
    const lower = base * scale;
    const upper = (base + 1) * scale - 1;
    parts.push(`and(client_id.gte.${lower},client_id.lte.${upper})`);
  }
  return parts.join(",");
}

export async function GET(request) {
  const authResult = await requireApiUser();
  if (!authResult.ok) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const clientType = searchParams.get("clientType");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const search = searchParams.get("search") || "";
    const dateOfBirth = searchParams.get("dateOfBirth") || "";
    const countOnly = searchParams.get("count") === "true";

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

        // Check if search contains spaces (multi-word search like "John Doe")
        const words = searchTerm.split(/\s+/).filter(w => w.length > 0);

        let orConditions;

        if (words.length > 1) {
          // Multi-word search: match first word in firstName AND last word in lastName
          const firstWord = words[0];
          const lastWord = words[words.length - 1];

          orConditions = `firstName.ilike.%${firstWord}%,lastName.ilike.%${lastWord}%`;

          if (firstWord !== lastWord) {
            orConditions += `,firstName.ilike.%${lastWord}%,lastName.ilike.%${firstWord}%`;
          }
        } else {
          // Single word: search by name (contains) OR ID (starts-with)
          const isNumeric = /^\d+$/.test(searchTerm);
          const nameConditions = `firstName.ilike.%${searchTerm}%,lastName.ilike.%${searchTerm}%`;
          if (isNumeric) {
            const idConditions = buildIdStartsWithConditions(searchTerm);
            orConditions = `${nameConditions},${idConditions}`;
          } else {
            orConditions = nameConditions;
          }
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
      return NextResponse.json({ count: count || 0 });
    }

    // Get paginated data
    let dataQuery = supabase.from("Clients").select("*");
    dataQuery = buildQuery(dataQuery);
    dataQuery = dataQuery
      .order("dateModified", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error } = await dataQuery;

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

export async function PATCH(request) {
  const authResult = await requireApiUser();
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const { client_id, clientValues } = body;

    if (!client_id) {
      return NextResponse.json({ error: "client_id is required" }, { status: 400 });
    }

    if (!clientValues || Object.keys(clientValues).length === 0) {
      return NextResponse.json({ error: "clientValues is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("Clients")
      .update(clientValues)
      .eq("client_id", client_id)
      .select();

    if (error) {
      console.error("[PATCH /api/clients] Error:", error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error("[PATCH /api/clients] Unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

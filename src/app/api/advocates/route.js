import { NextResponse } from "next/server";
import supabase from "../../lib/supabase.server";
import { requireApiUser } from "../../lib/api-auth";

export async function GET(request) {
  const authResult = await requireApiUser();
  if (!authResult.ok) return authResult.response;

  const session = authResult.session;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    let query = supabase.from("Advocates").select("*");

    if (search && search.trim()) {
      const trimmedSearch = search.trim().toLowerCase();
      const isNumeric = /^\d+$/.test(trimmedSearch);

      if (isNumeric) {
        query = query.or(
          `advocate_id.eq.${parseInt(trimmedSearch, 10)},` +
            `firstName.ilike.%${trimmedSearch}%,` +
            `lastName.ilike.%${trimmedSearch}%,` +
            `email.ilike.%${trimmedSearch}%`,
        );
      } else {
        query = query.or(
          `firstName.ilike.%${trimmedSearch}%,` +
            `lastName.ilike.%${trimmedSearch}%,` +
            `email.ilike.%${trimmedSearch}%`,
        );
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("[/api/advocates] Error fetching advocates:", error);
      return NextResponse.json(
        { error: "Error fetching advocates", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      advocates: data || [],
      count: data?.length || 0,
      currentUserId: session?.user?.advocateId ? String(session.user.advocateId) : null,
      currentUserRole: session?.user?.role || null,
    });
  } catch (err) {
    console.error("[/api/advocates] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 },
    );
  }
}

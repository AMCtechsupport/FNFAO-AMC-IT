import { NextResponse } from "next/server";
import supabase from "../../lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    // Fetch all advocates
    const { data: allAdvocates, error } = await supabase
      .from("Advocates")
      .select("advocate_id, firstName, lastName, email, createdAt, clerk_user_id");

    if (error) {
      console.error("[/api/pending-advocates] Supabase fetch error:", error);
      return NextResponse.json(
        {
          error: "Error fetching advocates",
          details: error.message,
        },
        { status: 500 },
      );
    }

    // Filter for pending advocates (clerk_user_id is null)
    let pendingAdvocates = (allAdvocates || []).filter(
      (advocate) => advocate.clerk_user_id === null
    );

    // Sort by createdAt descending (newest first)
    pendingAdvocates = pendingAdvocates.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    // Apply search filtering if search term provided
    if (search && search.trim()) {
      const trimmedSearch = search.trim().toLowerCase();

      pendingAdvocates = pendingAdvocates.filter((advocate) => {
        const fullName = `${advocate.firstName} ${advocate.lastName}`.toLowerCase();
        const email = (advocate.email || "").toLowerCase();
        const idStr = String(advocate.advocate_id);

        return (
          fullName.includes(trimmedSearch) ||
          email.includes(trimmedSearch) ||
          idStr.includes(trimmedSearch)
        );
      });
    }

    // Remove clerk_user_id from response (not needed on frontend)
    const response = pendingAdvocates.map(({ clerk_user_id, ...rest }) => rest);

    return NextResponse.json({
      advocates: response,
      count: response.length,
    });
  } catch (err) {
    console.error("[/api/pending-advocates] Unexpected error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: err.message,
      },
      { status: 500 },
    );
  }
}

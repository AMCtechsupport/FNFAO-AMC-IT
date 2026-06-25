import { NextResponse } from "next/server";
import supabase from "../../lib/supabase.server";
import { requireApiAdmin } from "../../lib/api-auth";

export async function GET() {
  const authResult = await requireApiAdmin();
  if (!authResult.ok) return authResult.response;

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("Advocates")
      .select("advocate_id, firstName, lastName, email, role, createdAt")
      .eq("role", "advocate")
      .gte("createdAt", thirtyDaysAgo.toISOString())
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("[/api/pending-advocates] Error:", error);
      return NextResponse.json(
        { error: "Error fetching advocates", details: error.message },
        { status: 500 },
      );
    }

    const advocates = (data || []).map((row) => ({
      ...row,
      created_at: row.createdAt,
    }));

    return NextResponse.json({ advocates, count: advocates.length });
  } catch (err) {
    console.error("[/api/pending-advocates] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 },
    );
  }
}

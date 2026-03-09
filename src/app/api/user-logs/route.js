import { NextResponse } from "next/server";
import supabase from "../../lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    let query = supabase
      .from("User Logs")
      .select("*, Advocates!advocate_id(firstName, lastName)", { count: "exact" });

    if (search) {
      query = query.ilike("client_id", `%${search}%`);
    }

    query = query
      .order("createdAt", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("[/api/user-logs] Error fetching user logs:", error);
      return NextResponse.json(
        { error: "Error fetching user logs", details: error.message },
        { status: 500 }
      );
    }

    const logsData = data || [];
    const enrichedLogs = logsData.map((log) => ({
      ...log,
      advocateName: log.Advocates
        ? `${log.Advocates.firstName} ${log.Advocates.lastName}`
        : null,
    }));

    return NextResponse.json({
      logs: enrichedLogs,
      count: typeof count === "number" ? count : logsData.length,
    });
  } catch (err) {
    console.error("[/api/user-logs] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { description, logType, client_id, clerkUserId } = body;

    // Look up advocate_id server-side (bypasses RLS)
    let advocate_id = null;
    if (clerkUserId) {
      const { data: advocateData } = await supabase
        .from("Advocates")
        .select("advocate_id")
        .eq("clerk_user_id", clerkUserId)
        .single();
      advocate_id = advocateData?.advocate_id || null;
    }

    const { error } = await supabase.from("User Logs").insert([
      { description, logType, advocate_id, client_id },
    ]);

    if (error) {
      console.error("[/api/user-logs POST] Error inserting log:", error);
      return NextResponse.json(
        { error: "Error inserting log", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/user-logs POST] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}

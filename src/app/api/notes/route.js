import { NextResponse } from "next/server";
import supabase from "../../lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const client_id = searchParams.get("client_id");

    if (!client_id) {
      return NextResponse.json({ error: "client_id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("Notes")
      .select("*, Advocates!advocate_id(firstName, lastName)")
      .eq("client_id", client_id)
      .order("note_id", { ascending: true });

    if (error) {
      console.error("[/api/notes] Error fetching notes:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const notes = (data || []).map((note) => ({
      ...note,
      authorName: note.Advocates
        ? `${note.Advocates.firstName} ${note.Advocates.lastName}`
        : null,
    }));

    return NextResponse.json({ notes });
  } catch (err) {
    console.error("[/api/notes] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}

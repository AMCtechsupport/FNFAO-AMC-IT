import { NextResponse } from "next/server";
import supabase from "../../../lib/supabase.server";
import { requireApiUser } from "../../../lib/api-auth";

export async function GET(request) {
  const authResult = await requireApiUser();
  if (!authResult.ok) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const file_path = searchParams.get("file_path");
    const file_name = searchParams.get("file_name");

    if (!file_path) {
      return NextResponse.json({ error: "file_path is required" }, { status: 400 });
    }

    const { data, error } = await supabase.storage
      .from("attachments")
      .createSignedUrl(file_path, 3600, { download: file_name || true }); // 1-hour expiry

    if (error) {
      console.error("[/api/notes/download] Error creating signed URL:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (err) {
    console.error("[/api/notes/download] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}

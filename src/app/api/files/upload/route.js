import { NextResponse } from "next/server";
import { requireApiUser } from "@/app/lib/api-auth";
import { storage } from "@/app/lib/storage";

export async function POST(request) {
  const authResult = await requireApiUser();
  if (!authResult.ok) return authResult.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const storagePath = formData.get("storage_path");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    if (!storagePath || typeof storagePath !== "string") {
      return NextResponse.json({ error: "storage_path is required" }, { status: 400 });
    }

    const normalizedPath = storagePath.replace(/\\/g, "/").replace(/^\/+/, "");
    if (!normalizedPath || normalizedPath.includes("..")) {
      return NextResponse.json({ error: "Invalid storage_path" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { data, error } = await storage.from("attachments").upload(normalizedPath, buffer, {
      contentType: file.type || "application/octet-stream",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, path: data?.path || normalizedPath });
  } catch (err) {
    console.error("[/api/files/upload] Error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 },
    );
  }
}

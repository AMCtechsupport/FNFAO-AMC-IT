import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAttachmentContentType, readAttachment } from "@/app/lib/storage";

export async function GET(request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("file_path");
  const fileName = searchParams.get("file_name");
  const inline = searchParams.get("inline") === "1";

  if (!filePath) {
    return NextResponse.json({ error: "file_path is required" }, { status: 400 });
  }

  try {
    const buffer = await readAttachment(filePath);
    const contentType = await getAttachmentContentType(filePath);
    const safeName = fileName || filePath.split("/").pop() || "download";
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set(
      "Content-Disposition",
      `${inline ? "inline" : "attachment"}; filename="${safeName}"`,
    );
    return new NextResponse(buffer, { headers });
  } catch (err) {
    console.error("[/api/files/download] Error:", err);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

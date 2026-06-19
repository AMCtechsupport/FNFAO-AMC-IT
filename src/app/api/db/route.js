import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { executeQuery } from "@/app/lib/query-execute";

export async function POST(request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const result = await executeQuery(payload);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/db] Error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteAdvocate } from "../../lib/delete-advocate-server";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { advocate_id } = await request.json();

    if (!advocate_id) {
      return NextResponse.json({ error: "Missing advocate_id" }, { status: 400 });
    }

    const result = await deleteAdvocate(advocate_id);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[/api/delete-advocate] Error:", error);
    return NextResponse.json(
      { error: error.message || "Error deleting advocate" },
      { status: 400 },
    );
  }
}

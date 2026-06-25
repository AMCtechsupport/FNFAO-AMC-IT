import { NextResponse } from "next/server";
import { deleteAdvocate } from "../../lib/delete-advocate-server";
import { requireApiAdmin } from "../../lib/api-auth";

export async function POST(request) {
  const authResult = await requireApiAdmin();
  if (!authResult.ok) return authResult.response;

  try {
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

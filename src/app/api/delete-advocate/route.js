import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteAdvocate } from "../../lib/delete-advocate-server";

export async function POST(request) {
  try {
    // Ensure user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { advocate_id } = await request.json();

    if (!advocate_id) {
      return NextResponse.json(
        { error: "Missing advocate_id" },
        { status: 400 },
      );
    }

    // Call the server function
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

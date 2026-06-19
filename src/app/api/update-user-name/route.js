import { NextResponse } from "next/server";
import supabase from "../../lib/supabase.server";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (session.user.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true };
}

export async function PATCH(req) {
  const authResult = await requireAdmin();
  if (!authResult.ok) return authResult.response;

  try {
    const body = await req.json();
    const { userId, firstName, lastName } = body;

    if (!userId || !firstName || !lastName) {
      return NextResponse.json(
        { error: "userId, firstName, and lastName are required" },
        { status: 400 },
      );
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      return NextResponse.json(
        { error: "firstName and lastName cannot be empty" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("Advocates")
      .update({ firstName: trimmedFirstName, lastName: trimmedLastName })
      .eq("advocate_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      fullName: `${trimmedFirstName} ${trimmedLastName}`,
    });
  } catch (error) {
    console.error("Error updating user name:", error);
    return NextResponse.json({ error: "Failed to update user name" }, { status: 500 });
  }
}

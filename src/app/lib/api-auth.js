import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireApiUser() {
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, session };
}

export async function requireApiAdmin() {
  const result = await requireApiUser();
  if (!result.ok) return result;
  if (result.session.user.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return result;
}

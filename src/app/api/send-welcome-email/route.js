import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendAdvocateWelcomeEmail } from "../../lib/email";

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

export async function POST(request) {
  const authResult = await requireAdmin();
  if (!authResult.ok) return authResult.response;

  try {
    const { firstName, lastName, email, temporaryPassword } = await request.json();

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "firstName, lastName, and email are required" },
        { status: 400 },
      );
    }

    const result = await sendAdvocateWelcomeEmail({
      firstName,
      lastName,
      email,
      temporaryPassword,
      isResend: false,
    });

    if (!result.sent) {
      return NextResponse.json(
        { error: result.error || "Failed to send welcome email" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Send welcome email error:", err);
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 },
    );
  }
}

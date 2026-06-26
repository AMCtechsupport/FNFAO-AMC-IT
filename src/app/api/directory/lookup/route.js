import { NextResponse } from "next/server";
import { requireApiAdmin } from "../../../lib/api-auth";
import { lookupDirectoryUserByEmail } from "../../../lib/azure-directory";
import { emailEligibleForMicrosoftSso } from "../../../lib/sso-config";

export async function GET(request) {
  const authResult = await requireApiAdmin();
  if (!authResult.ok) return authResult.response;

  const { searchParams } = new URL(request.url);
  const email = (searchParams.get("email") || "").trim();

  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  if (!emailEligibleForMicrosoftSso(email)) {
    return NextResponse.json(
      {
        found: false,
        error: "Email must be on the organization login domain for Microsoft sign-in.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await lookupDirectoryUserByEmail(email);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/directory/lookup] Unexpected error:", err);
    return NextResponse.json(
      { found: false, error: "Directory lookup failed." },
      { status: 500 },
    );
  }
}

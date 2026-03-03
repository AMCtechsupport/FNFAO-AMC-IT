import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

const CLERK_API_BASE = "https://api.clerk.com/v1";

function clerkHeaders() {
  return {
    Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

async function fetchAllInvitations() {
  const res = await fetch(
    `${CLERK_API_BASE}/invitations?limit=500`,
    { headers: clerkHeaders() },
  );
  const data = await res.json();
  return Array.isArray(data) ? data : (data?.data || []);
}

async function fetchPendingInvitations() {
  const all = await fetchAllInvitations();
  return all.filter((inv) => inv.status === "pending");
}

// GET /api/clerk-invitations — list all pending invitations
export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const invitations = await fetchPendingInvitations();
    return NextResponse.json({ invitations, count: invitations.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/clerk-invitations — revoke all non-revoked invitations (clears ghost invitations)
export async function DELETE() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const all = await fetchAllInvitations();
    const breakdown = {
      pending: all.filter((i) => i.status === "pending").length,
      accepted: all.filter((i) => i.status === "accepted").length,
      revoked: all.filter((i) => i.status === "revoked").length,
    };

    // Only attempt to revoke invitations that aren't already revoked
    const revokable = all.filter((inv) => inv.status !== "revoked");

    if (revokable.length === 0) {
      return NextResponse.json({ message: "No revokable invitations found.", revoked: 0, total: all.length, breakdown });
    }

    const results = [];
    for (const inv of revokable) {
      const res = await fetch(
        `${CLERK_API_BASE}/invitations/${inv.id}/revoke`,
        { method: "POST", headers: clerkHeaders() },
      );
      results.push({
        id: inv.id,
        email: inv.email_address,
        previousStatus: inv.status,
        success: res.ok,
        httpStatus: res.status,
      });
    }

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success);

    return NextResponse.json({
      message: `Revoked ${succeeded} of ${revokable.length} invitation(s). Total found: ${all.length}`,
      revoked: succeeded,
      total: all.length,
      breakdown,
      failed,
      results,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

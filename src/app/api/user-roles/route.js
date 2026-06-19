import { NextResponse } from "next/server";
import supabase from "../../lib/supabase.server";
import { auth } from "@/auth";

const ALLOWED_ROLES = new Set(["admin", "advocate"]);

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

  return { ok: true, session };
}

export async function GET() {
  const authResult = await requireAdmin();
  if (!authResult.ok) return authResult.response;

  try {
    const { data: advocates, error } = await supabase
      .from("Advocates")
      .select("advocate_id, firstName, lastName, email, role, createdAt")
      .order("firstName", { ascending: true });

    if (error) {
      throw new Error("Failed to read advocate profiles.");
    }

    const users = (advocates || []).map((advocate) => ({
      id: String(advocate.advocate_id),
      email: advocate.email,
      firstName: advocate.firstName,
      lastName: advocate.lastName,
      fullName: `${advocate.firstName || ""} ${advocate.lastName || ""}`.trim(),
      role: advocate.role === "admin" ? "admin" : "advocate",
      createdAt: advocate.createdAt,
    }));

    return NextResponse.json({
      users,
      currentUserId: String(authResult.session.user.advocateId),
      meta: {
        totalUsers: users.length,
      },
    });
  } catch (error) {
    console.error("Error fetching users for role management:", error);
    return NextResponse.json(
      { error: "Failed to fetch users for role management." },
      { status: 500 },
    );
  }
}

export async function PATCH(req) {
  const authResult = await requireAdmin();
  if (!authResult.ok) return authResult.response;

  const currentUserId = String(authResult.session.user.advocateId);

  try {
    const body = await req.json();
    const updates = Array.isArray(body?.updates) ? body.updates : [];

    if (updates.length === 0) {
      return NextResponse.json({ error: "No role updates provided." }, { status: 400 });
    }

    const results = [];

    for (const item of updates) {
      const userId = item?.userId;
      const role = typeof item?.role === "string" ? item.role.toLowerCase() : "";

      if (!userId || !ALLOWED_ROLES.has(role)) {
        return NextResponse.json({ error: "Invalid role update payload." }, { status: 400 });
      }

      if (userId === currentUserId) {
        return NextResponse.json(
          { error: "You cannot change your own role." },
          { status: 403 },
        );
      }

      const { error } = await supabase
        .from("Advocates")
        .update({ role })
        .eq("advocate_id", userId);

      if (error) {
        results.push({ userId, success: false, error: error.message });
      } else {
        results.push({ userId, success: true, role });
      }
    }

    const failed = results.filter((item) => !item.success);

    if (failed.length > 0) {
      return NextResponse.json(
        {
          message: `Updated ${results.length - failed.length} of ${results.length} user role(s).`,
          results,
        },
        { status: 207 },
      );
    }

    return NextResponse.json({
      message: `Updated ${results.length} user role(s).`,
      results,
    });
  } catch (error) {
    console.error("Error updating user roles:", error);
    return NextResponse.json({ error: "Failed to update user roles." }, { status: 500 });
  }
}

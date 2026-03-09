import { NextResponse } from "next/server";
import { createClerkClient, currentUser } from "@clerk/nextjs/server";
import supabase from "../../lib/supabase";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const ALLOWED_ROLES = new Set(["admin", "advocate"]);

async function requireAdmin() {
  const user = await currentUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const role = user.publicMetadata?.role;
  if (role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true };
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const { data: advocates, error: advocatesError } = await supabase
      .from("Advocates")
      .select("clerk_user_id, firstName, lastName, email");

    if (advocatesError) {
      throw new Error("Failed to read advocate profiles from Supabase.");
    }

    const advocatesByClerkId = new Map();
    const advocatesByEmail = new Map();

    for (const advocate of advocates || []) {
      const advocateClerkUserId = (advocate?.clerk_user_id || "").trim();
      const advocateEmail = (advocate?.email || "").toLowerCase().trim();

      if (advocateClerkUserId) {
        advocatesByClerkId.set(advocateClerkUserId, advocate);
      }

      if (advocateEmail) {
        advocatesByEmail.set(advocateEmail, advocate);
      }
    }

    const usersResponse = await clerkClient.users.getUserList({
      limit: 200,
    });

    const totalClerkUsers = usersResponse?.data?.length || 0;

    const users = (usersResponse?.data || [])
      .map((user) => {
      const clerkEmailRaw =
        user.primaryEmailAddress?.emailAddress ||
        user.emailAddresses?.[0]?.emailAddress ||
        "";
      const clerkEmail = clerkEmailRaw.toLowerCase().trim();

      const advocateByClerkId = advocatesByClerkId.get(user.id);
      const advocateByEmail = clerkEmail ? advocatesByEmail.get(clerkEmail) : null;

      const linkedAdvocate = advocateByClerkId || advocateByEmail;

      const email = linkedAdvocate?.email || "";
      const firstName = linkedAdvocate?.firstName || "";
      const lastName = linkedAdvocate?.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim() || "User";

      return {
        id: user.id,
        email,
        firstName,
        lastName,
        fullName,
        verifiedFromSupabase: !!linkedAdvocate,
        dataSource: linkedAdvocate
          ? advocateByClerkId
            ? "Supabase (clerk_user_id match)"
            : "Supabase (email match)"
          : "No Supabase match",
        role: user.publicMetadata?.role === "admin" ? "admin" : "advocate",
      };
    })
      .filter((user) => user.verifiedFromSupabase);

    return NextResponse.json({
      users,
      meta: {
        totalClerkUsers,
        includedSupabaseUsers: users.length,
        excludedWithoutSupabase: totalClerkUsers - users.length,
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
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const updates = Array.isArray(body?.updates) ? body.updates : [];

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No role updates provided." },
        { status: 400 },
      );
    }

    const normalizedUpdates = updates.map((item) => ({
      userId: item?.userId,
      role: typeof item?.role === "string" ? item.role.toLowerCase() : "",
    }));

    for (const item of normalizedUpdates) {
      if (!item.userId || !ALLOWED_ROLES.has(item.role)) {
        return NextResponse.json(
          { error: "Invalid role update payload." },
          { status: 400 },
        );
      }
    }

    const results = [];
    for (const item of normalizedUpdates) {
      try {
        const existing = await clerkClient.users.getUser(item.userId);
        await clerkClient.users.updateUserMetadata(item.userId, {
          publicMetadata: {
            ...(existing.publicMetadata || {}),
            role: item.role,
          },
        });

        results.push({ userId: item.userId, success: true, role: item.role });
      } catch (error) {
        console.error(`Failed to update role for user ${item.userId}:`, error);
        results.push({
          userId: item.userId,
          success: false,
          error: "Failed to update role.",
        });
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
    return NextResponse.json(
      { error: "Failed to update user roles." },
      { status: 500 },
    );
  }
}

import { clerkMiddleware, createRouteMatcher, createClerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

// Clerk client — reads publicMetadata directly, no JWT template required
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Supabase client for middleware
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Routes only admins can access
const isAdminOnlyRoute = createRouteMatcher([
  "/admin(.*)",
  "/user-logs(.*)",
  "/manage-dropdowns(.*)",
  "/export(.*)",
  "/report(.*)",
  "/profile(.*)",
]);

// Routes advocates are allowed to access
const isAdvocateAllowedRoute = createRouteMatcher([
  "/user-dashboard(.*)",
  "/pre-intake(.*)",
  "/youth-intake(.*)",
  "/youth-clients(.*)",
  "/adult-clients(.*)",
]);

// Routes both roles can access
const isSharedRoute = createRouteMatcher([
  "/clients(.*)",
]);

const isProtectedRoute = (req: NextRequest) =>
  isAdminOnlyRoute(req) || isAdvocateAllowedRoute(req) || isSharedRoute(req);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  // Require authentication for all protected routes
  await auth.protect();

  const { userId } = await auth();
  if (!userId) return;

  const user = await clerk.users.getUser(userId);
  const role = user.publicMetadata?.role as "admin" | "advocate" | undefined;

  if (isAdminOnlyRoute(req)) {
    // Admin-only routes: require "admin" role
    if (role !== "admin") {
      return Response.redirect(new URL("/unauthorized", req.url));
    }
  } else {
    // Advocate and shared routes: require "admin" or "advocate" role
    if (role !== "admin" && role !== "advocate") {
      // Check if this Clerk account's email matches an unlinked advocate row
      const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
      if (email) {
        const { data } = await supabase
          .from("Advocates")
          .select("advocate_id")
          .eq("email", email)
          .is("clerk_user_id", null)
          .single();

        if (data) {
          // Unlinked advocate found — redirect to /setup to link and assign role
          return Response.redirect(new URL("/setup", req.url));
        }
      }
      return Response.redirect(new URL("/unauthorized", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};

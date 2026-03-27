import { clerkMiddleware, createRouteMatcher, createClerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Clerk client
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

  const res = NextResponse.next();

  // Allow public routes
  if (!isProtectedRoute(req)) {
    return res;
  }

  // Require authentication
  await auth.protect();

  const { userId } = await auth();
  if (!userId) return res;

  const user = await clerk.users.getUser(userId);
  const role = user.publicMetadata?.role as "admin" | "advocate" | undefined;

  // Admin-only routes: require "admin" role
  if (isAdminOnlyRoute(req)) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  } else {
    // Advocate and shared routes: require "admin" or "advocate"
    if (role !== "admin" && role !== "advocate") {
      const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();

      if (email) {
        const { data } = await supabase
          .from("Advocates")
          .select("advocate_id")
          .eq("email", email)
          .is("clerk_user_id", null)
          .single();

        if (data) {
          return NextResponse.redirect(new URL("/setup", req.url));
        }
      }

      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return res;
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
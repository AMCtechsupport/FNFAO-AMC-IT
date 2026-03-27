import { clerkMiddleware, createRouteMatcher, createClerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Clerk client
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

<<<<<<< HEAD
// Supabase client
=======
// Supabase client for middleware
>>>>>>> 9c130fd011b1bb39cfbaf513b0bd58596a469ab9
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

<<<<<<< HEAD
// Route matchers
=======
// Routes only admins can access
>>>>>>> 9c130fd011b1bb39cfbaf513b0bd58596a469ab9
const isAdminOnlyRoute = createRouteMatcher([
  "/admin(.*)",
  "/user-logs(.*)",
  "/manage-dropdowns(.*)",
  "/export(.*)",
  "/report(.*)",
  "/profile(.*)",
]);

const isAdvocateAllowedRoute = createRouteMatcher([
  "/user-dashboard(.*)",
  "/pre-intake(.*)",
  "/youth-intake(.*)",
  "/youth-clients(.*)",
  "/adult-clients(.*)",
]);

const isSharedRoute = createRouteMatcher([
  "/clients(.*)",
]);

const isProtectedRoute = (req: NextRequest) =>
  isAdminOnlyRoute(req) || isAdvocateAllowedRoute(req) || isSharedRoute(req);

export default clerkMiddleware(async (auth, req) => {

<<<<<<< HEAD
  const res = NextResponse.next();

  // Allow public routes
  if (!isProtectedRoute(req)) {
    return res;
  }

  // Require authentication
  await auth.protect();

  const { userId } = await auth();
  if (!userId) return res;
=======
  // Require authentication for all protected routes
  await auth.protect();

  const { userId } = await auth();
  if (!userId) return;
>>>>>>> 9c130fd011b1bb39cfbaf513b0bd58596a469ab9

  const user = await clerk.users.getUser(userId);
  const role = user.publicMetadata?.role as "admin" | "advocate" | undefined;

<<<<<<< HEAD
  // Admin-only routes
  if (isAdminOnlyRoute(req)) {
=======
  if (isAdminOnlyRoute(req)) {
    // Admin-only routes: require "admin" role
>>>>>>> 9c130fd011b1bb39cfbaf513b0bd58596a469ab9
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  } else {
    // Advocate/shared routes
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

  return res;
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
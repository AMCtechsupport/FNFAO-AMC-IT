import {
  clerkMiddleware,
  createRouteMatcher,
  createClerkClient,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type UserRole = "admin" | "advocate" | undefined;

// Clerk client for reading publicMetadata directly (bypasses JWT claims)
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Supabase client for middleware
const supabaseMiddleware = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// All routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/role-redirect(.*)",
  "/setup(.*)",
  "/user-home(.*)",
  "/user-dashboard(.*)",
  "/clients(.*)",
  "/adult-clients(.*)",
  "/youth-clients(.*)",
  "/pre-intake(.*)",
  "/full-intake(.*)",
  "/youth-intake(.*)",
  "/data-collection(.*)",
  "/admin(.*)",
  "/user-logs(.*)",
  "/manage-dropdowns(.*)",
  "/export(.*)",
  "/report(.*)",
  "/profile(.*)",
]);

// Routes that only admins can access — advocates are blocked
const isAdminOnlyRoute = createRouteMatcher([
  "/user-logs(.*)",
  "/manage-dropdowns(.*)",
  "/export(.*)",
  "/report(.*)",
  "/admin(.*)",
  "/profile(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (isProtectedRoute(req)) {
    // Redirect unauthenticated users to sign-in
    await auth.protect();
  }

  if (!userId) {
    return NextResponse.next();
  }

  // Verify advocate exists in database for all protected routes
  // This ensures deleted advocates cannot access any protected pages
  if (isProtectedRoute(req)) {
    try {
      // Check if user exists in Advocates table
      const { data: advocate, error } = await supabaseMiddleware
        .from("Advocates")
        .select("advocate_id")
        .eq("clerk_user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Allow /setup through so linkAdvocateAccount() can run and store the clerk_user_id
          if (req.nextUrl.pathname.startsWith("/setup")) {
            return NextResponse.next();
          }
          return NextResponse.redirect(new URL("/setup", req.url));
        } else {
          // Other error - fail secure
          console.error(
            `[MIDDLEWARE] Error querying advocate: ${error.message}`,
          );
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }

      if (advocate) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } catch (err) {
      console.error(`[MIDDLEWARE] Exception in advocate check: ${err}`);
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Check role for all protected routes — must be "admin" or "advocate"
  if (isProtectedRoute(req)) {
    try {
      const user = await clerk.users.getUser(userId);
      const userRole = user.publicMetadata?.role as UserRole;

      if (userRole !== "admin" && userRole !== "advocate") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      if (isAdminOnlyRoute(req) && userRole !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } catch (err) {
      console.error(`[MIDDLEWARE] Error checking role: ${err}`);
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Protect all app routes
    "/(user-home|user-dashboard|clients|adult-clients|youth-clients|pre-intake|full-intake|youth-intake|data-collection|admin|user-logs|settings|export|report|profile|role-redirect|setup)(.*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

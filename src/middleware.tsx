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

  console.log(
    `[MIDDLEWARE] Processing request to ${req.nextUrl.pathname}, userId: ${userId}`,
  );

  if (isProtectedRoute(req)) {
    console.log(`[MIDDLEWARE] Route is protected, running auth.protect()`);
    // Redirect unauthenticated users to sign-in
    await auth.protect();
  }

  if (!userId) {
    console.log(`[MIDDLEWARE] No userId, allowing request`);
    return NextResponse.next();
  }

  // Verify advocate exists in database for all protected routes
  // This ensures deleted advocates cannot access any protected pages
  if (isProtectedRoute(req)) {
    console.log(
      `[MIDDLEWARE] Checking if advocate exists for userId: ${userId}`,
    );
    try {
      // Check if user exists in Advocates table
      const { data: advocate, error } = await supabaseMiddleware
        .from("Advocates")
        .select("advocate_id")
        .eq("clerk_user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Not found
          console.log(`[MIDDLEWARE] Advocate NOT FOUND for user ${userId}`);
          console.log(`[MIDDLEWARE] Redirecting to /unauthorized`);
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        } else {
          // Other error - fail secure
          console.error(
            `[MIDDLEWARE] Error querying advocate: ${error.message}`,
          );
          console.log(`[MIDDLEWARE] Redirecting to /unauthorized due to error`);
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }

      if (advocate) {
        console.log(
          `[MIDDLEWARE] Advocate FOUND for user ${userId}, allowing access`,
        );
      } else {
        console.log(
          `[MIDDLEWARE] Advocate is null for user ${userId}, redirecting`,
        );
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } catch (err) {
      console.error(`[MIDDLEWARE] Exception in advocate check: ${err}`);
      console.log(`[MIDDLEWARE] Redirecting to /unauthorized due to exception`);
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Check role for all protected routes — must be "admin" or "advocate"
  if (isProtectedRoute(req)) {
    console.log(`[MIDDLEWARE] Checking role for protected route`);
    try {
      const user = await clerk.users.getUser(userId);
      const userRole = user.publicMetadata?.role as UserRole;

      if (userRole !== "admin" && userRole !== "advocate") {
        console.log(
          `[MIDDLEWARE] User has invalid role (${userRole}), redirecting to /unauthorized`,
        );
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      if (isAdminOnlyRoute(req) && userRole !== "admin") {
        console.log(
          `[MIDDLEWARE] User is not admin, redirecting to /unauthorized`,
        );
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      console.log(`[MIDDLEWARE] User role ${userRole} is valid, allowing access`);
    } catch (err) {
      console.error(`[MIDDLEWARE] Error checking role: ${err}`);
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  console.log(`[MIDDLEWARE] All checks passed, allowing request to proceed`);
});

export const config = {
  matcher: [
    // Protect all app routes
    "/(user-home|user-dashboard|clients|adult-clients|youth-clients|pre-intake|full-intake|youth-intake|data-collection|admin|user-logs|settings|export|report|profile|role-redirect|setup)(.*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

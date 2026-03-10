// src/middleware.tsx
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

/**
 * RULES
 * - admin: can access ALL protected app routes
 * - advocate: can access only advocate/shared routes
 * - no role: redirect to /setup (auto-links their advocate account)
 *
 * NOTE: Uses role from sessionClaims.metadata.role (as per your token debug)
 */

// Admin-only routes (advocate must NOT access)
const isAdminOnlyRoute = createRouteMatcher([
  "/admin(.*)",
  // If you later add a dedicated /report route, add it here:
  // "/report(.*)",
]);

// Routes that advocates are allowed to access (admin also allowed)
const isAdvocateAllowedRoute = createRouteMatcher([
  "/user-dashboard(.*)",

  "/clients(.*)",
  "/youth-clients(.*)",

  "/pre-intake(.*)",
  "/full-intake(.*)",
  "/youth-intake(.*)",

  // If these exist in your repo, keep them:
  "/data-collection(.*)",
]);

// Shared routes both roles can access (if you have them)
const isSharedRoute = createRouteMatcher([
  "/profile(.*)",
  "/user-logs(.*)",
  "/settings(.*)",
  "/export(.*)",
]);

// Apply RBAC only to routes that need it
const isProtectedRoute = (req: NextRequest) =>
  isAdminOnlyRoute(req) || isAdvocateAllowedRoute(req) || isSharedRoute(req);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  // Must be signed in
  await auth.protect();

  const { sessionClaims } = await auth();

  // ✅ your role is here
  const role = (sessionClaims as any)?.metadata?.role as
    | "admin"
    | "advocate"
    | undefined;

  // Signed in but no role — redirect to /setup to auto-link their advocate account
  if (!role) {
    if (req.nextUrl.pathname === "/setup") return;
    return Response.redirect(new URL("/setup", req.url));
  }

  // ✅ ADMIN = ALLOW EVERYTHING
  if (role === "admin") return;

  // ✅ ADVOCATE RULES
  // Block admin-only
  if (role === "advocate" && isAdminOnlyRoute(req)) {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  // Advocate can only access advocate-allowed + shared
  if (role === "advocate") {
    const ok = isAdvocateAllowedRoute(req) || isSharedRoute(req);
    if (!ok) {
      return Response.redirect(new URL("/unauthorized", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};

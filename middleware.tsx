import { clerkMiddleware, createRouteMatcher, createClerkClient } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

// Clerk client — reads publicMetadata directly, no JWT template required
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Routes only admins can access
const isAdminOnlyRoute = createRouteMatcher([
  "/admin(.*)",
  "/user-logs(.*)",
  "/settings(.*)",
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

  // Require authentication
  await auth.protect();

  const { userId } = await auth();
  if (!userId) return;

  // Read role from publicMetadata directly — reliable without a custom JWT template
  const user = await clerk.users.getUser(userId);
  const role = user.publicMetadata?.role as "admin" | "advocate" | undefined;

  // No role set yet — send to setup to link their advocate account
  if (!role) {
    if (req.nextUrl.pathname === "/setup") return;
    return Response.redirect(new URL("/setup", req.url));
  }

  // Admins can access everything
  if (role === "admin") return;

  // Advocates are blocked from admin-only routes
  if (role === "advocate" && isAdminOnlyRoute(req)) {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  // Advocates can only access their allowed routes + shared routes
  if (role === "advocate") {
    const allowed = isAdvocateAllowedRoute(req) || isSharedRoute(req);
    if (!allowed) {
      return Response.redirect(new URL("/unauthorized", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};

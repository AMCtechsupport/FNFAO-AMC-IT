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

  // Require authentication for all protected routes — no external API call here
  await auth.protect();

  // Only call Clerk's API for admin-only routes.
  // Advocate and shared routes skip this call entirely, keeping those requests fast
  // and avoiding timeouts that would break page loads and form submissions.
  if (isAdminOnlyRoute(req)) {
    const { userId } = await auth();
    if (!userId) return;

    const user = await clerk.users.getUser(userId);
    const role = user.publicMetadata?.role as "admin" | "advocate" | undefined;

    if (role !== "admin") {
      return Response.redirect(new URL("/unauthorized", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};

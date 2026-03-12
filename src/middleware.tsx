import { clerkMiddleware, createRouteMatcher, createClerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


type UserRole = "admin" | "advocate" | undefined;

// Clerk client for reading publicMetadata directly (bypasses JWT claims)
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// All routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/user-home(.*)",
  "/clients(.*)",
  "/adult-clients(.*)",
  "/youth-clients(.*)",
  "/pre-intake(.*)",
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

  if (!userId) return NextResponse.next();

  // Only perform the role check for admin-only routes to keep other requests fast
  if (isAdminOnlyRoute(req)) {
    // Read publicMetadata directly from Clerk — reliable regardless of JWT template config
    const user = await clerk.users.getUser(userId);
    const userRole = user.publicMetadata?.role as UserRole;

    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

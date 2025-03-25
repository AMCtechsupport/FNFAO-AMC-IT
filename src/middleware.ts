import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define routes that are protected
const isProtectedRoute = createRouteMatcher([
  "/user-home(.*)",
  "/clients(.*)",
  "/pre-intake(.*)",
  "/manager-dash(.*)",
  "/admin(.*)",
  "/user-logs(.*)",
  "/youth-intake(.*)",
]);

// Define the route that needs admin role protection
const isAdminRoute = createRouteMatcher(["/manager-dash(.*)"]);

const isAdminOrYouthWorkerRoute = createRouteMatcher(["/youth-intake(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Protect all protected routes for logged-in users
    await auth.protect();

    const { sessionClaims } = await auth();

    const userRole = sessionClaims?.metadata?.role;

    // Check if the route requires admin role protection
    if (
      isAdminRoute(req) &&
      (await auth()).sessionClaims?.metadata?.role !== "admin"
    ) {
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }

    if (
      isAdminOrYouthWorkerRoute(req) &&
      userRole !== "admin" &&
      userRole !== "youth worker"
    ) {
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
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

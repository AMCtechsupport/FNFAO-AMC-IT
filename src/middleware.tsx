import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


type UserRole = "admin" | "advocate" | undefined;

// Define routes that are protected(authenticated via clerk)
const isProtectedRoute = createRouteMatcher([
  "/user-home(.*)",
  "/clients(.*)",
  "/adult-clients(.*)",
  "/youth-clients(.*)",
  "/pre-intake(.*)",
  "/admin(.*)",
  "/user-logs(.*)",
]);


export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Protect all protected routes for logged-in users
    await auth.protect();

    const { sessionClaims } = await auth();

    // const userRole = sessionClaims?.metadata?.role as UserRole;

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

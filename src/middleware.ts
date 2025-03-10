import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define routes that are protected
const isProtectedRoute = createRouteMatcher([
  "/user-home(.*)",
  "/clients(.*)",
  "/pre-intake(.*)",
]);

// Define the route that needs admin role protection
const isAdminRoute = createRouteMatcher(["/manager-dash(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const user = auth.user; // Access the user object directly

  // Log the user object to understand the structure
  console.log("User from Clerk Middleware:", user);

  // Check if the route is protected (for general login protection)
  if (isProtectedRoute(request)) {
    // Protect all protected routes for logged-in users
    await auth.protect();
  }

  // If the route is `/manager-dash`, check if the user has the Admin role in the organization
  if (isAdminRoute(request)) {
    if (user && user.organizations) {
      // Log the organizations to check if they are being fetched correctly
      console.log("User's organizations:", user.organizations);

      // Check if the user belongs to the organization and has the "org:admin" role
      const org = user.organizations.find(
        (org) => org.organization.id === "org_2sXcSIew4CAjg7y6HgFoArRYUEy"
      );

      // Log the organization found
      console.log("Found organization:", org);

      // Check if the organization exists and if the user has the "org:admin" role
      if (org && org.role === "org:admin") {
        // User is allowed to access the route (they are an admin in the correct organization)
        return;
      } else {
        // Log the reason for denying access
        console.log(
          "User does not have 'org:admin' role or is not part of the organization."
        );
        return new Response("Forbidden: You do not have the required role.", {
          status: 403,
        });
      }
    } else {
      // If the user is not part of any organization or doesn't have the "org:admin" role
      console.log("User is not part of the correct organization.");
      return new Response(
        "Forbidden: User is not part of the correct organization.",
        { status: 403 }
      );
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

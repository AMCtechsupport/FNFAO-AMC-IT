import { clerkMiddleware, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((req) => {
  const { userId, sessionClaims } = getAuth(req);

  // User not logged in
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const role = sessionClaims?.publicMetadata?.role;

  // Only admin and advocate allowed
  if (role !== "admin" && role !== "advocate") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!sign-in|sign-up|unauthorized).*)"],
};

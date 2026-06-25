import { auth } from "@/auth";
import { NextResponse } from "next/server";

const adminOnlyPrefixes = [
  "/admin",
  "/user-logs",
  "/manage-dropdowns",
  "/export",
  "/report",
  "/profile",
];

const protectedPrefixes = [
  "/user-dashboard",
  "/pre-intake",
  "/youth-intake",
  "/youth-clients",
  "/adult-clients",
  "/clients",
  "/full-intake",
  "/data-collection",
  "/map",
  "/user-home",
  ...adminOnlyPrefixes,
];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (pathname === "/login" || pathname === "/unauthorized") {
    if (session?.user && pathname === "/login") {
      const role = session.user.role;
      const dest = role === "admin" ? "/admin" : "/user-dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  if (!matchesPrefix(pathname, protectedPrefixes)) {
    return NextResponse.next();
  }

  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;
  if (role !== "admin" && role !== "advocate") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (matchesPrefix(pathname, adminOnlyPrefixes) && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};

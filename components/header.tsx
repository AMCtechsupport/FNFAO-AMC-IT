"use client";

import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import useSyncClerkWithSupabase from "../components/useSyncClerkWithSupabase";

export default function Header() {
  useSyncClerkWithSupabase();

  const {user, isLoaded} = useUser();

  // Determine route based on role
  let dashboardRoute = "/user-dashboard";
  const role = user?.publicMetadata?.role;

  if (role === "admin") {
    dashboardRoute = "/admin";
  } else if (role === "advocate") {
    dashboardRoute = "/user-dashboard";
  }


  return (
    <>
      {/* Header for unauthenticated users */}
      <SignedOut>
        <header className="bg-black text-white h-24 flex items-center">
          <div className="flex justify-between items-center w-full p-4">
            <div className="flex-1"></div> {/* Pushes content to the right */}
            <SignInButton>Sign In</SignInButton>
          </div>
        </header>
      </SignedOut>

      {/* Header for authenticated users */}
      <SignedIn>
        <header className="bg-black text-white h-24 flex items-center">
          <div className="flex justify-between items-center w-full p-4">
            {/* Logo */}
            <Link href={dashboardRoute}>
              <img src="/logo.png" alt="logo" className="h-12 w-auto" />
            </Link>

            {/* Navigation links and auth button */}
            <div className="flex items-center space-x-6">
              {/* Authenticated user button */}
              <UserButton />
            </div>

          </div>
        </header>

      </SignedIn>
    </>
  );
}

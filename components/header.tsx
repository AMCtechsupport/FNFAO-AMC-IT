"use client";

import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import useSyncClerkWithSupabase from "../components/useSyncClerkWithSupabase";

export default function Header() {
  useSyncClerkWithSupabase();

  return (
    <>
      {/* Header for unauthenticated users */}
      <SignedOut>
        <header className="bg-black text-white">
          <div className="flex justify-between p-4">
            <div className="flex-1"></div> {/* Pushes content to the right */}
            <SignInButton>Sign In</SignInButton>
          </div>
        </header>
      </SignedOut>

      {/* Header for authenticated users */}
      <SignedIn>
        <header className="bg-black text-white">
          <div className="flex justify-between items-center p-4">
            {/* Logo */}
            <Link href="/user-dashboard">
              <img src="/logo.png" alt="logo" />
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

"use client";

import Image from "next/image";
import Link from "next/link";
import {
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import useSyncClerkWithSupabase from "../components/useSyncClerkWithSupabase";

export default function Header() {
  useSyncClerkWithSupabase();

  const { user, isLoaded, isSignedIn } = useUser();

  // Determine route based on role
  let dashboardRoute = "/";
  const role = user?.publicMetadata?.role;

  if (isSignedIn) {
    if (role === "admin") {
      dashboardRoute = "/admin";
    } else if (role === "advocate") {
      dashboardRoute = "/user-dashboard";
    } else {
      dashboardRoute = "/user-dashboard";
    }
  }

  return (
    <header className="bg-black text-white h-24 flex items-center">
      <div className="flex justify-between items-center w-full p-4">
        <Link href={dashboardRoute}>
          <Image
            src="/logo.png"
            alt="FNFAO logo"
            width={177}
            height={48}
            priority
            className="h-12 w-auto"
          />
        </Link>

        <div className="flex items-center space-x-6">
          {isLoaded && isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <button
                type="button"
                className="rounded-md bg-[#7504ff] px-5 py-2 text-sm font-semibold text-white border border-[#6a04e6] hover:bg-[#6700ea] transition-colors"
              >
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import SignOutButton from "./sign-out-button";

export default function Header() {
  const { data: session, status } = useSession();
  const role = session?.user?.role;

  let dashboardRoute = "/";
  if (session?.user) {
    dashboardRoute = role === "admin" ? "/admin" : "/user-dashboard";
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
          {status === "authenticated" ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300 hidden sm:inline">
                {session.user?.name || session.user?.email}
              </span>
              <SignOutButton
                className="rounded-md bg-[#7504ff] px-4 py-2 text-sm font-semibold text-white border border-[#6a04e6] hover:bg-[#6700ea] transition-colors"
              />
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-[#7504ff] px-5 py-2 text-sm font-semibold text-white border border-[#6a04e6] hover:bg-[#6700ea] transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

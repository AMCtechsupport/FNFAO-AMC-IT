"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";

export default function UserHome({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  const { user } = useUser();
  const [userRole, setUserRole] = useState<string | undefined>(undefined);

  // Set isClient to true when the component is mounted on the client-side
  useEffect(() => {
    setIsClient(true);
    // Set the user role after the component is mounted
    if (user?.publicMetadata?.role) {
      setUserRole(user.publicMetadata.role as string);
    }
  }, [user]); // Only re-run when `user` changes

  // Only render content that requires the user data if we're on the client
  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#cccccc" }}>
      {/* Background color */}

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-black p-4 border-r">
          <nav className="space-y-4">
            {(userRole === "admin" ) && (
              <Link
                href="/admin"
                className="block no-underline bg-gray-800 text-white font-medium hover:bg-gray-700 hover:shadow-md transition p-3 rounded-md"
              >
                Admin
              </Link>
            )}

           {userRole === "advocate" && (
              <Link
                href="/user-dashboard"
                className="block no-underline bg-gray-800 text-white font-medium hover:bg-gray-700 hover:shadow-md transition p-3 rounded-md"
              >
                Dashboard
              </Link>
            )}

            {userRole != "advocate" && (
            <Link
              href="/profile"
              className="block no-underline bg-gray-800 text-white font-medium hover:bg-gray-700 hover:shadow-md transition p-3 rounded-md"
            >
              Profile
            </Link>
            )}

            <Link
              href="/pre-intake"
              className="block no-underline bg-gray-800 text-white font-medium hover:bg-gray-700 hover:shadow-md transition p-3 rounded-md"
            >
              Pre-Intake
            </Link>
            <Link
              href="/youth-intake"
              className="block no-underline bg-gray-800 text-white font-medium hover:bg-gray-700 hover:shadow-md transition p-3 rounded-md"
            >
              Youth-Intake
            </Link>

            {userRole != "advocate" && (
            <Link
              href="/full-intake"
              className="block no-underline bg-gray-800 text-white font-medium hover:bg-gray-700 hover:shadow-md transition p-3 rounded-md"
            >
              Full-Intake
            </Link>
            )}
            
            <Link
              href="/clients"
              className="block no-underline bg-gray-800 text-white font-medium hover:bg-gray-700 hover:shadow-md transition p-3 rounded-md"
            >
              Client List
            </Link>
            <Link
              href="/user-logs"
              className="block no-underline bg-gray-800 text-white font-medium hover:bg-gray-700 hover:shadow-md transition p-3 rounded-md"
            >
              User Logs
            </Link>

            <Link
              href="/settings"
              className="block no-underline bg-gray-800 text-white font-medium hover:bg-gray-700 hover:shadow-md transition p-3 rounded-md"
            >
              Settings
            </Link>

            <Link
              href="/export"
              className="block no-underline bg-gray-800 text-white font-medium hover:bg-gray-700 hover:shadow-md transition p-3 rounded-md"
            >
              Export
            </Link>
          </nav>
        </aside>

        {/* Main Section */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

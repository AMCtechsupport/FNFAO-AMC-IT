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
    if (user) {
      setUserRole(user.publicMetadata?.role);
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
            <a
              href="user-dashboard"
              className="block text-white hover:text-purple-600 hover:font-bold transition-colors p-2 rounded"
            >
              Dashboard
            </a>
            <a
              href="profile"
              className="block text-white hover:text-gray-300 p-2 rounded"
            >
              Profile
            </a>
            <a
              href="/settings"
              className="block text-white hover:text-gray-300 p-2 rounded"
            >
              Settings
            </a>
            <Link
              href="/full-intake"
              className="block text-white hover:font-bold no-underline transition-colors p-2 rounded"
            >
              Full-Intake
            </Link>
            <Link
              href="/pre-intake"
              className="block text-white hover:font-bold no-underline transition-colors p-2 rounded"
            >
              Pre-Intake
            </Link>
            <Link
              href="/youth-intake"
              className="block text-white hover:font-bold no-underline transition-colors p-2 rounded"
            >
              Youth-Intake
            </Link>
            <Link
              href="/clients"
              className="block text-white hover:font-bold no-underline transition-colors p-2 rounded"
            >
              Client List
            </Link>
            <Link
              href="/user-logs"
              className="block text-white hover:font-bold no-underline transition-colors p-2 rounded"
            >
              User Logs
            </Link>
            {(userRole === "operational manager" || userRole === "admin") && (
              <Link
                href="/manager-dash"
                className="block text-white hover:font-bold no-underline transition-colors p-2 rounded"
              >
                Manager Dashboard
              </Link>
            )}
            {(userRole === "operational manager" ||
              userRole === "admin" ||
              userRole === "advocacy coordinator") && (
              <Link
                href="/advocacy-coordinator-dash"
                className="block text-white hover:font-bold no-underline transition-colors p-2 rounded"
              >
                Advocacy Coordinator Dash
              </Link>
            )}
          </nav>
        </aside>

        {/* Main Section */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

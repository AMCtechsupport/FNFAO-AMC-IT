"use client";

// *** This is where the links for the application on the side go ***

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function UserHome(props: {children: ReactNode} ) {
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

            {/* New Client Section */}
            <div className="mt-6">
              <h3 className="text-gray-300 text-sm font-semibold uppercase tracking-wide px-3 pb-2 border-b border-gray-700">
                New Client
              </h3>
              <div className="mt-3 space-y-2">
                <Link
                  href="/pre-intake"
                  className="block no-underline bg-gray-800 text-white font-medium hover:bg-gray-700 hover:shadow-md transition p-3 rounded-md ml-4 text-sm"
                >
                  Pre-Intake
                </Link>
                <Link
                  href="/youth-intake"
                  className="block no-underline bg-gray-800 text-white font-medium hover:bg-gray-700 hover:shadow-md transition p-3 rounded-md ml-4 text-sm"
                >
                  Youth-Intake
                </Link>
              </div>
            </div>

            {/* Separator line */}
            <hr className="my-6 border-gray-700" />

            {/* {userRole != "advocate" && (
            <Link
              href="/full-intake"
              className="block no-underline bg-gray-800 text-white font-medium hover:bg-gray-700 hover:shadow-md transition p-3 rounded-md"
            >
              Full-Intake
            </Link>
            )} */}
            
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

            <Link
              href="/report"
              className="block no-underline bg-gray-800 text-white font-medium hover:bg-gray-700 hover:shadow-md transition p-3 rounded-md"
            >
              Report
            </Link>
          </nav>
        </aside>

        {/* Main Section */}
        <main className="flex-1 p-6">{props.children}</main>
      </div>
    </div>
  );
}

"use client";

// *** This is where the links for the application on the side go ***

import { ReactNode, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import UserHomeLink from "../../../components/user-home/user-home-link";

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
              <UserHomeLink
                name='Admin'
                path='admin'
              />
            )}

           {userRole === "advocate" && (
              <UserHomeLink
                name='Dashboard'
                path='user-dashboard'
              />
            )}

            {userRole != "advocate" && (
              <UserHomeLink
                name='Profile'
                path='profile'
              />
            )}

            {/* New Client Section */}
            <div className="mt-6">
              <h3 className="text-gray-300 text-sm font-semibold uppercase tracking-wide px-3 pb-2 border-b border-gray-700">
                New Client
              </h3>
              <div className="mt-3 space-y-2">

                <UserHomeLink
                  name='Pre-Intake'
                  path='pre-intake'
                />

                <UserHomeLink
                  name='Youth-Intake'
                  path='youth-intake'
                />
              </div>
            </div>

            {/* Separator line */}
            <hr className="my-6 border-gray-700" />

            <UserHomeLink
              name='Client List'
              path='clients'
            />

            <UserHomeLink
              name='User Logs'
              path='user-logs'
            />

            <UserHomeLink
              name='Settings'
              path='settings'
            />

            <UserHomeLink
              name='Export'
              path='export'
            />

            <UserHomeLink
              name='Report'
              path='report'
            />
          </nav>
        </aside>

        {/* Main Section */}
        <main className="flex-1 p-6">{props.children}</main>
      </div>
    </div>
  );
}

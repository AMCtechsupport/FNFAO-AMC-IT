"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import UserHomeLink from "../../../components/user-home/user-home-link";

type AppRole = "admin" | "advocate" | undefined;

export default function UserHome(props: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const userRole = session?.user?.role as AppRole;

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#cccccc" }}>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex [--sidebar-width:14rem]" style={{ backgroundColor: "#cccccc" }}>
      <aside className="w-56 h-screen sticky top-0 flex-shrink-0 bg-black px-2 py-3 flex flex-col">
        <nav className="flex flex-col gap-0.5 flex-1 min-h-0 overflow-y-auto">
          {userRole === "admin" && (
            <UserHomeLink name="Assign Clients" path="admin" />
          )}
          {userRole === "advocate" && (
            <UserHomeLink name="Dashboard" path="user-dashboard" />
          )}
          {userRole !== "advocate" && (
            <UserHomeLink name="User Management" path="profile" />
          )}

          <p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
            New Client
          </p>
          <UserHomeLink name="Pre-Intake" path="pre-intake" />
          <UserHomeLink name="Youth-Intake" path="youth-intake" />

          <p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Management
          </p>
          <UserHomeLink name="Client List" path="clients" />
          {userRole === "admin" && (
            <UserHomeLink name="User Logs" path="user-logs" />
          )}
          {userRole === "admin" && (
            <UserHomeLink name="Manage Dropdowns" path="manage-dropdowns" />
          )}
          {userRole === "admin" && <UserHomeLink name="Export" path="export" />}
          {userRole === "admin" && <UserHomeLink name="Report" path="report" />}
        </nav>

        <div className="pt-3 mt-auto border-t border-gray-800 flex-shrink-0">
          <UserHomeLink name="Map" path="map" />
        </div>
      </aside>

      <main className="flex-1 p-6">{props.children}</main>
    </div>
  );
}

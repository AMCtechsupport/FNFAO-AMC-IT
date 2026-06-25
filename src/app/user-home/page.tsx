"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import UserHomeLink from "../../../components/user-home/user-home-link";

type AppRole = "admin" | "advocate" | undefined;

export default function UserHome(props: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const userRole = session?.user?.role as AppRole;

  if (status === "loading") return null;

  return (
    <div className="min-h-screen flex [--sidebar-width:14rem]" style={{ backgroundColor: "#cccccc" }}>
      <aside className="w-56 min-h-screen flex-shrink-0 bg-black px-2 py-3">
        <nav className="flex flex-col gap-0.5">
          {userRole === "admin" && <UserHomeLink name="Admin" path="admin" />}
          {userRole === "advocate" && (
            <UserHomeLink name="Dashboard" path="user-dashboard" />
          )}
          {userRole !== "advocate" && (
            <UserHomeLink name="Profile" path="profile" />
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
      </aside>

      <main className="flex-1 p-6">{props.children}</main>
    </div>
  );
}

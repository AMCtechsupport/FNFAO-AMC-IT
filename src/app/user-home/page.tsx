// src/app/user-home/page.tsx
"use client";

import { ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import UserHomeLink from "../../../components/user-home/user-home-link";

type AppRole = "admin" | "advocate" | undefined;

export default function UserHome(props: { children: ReactNode }) {
  const { isLoaded, sessionClaims } = useAuth();

  const userRole = (sessionClaims as any)?.metadata?.role as AppRole;

  // Avoid flicker until Clerk loads
  if (!isLoaded) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#cccccc" }}>
      <div className="flex">
        <aside className="w-64 bg-black p-4 border-r">
          <nav className="space-y-4">
            {userRole === "admin" && (
              <UserHomeLink name="Admin" path="admin" />
            )}

            {userRole === "advocate" && (
              <UserHomeLink name="Dashboard" path="user-dashboard" />
            )}

            {/* Profile is admin-only in your UI */}
            {userRole !== "advocate" && (
              <UserHomeLink name="Profile" path="profile" />
            )}

            <div className="mt-6">
              <h3 className="text-gray-300 text-sm font-semibold uppercase tracking-wide px-3 pb-2 border-b border-gray-700">
                New Client
              </h3>
              <div className="mt-3 space-y-2">
                <UserHomeLink name="Pre-Intake" path="pre-intake" />
                <UserHomeLink name="Youth-Intake" path="youth-intake" />
              </div>
            </div>

            <hr className="my-6 border-gray-700" />

            <UserHomeLink name="Client List" path="clients" />
            <UserHomeLink name="User Logs" path="user-logs" />
            <UserHomeLink name="Settings" path="settings" />
            <UserHomeLink name="Export" path="export" />

            {userRole === "admin" && (
              <UserHomeLink name="Report" path="report" />
            )}
          </nav>
        </aside>

        <main className="flex-1 p-6">{props.children}</main>
      </div>
    </div>
  );
}

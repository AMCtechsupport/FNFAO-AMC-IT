"use client";

import { signOut } from "next-auth/react";

export default function UnauthorizedPage() {
  return (
    <div className="h-full">
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-gray-900">Access denied</h1>

          <p className="mt-2 text-gray-700">
            Your account is signed in, but it does not have the required role to
            access this page.
          </p>

          <p className="mt-2 text-sm text-gray-600">
            Please contact an administrator to assign you the correct role.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-900 transition !p-[10px_30px]"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

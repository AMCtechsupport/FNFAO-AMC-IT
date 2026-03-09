"use client";

import { useEffect, useState } from "react";
import { useSession, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { linkAdvocateAccount } from "../lib/link-advocate-account";

export default function SetupPage() {
  const { session } = useSession();
  const { signOut } = useClerk();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    linkAdvocateAccount()
      .then(async () => {
        // Reload the Clerk session so the new role shows up immediately
        await session?.reload();
        router.replace("/user-dashboard");
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-red-600 mb-3">Account Setup Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="px-6 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-xl font-semibold text-gray-800 mb-3">Setting up your account...</h1>
        <p className="text-gray-500">Please wait, you will be redirected shortly.</p>
      </div>
    </div>
  );
}

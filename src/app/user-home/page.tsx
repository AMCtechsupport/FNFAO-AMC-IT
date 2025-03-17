import { ReactNode } from "react";
import Link from "next/link";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export default function UserHome({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#cccccc" }}>
      {" "}
      {/* Background color /}

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-black p-4 border-r">
          <nav className="space-y-4">
            <a
              href="#"
              className="block text-white hover:text-purple-600 hover:font-bold transition-colors p-2 rounded"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="block text-white hover:text-gray-300 p-2 rounded"
            >
              Profile
            </a>
            <a
              href="#"
              className="block text-white hover:text-gray-300 p-2 rounded"
            >
              Settings
            </a>
            <Link
              href="/full-intake"
              className="block text-white hover:text-gray-300 p-2 rounded"
            >
              Full-Intake
            </Link>
            <Link
              href="/pre-intake"
              className="block text-white hover:text-gray-300 p-2 rounded"
            >
              Pre-Intake
            </Link>
            <Link
              href="/youth-intake"
              className="block text-white hover:text-gray-300 p-2 rounded"
            >
              Youth-Intake
            </Link>
            <Link
              href="/clients"
              className="block text-white hover:text-gray-300 p-2 rounded"
            >
              Client List
            </Link>
          </nav>
        </aside>

        {/* Main Section */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

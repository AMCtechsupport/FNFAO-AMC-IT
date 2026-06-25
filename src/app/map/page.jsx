"use client";

import dynamic from "next/dynamic";
import UserHome from "../user-home/page";

const FirstNationsMap = dynamic(() => import("@/components/FirstNationsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[520px] text-sm text-gray-500">
      Loading map…
    </div>
  ),
});

export default function MapPage() {
  return (
    <UserHome>
      <main className="min-h-screen bg-gray-100 p-6">
        <FirstNationsMap />
      </main>
    </UserHome>
  );
}

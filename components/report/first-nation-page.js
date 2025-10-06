"use client";

import Link from "next/link";
import { useState } from "react";

export default function FirstNationPage({ name, path }) {
  const [isLoading, setIsLoading] = useState(false);
  

  function onClickHandler() {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">{name}</h2>

      <Link href={`/${path}`}>
        <button
          onClick={onClickHandler}
          type="button"
          disabled={isLoading}
          className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
        >
          {isLoading ? "Loading..." : name}
        </button>
      </Link>
    </div>
  );
}

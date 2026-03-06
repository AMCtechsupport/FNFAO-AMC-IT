import React from "react";

const LogSearchBar = ({ value, onSearchChange }) => {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={onSearchChange}
        placeholder="Search by client name..."
        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      />
    </div>
  );
};

export default LogSearchBar;

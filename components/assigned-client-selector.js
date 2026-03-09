"use client";

import { useState, useEffect, useRef } from "react";
import AssignedClientsToAdvocate from "./assigned-clients";

export default function AssignClientSelector({ advocates }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAdvocates, setFilteredAdvocates] = useState(advocates);
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);

  const containerRef = useRef(null);

  // Deselect advocate when clicking outside this block
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSelectedAdvocate(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter advocates based on the search term
  useEffect(() => {
    const filtered = advocates.filter((advocate) =>
      `${advocate.firstName} ${advocate.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredAdvocates(filtered);
  }, [searchTerm, advocates]);

  return (
    <div ref={containerRef} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[580px]">

      {/* Header */}
      <div className="px-4 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#47315E" }}>
        View Advocate's Clients
      </div>

      <div className="p-6 space-y-5">

        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Search for Advocate
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-700 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Advocate results */}
        {filteredAdvocates.length > 0 && (
          <div className="border border-gray-200 rounded-lg max-h-72 overflow-y-auto divide-y divide-gray-100">
            {filteredAdvocates.map((advocate) => (
              <div
                key={advocate.advocate_id}
                onClick={() => setSelectedAdvocate(advocate.advocate_id)}
                className="px-3 py-2.5 cursor-pointer transition-colors text-sm"
                style={{ backgroundColor: selectedAdvocate === advocate.advocate_id ? "#F0EEF6" : "" }}
                onMouseEnter={(e) => { if (selectedAdvocate !== advocate.advocate_id) e.currentTarget.style.backgroundColor = "#F8F7FC"; }}
                onMouseLeave={(e) => { if (selectedAdvocate !== advocate.advocate_id) e.currentTarget.style.backgroundColor = ""; }}
              >
                <p className="font-medium text-gray-800">{advocate.firstName} {advocate.lastName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{advocate.email}</p>
              </div>
            ))}
          </div>
        )}
        {searchTerm.trim() && filteredAdvocates.length === 0 && (
          <div className="flex flex-col items-center py-6 text-gray-400">
            <svg className="w-10 h-10 mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <p className="text-sm font-medium">No advocates found.</p>
            <p className="text-xs mt-1">Try adjusting your search</p>
          </div>
        )}

        {/* Assigned clients for selected advocate */}
        {selectedAdvocate && (
          <AssignedClientsToAdvocate advocateId={selectedAdvocate} />
        )}

      </div>
    </div>
  );
}

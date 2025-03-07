"use client";

import { useState, useEffect } from "react";
import AssignedClientsToAdvocate from "./assigned-clients";

export default function AssignClientSelector({ advocates }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAdvocates, setFilteredAdvocates] = useState(advocates);
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);

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
    <div>
      <div className="mt-6">
        <label className="block text-lg font-semibold p-2 text-gray-700">
          Search for Advocate:
        </label>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />
      </div>

      {/* Display filtered advocates */}
      {filteredAdvocates.length > 0 && (
        <div className="mt-4 border-2 rounded-lg p-4 max-h-48 bg-gray-200 overflow-y-auto">
          <ul>
            {filteredAdvocates.map((advocate) => (
              <li
                key={advocate.advocate_id}
                onClick={() => setSelectedAdvocate(advocate.advocate_id)}
                className={`p-2 cursor-pointer hover:bg-gray-100 ${
                  selectedAdvocate === advocate.advocate_id ? "bg-gray-100" : ""
                }`}
              >
                <span className="font-semibold">
                  {advocate.firstName} {advocate.lastName}
                </span>
                <br />
                <span className="text-sm text-gray-600">
                  ID: {advocate.advocate_id}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* If an advocate is selected, show their assigned clients */}
      {selectedAdvocate && (
        <AssignedClientsToAdvocate advocateId={selectedAdvocate} />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

export default function AdvocatesTable({ array }) {
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);

  const handleRowClick = (advocate) => {
    setSelectedAdvocate(advocate);
    console.log("Clicked advocate:", advocate);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200 rounded-xl">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-6 py-3 text-gray-700 font-semibold border-b">
              Advocate Name
            </th>
            <th className="text-left px-6 py-3 text-gray-700 font-semibold border-b">
              Number of Clients in Service
            </th>
          </tr>
        </thead>
        <tbody>
          {array.map((advocate, index) => {
            const isSelected = selectedAdvocate?.name === advocate.name;
            return (
              <tr
                key={index}
                onClick={() => handleRowClick(advocate)}
                className={`cursor-pointer transition-colors duration-300 ${
                  isSelected
                    ? "bg-gradient-to-r from-purple-400 to-indigo-500 text-white"
                    : "hover:bg-gray-50 text-gray-800"
                }`}
              >
                <td className="px-6 py-3 border-b text-center">
                  {advocate.name}
                </td>
                <td className="px-6 py-3 border-b text-center">
                  {advocate.client}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedAdvocate && (
        <div className="mt-4 text-center text-gray-700 font-medium">
          Selected Advocate:{" "}
          <span className="text-indigo-600 font-semibold">
            {selectedAdvocate.name}
          </span>{" "}
          ({selectedAdvocate.client} clients)
        </div>
      )}
    </div>
  );
}

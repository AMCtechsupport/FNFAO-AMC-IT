"use client";

import { useState } from "react";

export default function AdvocatesTable({ array }) {
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
//made the row clickable
  const handleRowClick = (advocate) => {
    setSelectedAdvocate(advocate);
    console.log("Clicked advocate:", advocate);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200 rounded-xl">
        <thead className="bg-gray-100">
          <tr>
          {/*table headings*/}
            <th className="text-left px-6 py-3 text-gray-700 font-semibold border-b">
              Advocate Name
            </th>
            <th className="text-left px-6 py-3 text-gray-700 font-semibold border-b">
              Number of Clients in Service
            </th>
          </tr>
        </thead>
        <tbody>
          {array.map((advocate, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 transition cursor-pointer"
              onClick={() => handleRowClick(advocate)}
            >
              <td className="bg-white px-6 py-3 border-b">{advocate.name}</td>
              <td className="bg-white px-6 py-3 border-b">{advocate.client}</td>
            </tr>
          ))}
        </tbody>
      </table>
    {/* show the selected advocate*/}
      {selectedAdvocate && (
        <div className="mt-4 text-center text-gray-700">
          Selected Advocate: {selectedAdvocate.name} ({selectedAdvocate.client} clients)
        </div>
      )}
    </div>
  );
}

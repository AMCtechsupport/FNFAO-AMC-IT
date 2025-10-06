"use client";

import { useState } from "react";

export default function FirstNationFilters({ type, array }) {
  const [value, setValue] = useState("");

  return (
    <div className="flex-1">
      <label className="block font-semibold mb-1 text-gray-700">{type}</label>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Select {type}</option>
        {array.map((item, index) => (
          <option key={index} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}

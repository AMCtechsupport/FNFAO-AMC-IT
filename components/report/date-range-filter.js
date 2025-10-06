"use client";

import { useState } from "react";

export default function DateFilterPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex gap-4 items-end">
        <div className="flex flex-col flex-1">
          <label className="text-gray-700 font-medium">From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </div>
        <div className="flex flex-col flex-1">
          <label className="text-gray-700 font-medium">To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </div>
      </div>
    </div>
  );
}

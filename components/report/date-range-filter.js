"use client";

import { useState } from "react";

export default function DateFilterPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateReport = () => {
    setError("");

    if (!fromDate || !toDate) {
      setError("Please select both From and To dates.");
      return;
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (start > end) {
      setError("Start date cannot be after End date.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      alert(`Report generated for dates: ${fromDate} to ${toDate}`);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex p-6">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
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

          {error && (
            <p className="text-red-500 text-sm font-medium">{error}</p>
          )}
          
          {/* Button is just for testing */}
          
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
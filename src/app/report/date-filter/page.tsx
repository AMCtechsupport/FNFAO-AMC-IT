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

    // if (start.getTime() === end.getTime()) {
    //   setError("Start date and End date cannot be the same.");
    //   return;
    // }

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
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Date Filter Report
        </h1>

        <div className="flex flex-col gap-4 mb-4">
          
          <label className="text-gray-700 font-medium">From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded p-2"
          />

          <label className="text-gray-700 font-medium">To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded p-2"
          />

          {error && (
            <p className="text-red-500 text-sm font-medium">{error}</p>
          )}

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

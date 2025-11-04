"use client";

import { useState } from "react";

export default function QuarterFilter({ value, onChange }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const quarters = [
    { label: "Q1 (Apr-Jun)", value: "Q1", months: [3, 4, 5] },
    { label: "Q2 (Jul-Sep)", value: "Q2", months: [6, 7, 8] },
    { label: "Q3 (Oct-Dec)", value: "Q3", months: [9, 10, 11] },
    { label: "Q4 (Jan-Mar)", value: "Q4", months: [0, 1, 2] },
  ];

  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedQuarter, setSelectedQuarter] = useState("");

  const handleQuarterChange = (quarter) => {
    setSelectedQuarter(quarter);
    if (quarter && selectedYear) {
      onChange({ year: selectedYear, quarter });
    } else {
      onChange(null);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    if (year && selectedQuarter) {
      onChange({ year, quarter: selectedQuarter });
    } else {
      onChange(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        {/* Year Dropdown */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Quarter Dropdown */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quarter
          </label>
          <select
            value={selectedQuarter}
            onChange={(e) => handleQuarterChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Quarter</option>
            {quarters.map((q) => (
              <option key={q.value} value={q.value}>
                {q.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {value && (
        <p className="text-sm text-gray-600">
          Selected: {value.quarter} {value.year}
        </p>
      )}
    </div>
  );
}
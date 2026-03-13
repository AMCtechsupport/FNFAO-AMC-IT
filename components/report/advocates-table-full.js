/*
This component fetches and displays a full advocates report table
with options to download the data in JSON or CSV format.
*/

"use client";

import { useEffect, useState } from "react";
import { getAdvocatesWithClientCounts } from "@/app/lib/get-advocates-with-counts";

export const downloadJSON = (data, filename = "advocates_report") => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};

export const downloadCSV = (data, filename = "advocates_report") => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName])).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};

export default function AdvocatesTableFull({ onDataLoaded, active, inactive, startDate, endDate }) {
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchAdvocates = async () => {
      setLoading(true);
      try {
        const result = await getAdvocatesWithClientCounts(active, inactive, startDate, endDate);

        if (result.error) {
          setFetchError(result.error);
          setAdvocates([]);
        } else {
          setAdvocates(result.data || []);
          if (onDataLoaded) onDataLoaded(result.data || []);
        }
      } catch (err) {
        console.error("Error fetching advocates:", err);
        setFetchError("Failed to load advocates");
        setAdvocates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvocates();
  }, [active, inactive, startDate, endDate, onDataLoaded]); 

  if (loading) return <p className="text-center text-gray-500">Loading advocates...</p>;
  if (fetchError) return <p className="text-center text-red-500">{fetchError}</p>;
  if (advocates.length === 0) return <p className="text-center text-gray-500">No advocates found.</p>;

  return (
    <div className="overflow-x-auto">
      <div className="overflow-y-auto overflow-x-hidden border border-gray-200 rounded-xl">
        <table className="w-full border border-gray-200 rounded-xl">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-center px-6 py-3 text-gray-700 font-semibold border-b">
                Advocate Name
              </th>
              <th className="text-center px-6 py-3 text-gray-700 font-semibold border-b">
                Number of Clients in Service
              </th>
              <th className="text-center px-6 py-3 text-gray-700 font-semibold border-b">
                Number of New Clients
              </th>
            </tr>
          </thead>

          <tbody>
            {advocates.map((advocate, index) => (
              <tr key={index}>
                <td className="px-6 py-3 border-b text-center">{advocate.name}</td>
                <td className="px-6 py-3 border-b text-center">{advocate.clientCount}</td>
                <td className="px-6 py-3 border-b text-center">{advocate.newClientCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
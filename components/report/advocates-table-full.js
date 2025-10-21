"use client";

import { useEffect, useState } from "react";
import supabase from "@/app/lib/supabase";

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


export default function AdvocatesTableFull({ onDataLoaded }) { 
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchAdvocates = async () => {
      setLoading(true);
      try {
        const { data: advocatesData, error: advocatesError } = await supabase
          .from("Advocates")
          .select("advocate_id, firstName, lastName");

        if (advocatesError) throw advocatesError;

        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from("Assigned Advocates")
          .select("advocate_id, client_id");

        if (assignmentsError) throw assignmentsError;

        const mergedData = advocatesData.map((advocate) => {
          const count = assignmentsData.filter(
            (item) => item.advocate_id === advocate.advocate_id
          ).length;

          return {
            name: `${advocate.firstName} ${advocate.lastName}`,
            clientCount: count,
          };
        });

        setAdvocates(mergedData);
        if (onDataLoaded) onDataLoaded(mergedData);
      } catch (err) {
        console.error("Error fetching advocates:", err);
        setFetchError("Failed to load advocates");
      } finally {
        setLoading(false);
      }
    };

    fetchAdvocates();
  }, []); 

  if (loading)
    return <p className="text-center text-gray-500">Loading advocates...</p>;

  if (fetchError)
    return <p className="text-center text-red-500">{fetchError}</p>;

  if (advocates.length === 0)
    return <p className="text-center text-gray-500">No advocates found.</p>;

  return (
    <div className="overflow-x-auto">
      <div
        className="overflow-y-auto overflow-x-hidden border border-gray-200 rounded-xl"
      >
        <table className="w-full border border-gray-200 rounded-xl">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-center px-6 py-3 text-gray-700 font-semibold border-b">
                Advocate Name
              </th>
              <th className="text-center px-6 py-3 text-gray-700 font-semibold border-b">
                Number of Clients in Service
              </th>
            </tr>
          </thead>
          <tbody>
            {advocates.map((advocate, index) => {
              return (
                <tr
                  key={index}
                >
                  <td className="px-6 py-3 border-b text-center">
                    {advocate.name}
                  </td>
                  <td className="px-6 py-3 border-b text-center">
                    {advocate.clientCount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
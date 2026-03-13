/*
This component fetches advocate data from Supabase,
and displays it in a table format, showing the number of clients
assigned to each advocate.
*/

"use client";

import { useEffect, useState } from "react";
import supabase from "@/app/lib/supabase";

export default function AdvocatesTableData() {
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
      } catch (err) {
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
        style={{ maxHeight: "300px" }}
      >
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
            {advocates.map((advocate, index) => (
              <tr key={index} className="hover:bg-gray-50 text-gray-800">
                <td className="px-6 py-3 border-b text-center">
                  {advocate.name}
                </td>
                <td className="px-6 py-3 border-b text-center">
                  {advocate.clientCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
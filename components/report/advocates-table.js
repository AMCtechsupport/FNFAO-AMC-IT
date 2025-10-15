"use client";

import { useEffect, useState } from "react";
import supabase from "@/app/lib/supabase";

export default function AdvocatesTable() {
  const [advocates, setAdvocates] = useState([]);
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchAdvocates = async () => {
      setLoading(true);
      try {
        // fetch advocates
        const { data: advocatesData, error: advocatesError } = await supabase
          .from("Advocates")
          .select("advocate_id, firstName, lastName");

        if (advocatesError) throw advocatesError;

        // fetch assigned advocates
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from("Assigned Advocates")
          .select("advocate_id, client_id");

        if (assignmentsError) throw assignmentsError;

        // merge data and count clients
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
        console.error("Error fetching advocates:", err);
        setFetchError("Failed to load advocates");
      } finally {
        setLoading(false);
      }
    };

    fetchAdvocates();
  }, []);

  const handleRowClick = (advocate) => {
    setSelectedAdvocate(advocate);
    console.log("Clicked advocate:", advocate);
  };

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
            {advocates.map((advocate, index) => {
              const isSelected = selectedAdvocate?.name === advocate.name;
              return (
                <tr
                  key={index}
                  onClick={() => handleRowClick(advocate)}
                  className={`cursor-pointer transition-colors duration-300 ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-400 to-indigo-600 text-white"
                      : "hover:bg-gray-50 text-gray-800"
                  }`}
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
         {/* show the selected advocate*/}
      {selectedAdvocate && (
        <div className="mt-4 text-center text-gray-700">
          Selected Advocate:{" "}
          <span className="text-indigo-600 font-semibold">
            {selectedAdvocate.name} ({selectedAdvocate.clientCount} clients)
          </span>
        </div>
      )}
    </div>
  );
}

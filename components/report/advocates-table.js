/*
This component fetches and displays a paginated table of advocates,
allowing selection of individual advocates and filtering by status and date range.
*/

"use client";

import { useEffect, useState } from "react";
import Pagination from "./pages-pagination";
import { usePagination } from "./pagination-hooks";
import { getAdvocatesWithClientCounts } from "@/app/lib/get-advocates-with-counts";

export default function AdvocatesTable({
  onSelect,
  active,
  inactive,
  startDate,
  endDate,
}) {
  const [advocates, setAdvocates] = useState([]);
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Using pagination hook
  const {
    currentItems: currentAdvocates,
    currentPage,
    totalPages,
    totalItems,
    setCurrentPage,
  } = usePagination(advocates, 20);

  useEffect(() => {
    const fetchAdvocates = async () => {
      setLoading(true);
      try {
        const result = await getAdvocatesWithClientCounts(
          active,
          inactive,
          startDate,
          endDate,
        );

        if (result.error) {
          setFetchError(result.error);
          setAdvocates([]);
        } else {
          setAdvocates(result.data);
        }
      } catch (err) {
        console.error("Error fetching advocates:", err);
        setFetchError("Failed to load advocates");
      } finally {
        setLoading(false);
      }
    };

    fetchAdvocates();
  }, [active, inactive, startDate, endDate]);

  const handleRowClick = (advocate) => {
    setSelectedAdvocate(advocate);
    console.log("Clicked advocate:", advocate);
    if (onSelect) onSelect(advocate);
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
          <thead style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
            <tr>
              <th className="text-center px-6 py-3 text-white font-semibold border-b border-purple-900/80/80">
                Advocate Name
              </th>
              <th className="text-center px-6 py-3 text-white font-semibold border-b border-purple-900/80/80">
                Number of Clients in Service
              </th>
              <th className="text-center px-6 py-3 text-white font-semibold border-b border-purple-900/80/80">
                Number of New Clients
              </th>
            </tr>
          </thead>
          <tbody>
            {/* To show only the selected advocates  for the current page */}
            {currentAdvocates.map((advocate, index) => {
              const isSelected =
                selectedAdvocate?.advocate_id === advocate.advocate_id;
              return (
                <tr
                  key={index}
                  onClick={() => handleRowClick(advocate)}
                  className="cursor-pointer transition-colors duration-300 hover:bg-gray-50"
                  style={
                    isSelected
                      ? { backgroundColor: "rgba(240, 238, 246, 0.8)" }
                      : {}
                  }
                >
                  <td className="px-6 py-3 border-b text-center">
                    {advocate.name}
                  </td>
                  <td className="px-6 py-3 border-b text-center">
                    {advocate.clientCount}
                  </td>
                  <td className="px-6 py-3 border-b text-center">
                    {advocate.newClientCount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Using Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Showing information about the pages */}
      <p className="text-center text-sm text-gray-600 mt-2">
        Page {currentPage} of {totalPages} ({totalItems} total advocates)
      </p>

      {/* show the selected advocate*/}
      {selectedAdvocate && (
        <div className="mt-4 text-center text-gray-700">
          Selected Advocate:{" "}
          <span
            className="font-semibold"
            style={{ color: "rgba(97, 0, 215, 0.8)" }}
          >
            {selectedAdvocate.name} ({selectedAdvocate.clientCount} clients,{" "}
            {selectedAdvocate.newClientCount} new)
          </span>
        </div>
      )}
    </div>
  );
}

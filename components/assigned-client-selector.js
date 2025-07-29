"use client";

import { useState, useEffect } from "react";
import AssignedClientsToAdvocate from "./assigned-clients";
import supabase from "@/app/lib/supabase";

export default function AssignClientSelector({ advocates, onAssignmentChange }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAdvocates, setFilteredAdvocates] = useState([]);
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [advocatesWithClientCount, setAdvocatesWithClientCount] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch client counts for all advocates
  useEffect(() => {
    const fetchClientCounts = async () => {
      try {
        setLoading(true);
        
        // Get client counts for each advocate
        const advocatesWithCounts = await Promise.all(
          advocates.map(async (advocate) => {
            const { count, error } = await supabase
              .from("Assigned Advocates")
              .select("*", { count: "exact" })
              .eq("advocate_id", advocate.advocate_id);

            if (error) {
              console.error(`Error fetching client count for advocate ${advocate.advocate_id}:`, error);
              return { ...advocate, clientCount: 0 };
            }

            return { ...advocate, clientCount: count || 0 };
          })
        );

        // Sort advocates by client count (descending)
        const sortedAdvocates = advocatesWithCounts.sort((a, b) => b.clientCount - a.clientCount);
        setAdvocatesWithClientCount(sortedAdvocates);
        setFilteredAdvocates(sortedAdvocates);
      } catch (error) {
        console.error("Error fetching client counts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (advocates && advocates.length > 0) {
      fetchClientCounts();
    }
  }, [advocates]);

  // Filter advocates based on the search term
  useEffect(() => {
    const filtered = advocatesWithClientCount.filter((advocate) =>
      `${advocate.firstName} ${advocate.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredAdvocates(filtered);
  }, [searchTerm, advocatesWithClientCount]);

  return (
    <div>
      <div className="mt-6">
        <label className="block text-lg font-semibold p-2 text-gray-700">
          Search for Advocate:
        </label>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />
      </div>

      {/* Display filtered advocates with client counts */}
      {loading ? (
        <div className="mt-4 p-4 text-center text-gray-600">
          Loading advocate data...
        </div>
      ) : filteredAdvocates.length > 0 ? (
        <div className="mt-4 border-2 rounded-lg p-4 max-h-96 bg-gray-200 overflow-y-auto">
          <div className="mb-3 pb-2 border-b border-gray-300">
            <h3 className="font-semibold text-gray-800">Advocates (ordered by client count)</h3>
          </div>
          <ul>
            {filteredAdvocates.map((advocate) => (
              <li
                key={advocate.advocate_id}
                onClick={() => setSelectedAdvocate(advocate.advocate_id)}
                className={`p-3 cursor-pointer hover:bg-gray-100 rounded-md mb-2 transition-colors ${
                  selectedAdvocate === advocate.advocate_id ? "bg-blue-100 border-l-4 border-blue-500" : "bg-white"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900">
                      {advocate.firstName} {advocate.lastName}
                    </span>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Email: </span>
                      {advocate.email}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Phone: </span>
                      {advocate.phoneNumber}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      advocate.clientCount > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {advocate.clientCount} {advocate.clientCount === 1 ? 'client' : 'clients'}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-4 p-4 text-center text-gray-600">
          No advocates found matching your search.
        </div>
      )}

      {/* Display assigned clients for the selected advocate */}
      {selectedAdvocate && (
        <AssignedClientsToAdvocate 
          advocateId={selectedAdvocate} 
          onAssignmentChange={onAssignmentChange}
        />
      )}
    </div>
  );
}

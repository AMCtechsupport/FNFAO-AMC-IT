"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAssignedClients } from "@/app/lib/get-assigned-clients-server";

export default function AssignedClientsList({ advocateId }) {
  const [allClients, setAllClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const clientsPerPage = 5;

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError(null);

      if (
        advocateId === undefined ||
        advocateId === null ||
        advocateId === ""
      ) {
        setAllClients([]);
        setError("No advocate is linked to this login yet.");
        setLoading(false);
        return;
      }

      try {
        const result = await getAssignedClients(advocateId);

        if (result.error) {
          setError(result.error);
          setAllClients([]);
        } else {
          setAllClients(result.data || []);
        }
      } catch (err) {
        console.error("Error fetching assigned clients:", err);
        setError("Failed to fetch assigned clients: " + err.message);
        setAllClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [advocateId]);

  // Client-side filtering by ID (starts-with) or name (contains)
  const filteredClients = allClients.filter((assignment) => {
    if (!searchQuery.trim()) return true;
    const client = assignment.Clients;
    const term = searchQuery.trim().toLowerCase();

    const idStr = String(client.client_id);
    if (idStr.startsWith(term)) return true;

    const fullName = [client.firstName, client.middleName, client.lastName]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (fullName.includes(term)) return true;

    return false;
  });

  const totalClients = filteredClients.length;
  const totalPages = Math.max(1, Math.ceil(totalClients / clientsPerPage));

  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * clientsPerPage,
    currentPage * clientsPerPage,
  );

  return (
    <div className="w-full">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or client ID"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {loading && <p className="text-gray-700">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* List */}
      {paginatedClients.length > 0 ? (
        <ul className="space-y-3">
          {paginatedClients.map((assignment) => {
            const client = assignment.Clients;
            const fullName = [
              client.firstName,
              client.middleName,
              client.lastName,
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <li key={client.client_id}>
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {fullName || "(No name)"}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium text-gray-700">
                        Client ID:
                      </span>{" "}
                      {client.client_id}
                    </div>
                  </div>

                  <Link
                    href={`/clients/${client.client_id}/view`}
                    className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition no-underline"
                  >
                    View
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        !loading && (
          <p className="text-gray-700">
            No clients found that match your search.
          </p>
        )
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Previous
        </button>

        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

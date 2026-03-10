"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAssignedClients } from "@/app/lib/get-assigned-clients-server";

const formTypeBadge = (clientType) => {
  const isYouth = clientType === "Youth Intake";
  const label = isYouth ? "Youth" : "Adult";
  const style = isYouth
    ? "bg-blue-100 text-blue-700 border border-blue-200"
    : "bg-green-100 text-green-700 border border-green-200";
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${style}`}>
      {label}
    </span>
  );
};

export default function AssignedClientsList({ advocateId }) {
  const [allClients, setAllClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const clientsPerPage = 10;

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError(null);

      if (advocateId === undefined || advocateId === null || advocateId === "") {
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

  // Client-side filtering by name (contains)
  const filteredClients = allClients.filter((assignment) => {
    if (!searchQuery.trim()) return true;
    const client = assignment.Clients;
    const term = searchQuery.trim().toLowerCase();
    const fullName = [client.firstName, client.lastName]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return fullName.includes(term);
  });

  const totalClients = filteredClients.length;
  const totalPages = Math.max(1, Math.ceil(totalClients / clientsPerPage));

  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * clientsPerPage,
    currentPage * clientsPerPage,
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assigned Clients</h2>
          <p className="text-sm text-gray-500 mt-1">Clients currently assigned to you</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: "#F0EEF6", color: "#47315E", border: "1px solid #B2B3D7" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
          {allClients.length} {allClients.length === 1 ? "client" : "clients"}
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          placeholder="Search by client name..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 text-gray-700 focus:outline-none transition"
        />
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="animate-spin h-8 w-8 mb-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-sm">Loading clients...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="text-white" style={{ backgroundColor: "#47315E" }}>
                  <th className="py-3.5 px-5 font-semibold text-xs uppercase tracking-wider">Client Name</th>
                  <th className="py-3.5 px-5 font-semibold text-xs uppercase tracking-wider">Form Type</th>
                  <th className="py-3.5 px-5 font-semibold text-xs uppercase tracking-wider">Date Assigned</th>
                  <th className="py-3.5 px-5 font-semibold text-xs uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedClients.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-16 px-6">
                      <div className="flex flex-col items-center text-gray-400">
                        <svg className="w-10 h-10 mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        <p className="text-sm font-medium">No clients found</p>
                        <p className="text-xs mt-1">Try adjusting your search</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedClients.map((assignment, index) => {
                    const client = assignment.Clients;
                    const fullName = [client.firstName, client.lastName]
                      .filter(Boolean)
                      .join(" ");
                    const isYouth = client.clientType === "Youth Intake";
                    const viewHref = isYouth
                      ? `/youth-clients/${client.client_id}/view`
                      : `/clients/${client.client_id}/view`;

                    return (
                      <tr
                        key={client.client_id}
                        className={`transition-colors hover:bg-gray-50 ${index % 2 !== 0 ? "bg-gray-50/50" : ""}`}
                      >
                        <td className="py-3.5 px-5 font-medium text-gray-800">
                          {fullName || <span className="text-gray-400">(No name)</span>}
                        </td>
                        <td className="py-3.5 px-5">
                          {formTypeBadge(client.clientType)}
                        </td>
                        <td className="py-3.5 px-5 text-gray-600 whitespace-nowrap">
                          {assignment.dateAssigned
                            ? new Date(assignment.dateAssigned).toLocaleDateString("en-CA", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="py-3.5 px-5">
                          <Link
                            href={viewHref}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors no-underline border"
                            style={{ backgroundColor: "#B2B3D7", borderColor: "#9899C0", color: "#47315E" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#9899C0"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#B2B3D7"}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

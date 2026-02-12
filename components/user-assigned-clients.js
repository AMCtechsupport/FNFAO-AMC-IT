import { useState, useEffect } from "react";
import supabase from "@/app/lib/supabase";
import Link from "next/link";

export default function AssignedClientsList({ advocateId }) {
  const [assignedClients, setAssignedClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const clientsPerPage = 5;

  useEffect(() => {
    const fetchAssignedClients = async () => {
      setLoading(true);
      setError(null);

      if (advocateId === undefined || advocateId === null || advocateId === "") {
        setAssignedClients([]);
        setTotalClients(0);
        setError("No advocate is linked to this login yet.");
        setLoading(false);
        return;
      }

      const hasSearch = !!searchQuery?.trim();
      const numericClientId = hasSearch ? Number(searchQuery.trim()) : null;
      if (hasSearch && Number.isNaN(numericClientId)) {
        setAssignedClients([]);
        setTotalClients(0);
        setError("Please enter a valid numeric value for the Client ID.");
        setLoading(false);
        return;
      }

      try {
        const applyFilters = (q) => {
          let next = q.eq("advocate_id", advocateId);
          if (hasSearch) next = next.eq("Clients.client_id", numericClientId);
          return next;
        };

        const countQuery = applyFilters(
          supabase
            .from("Assigned Advocates")
            .select("assigned_advocate_id", { count: "exact", head: true })
        );

        const { count, error: countError } = await countQuery;
        if (countError) throw new Error(countError.message);
        setTotalClients(count || 0);

        const dataQuery = applyFilters(
          supabase
            .from("Assigned Advocates")
            .select("dateAssigned, Clients(client_id, firstName, middleName, lastName)")
            .order("dateAssigned", { ascending: false })
        ).range(
          (currentPage - 1) * clientsPerPage,
          currentPage * clientsPerPage - 1
        );

        const { data, error: dataError } = await dataQuery;
        if (dataError) throw new Error(dataError.message);

        setAssignedClients((data || []).filter((row) => row.Clients !== null));
      } catch (err) {
        setError("Failed to fetch assigned clients: " + err.message);
        setAssignedClients([]);
        setTotalClients(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedClients();
  }, [advocateId, currentPage, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(totalClients / clientsPerPage) || 0);

  return (
    <div className="w-full">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Client ID"
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
      {assignedClients.length > 0 ? (
        <ul className="space-y-3">
          {assignedClients.map((assignment) => {
            const client = assignment.Clients;
            const fullName = [client.firstName, client.middleName, client.lastName]
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
                      <span className="font-medium text-gray-700">Client ID:</span>{" "}
                      {client.client_id}
                    </div>
                  </div>

                  {/* Keep same role routing logic you already use:
                      adult: /clients/:id
                      youth: your logic happens inside client page, or you can change later if needed */}
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
        !loading && <p className="text-gray-700">No clients found that match your search.</p>
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

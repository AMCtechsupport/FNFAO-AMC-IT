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
          supabase.from("Assigned Advocates").select("assigned_advocate_id", { count: "exact", head: true })
        );

        const { count, error: countError } = await countQuery;
        if (countError) throw new Error(countError.message);
        setTotalClients(count || 0);

        const dataQuery = applyFilters(
          supabase
            .from("Assigned Advocates")
            .select("dateAssigned, Clients(client_id, firstName, middleName, lastName, clientType)")
            .order("dateAssigned", { ascending: false })
        ).range((currentPage - 1) * clientsPerPage, currentPage * clientsPerPage - 1);

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

  const getViewHref = (client) => {
    const isYouth = client?.clientType === "Youth Intake";
    return isYouth ? `/youth-clients/${client.client_id}/view` : `/clients/${client.client_id}/view`;
  };

  return (
    <div className="fullIntakeContainer bg-e5e5e5 min-h-screen flex flex-col items-center justify-start">
      <div className="container max-w-5xl w-full px-4 py-6">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by Client ID"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border rounded-md w-full"
          />
        </div>

        {assignedClients.length > 0 ? (
          <ul className="divide-y divide-gray-600">
            {assignedClients.map((assignment) => {
              const client = assignment.Clients;
              const fullName = [client.firstName, client.middleName, client.lastName].filter(Boolean).join(" ");

              return (
                <li key={client.client_id} className="border-gray-600">
                  <div className="text-left p-3 border-2 border-gray-700 rounded-lg mb-4 shadow-sm bg-white flex items-center justify-between gap-4">
                    <div>
                      <div className="text-lg font-bold text-gray-900">{fullName || "(No name)"}</div>
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">Client ID:</span> {client.client_id}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        <span className="font-semibold">Type:</span>{" "}
                        {client.clientType === "Youth Intake" ? "Youth Client" : "Adult Client"}
                      </div>
                    </div>

                    <Link href={getViewHref(client)} className="px-4 py-2 rounded-md bg-gray-200 text-black hover:bg-gray-300">
                      View
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          !loading && <p>No clients found that match your search.</p>
        )}

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-black rounded-md disabled:bg-gray-500"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-black rounded-md disabled:bg-gray-500"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

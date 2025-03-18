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
  const [dateOfBirth, setDateOfBirth] = useState("");
  const clientsPerPage = 5;

  useEffect(() => {
    const fetchAssignedClients = async () => {
      setLoading(true);
      setError(null);

      try {
        // Base query to fetch assigned clients
        let query = supabase
          .from("Assigned Advocates")
          .select("assigned_advocate_id, dateAssigned, Clients(*)", {
            count: "exact",
          })
          .eq("advocate_id", advocateId)
          .order("dateAssigned", { ascending: false });

        // Handle search query
        if (searchQuery) {
          const isNumeric = !isNaN(searchQuery);

          if (isNumeric) {
            // If searchQuery is numeric, search by client_id
            query = query.eq("Clients.client_id", parseInt(searchQuery, 10));
          } else {
            // Apply 'ilike' conditions for each client field separately
            query = query
              .ilike("Clients.firstName", `%${searchQuery}%`)
              .or(`Clients.middleName.ilike.%${searchQuery}%`)
              .or(`Clients.lastName.ilike.%${searchQuery}%`);
          }
        }

        // Get the total number of clients
        const { count, error: countError } = await query.select(
          "*, Clients(*)",
          { count: "exact" }
        );

        if (countError) throw new Error(countError.message);

        setTotalClients(count);

        // Get clients for the current page
        const { data, error } = await query.range(
          (currentPage - 1) * clientsPerPage,
          currentPage * clientsPerPage - 1
        );

        if (error) throw new Error(error.message);

        // Filter out rows where Clients is null
        const filteredData = data.filter(
          (assignment) => assignment.Clients !== null
        );

        setAssignedClients(filteredData);
      } catch (err) {
        setError("Failed to fetch assigned clients: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedClients();
  }, [advocateId, currentPage, searchQuery, dateOfBirth]);

  const totalPages = Math.ceil(totalClients / clientsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="fullIntakeContainer bg-e5e5e5  min-h-screen flex flex-col items-center justify-start">
      {/* Title Section */}

      <div className="container max-w-5xl w-full px-4 py-6">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by ID"
            value={searchQuery}
            onChange={handleSearchChange}
            className="p-2 border rounded-md w-full"
          />
        </div>

        {/* Display filtered clients */}
        {assignedClients.length > 0 ? (
          <ul className="divide-y divide-gray-600">
            {assignedClients.map((assignment) => (
              <li
                key={assignment.Clients.client_id}
                className=" border-gray-600"
              >
                <div className="text-left p-2 border-2 border-gray-700 rounded-lg mb-4 shadow-sm bg-white">
                  <ul className="text-lg font-bold text-gray-900">
                    <Link href={`/clients/${assignment.Clients.client_id}`}>
                      {assignment.Clients.firstName}{" "}
                      {assignment.Clients.middleName}{" "}
                      {assignment.Clients.lastName}
                    </Link>
                  </ul>

                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Client ID: </span>
                    {assignment.Clients.client_id}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Phone: </span>
                    {assignment.Clients.phoneNumber}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Email: </span>
                    {assignment.Clients.email}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">
                      First Nation Membership:{" "}
                    </span>
                    {assignment.Clients.firstNationMembership || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Address: </span>
                    {assignment.Clients.address || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Location: </span>
                    {assignment.Clients.city}, {assignment.Clients.province}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Date of Birth: </span>
                    {assignment.Clients.dateOfBirth
                      ? new Date(
                          assignment.Clients.dateOfBirth
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                  <p className="text-m text-black mt-2 bg-gray-200 p-2 rounded-md">
                    <span className="font-semibold">Date Assigned: </span>
                    {new Date(assignment.dateAssigned).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No clients found that match your search.</p>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 text-black rounded-md disabled:bg-gray-500"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
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

"use client";

import { useState, useEffect } from "react";
import { useClerk, useUser } from "@clerk/clerk-react"; // Import Clerk hooks
import supabase from "../lib/supabase";
import Link from "next/link";

export default function AssignedClientsToAdvocate() {
  const { user } = useUser(); // Get the currently signed-in user from Clerk
  const [assignedClients, setAssignedClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const clientsPerPage = 5;

  // Fetch the advocate's assigned clients using Clerk user_id
  useEffect(() => {
    const fetchAssignedClients = async () => {
      if (!user) return; // Ensure user is authenticated

      setLoading(true);
      setError(null);

      try {
        // Query the Advocates table using Clerk's user_id to get advocate_id
        const { data: advocateData, error: advocateError } = await supabase
          .from("Advocates")
          .select("advocate_id")
          .eq("clerk_user_id", user.id)
          .single();

        if (advocateError) throw new Error(advocateError.message);
        if (!advocateData) throw new Error("Advocate not found");

        const advocateId = advocateData.advocate_id;

        let query = supabase
          .from("Assigned Advocates")
          .select("assigned_advocate_id, dateAssigned, Clients(*)")
          .eq("advocate_id", advocateId)
          .order("dateAssigned", { ascending: false });

        // Handle search query
        if (searchQuery) {
          const isNumeric = !isNaN(searchQuery);

          if (isNumeric) {
            query = query.eq("Clients.client_id", parseInt(searchQuery, 10));
          } else {
            query = query.or(
              `Clients.firstName.ilike.%${searchQuery}%,Clients.middleName.ilike.%${searchQuery}%,Clients.lastName.ilike.%${searchQuery}%`
            );
          }
        }

        // Get the total number of clients assigned to the advocate
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

        setAssignedClients(data);
      } catch (err) {
        setError("Failed to fetch assigned clients: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedClients();
  }, [user, currentPage, searchQuery]);

  // Pagination control handlers
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

  return (
    <div className="assigned-clients-container">
      <h2 className="text-xl font-bold mb-4 p-2">
        Clients Assigned to Advocate
      </h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Display filtered clients */}
      {assignedClients.length > 0 ? (
        <ul className="divide-y divide-gray-600">
          {assignedClients.map((assignment) => (
            <li
              key={assignment.Clients.client_id}
              className="border-b-2 border-gray-600"
            >
              <div className="text-left p-4 border-2 border-gray-700 rounded-lg mb-4 shadow-sm bg-white">
                <ul className="text-lg font-bold text-gray-900">
                  <Link href={`/clients/${assignment.Clients.client_id}`}>
                    {assignment.Clients.firstName} {assignment.Clients.lastName}
                  </Link>
                </ul>

                {/* Display other client details */}
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
                  {assignment.Clients.firstNationMembership}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Address: </span>
                  {assignment.Clients.address}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Location: </span>
                  {assignment.Clients.city}, {assignment.Clients.province}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Date of Birth: </span>
                  {new Date(assignment.Clients.dateOfBirth).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>

                {/* Show the date the client was assigned to the advocate */}
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
  );
}

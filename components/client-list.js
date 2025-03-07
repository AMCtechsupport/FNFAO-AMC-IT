"use client";

import { useState, useEffect } from "react";
import supabase from "../src/app/lib/supabase";
import Link from "next/link";

export default function ClientsList({ initialClients, totalCount }) {
  const [clients, setClients] = useState(initialClients);
  const [search, setSearch] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(totalCount / 10));
  const [clientsPerPage, setClientsPerPage] = useState(10);
  const clientsPerPageOptions = [5, 10, 15, 20];

  // Fetch clients for the current page and search term
  const fetchClients = async (
    page = 1,
    searchQuery = "",
    dateOfBirthQuery = ""
  ) => {
    try {
      let query = supabase
        .from("Clients")
        .select("*", { count: "exact" })
        .range((page - 1) * clientsPerPage, page * clientsPerPage - 1)
        .order("createdAt", { ascending: false });

      if (searchQuery) {
        const isNumeric = !isNaN(searchQuery);

        if (isNumeric) {
          query = query.eq("client_id", parseInt(searchQuery, 10));
        } else {
          query = query.or(
            `firstName.ilike.%${searchQuery}%,middleName.ilike.%${searchQuery}%,lastName.ilike.%${searchQuery}%`
          );
        }
      }

      // Handle Date of Birth search query (only if provided)
      if (dateOfBirthQuery) {
        query = query.eq("dateOfBirth", dateOfBirthQuery);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching data:", error.message);
      } else {
        setClients(data);
        setTotalPages(Math.ceil(count / clientsPerPage));
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  useEffect(() => {
    fetchClients(currentPage, search, dateOfBirth);
  }, [currentPage, search, dateOfBirth, clientsPerPage]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handleDateOfBirthChange = (event) => {
    setDateOfBirth(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleClientsPerPageChange = (event) => {
    setClientsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Main Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by ID, Name, Middle Name, or Last Name"
          value={search}
          onChange={handleSearchChange}
          className="p-2 border rounded-md w-full"
        />
      </div>

      {/* Date Picker for Date of Birth */}
      <div className="mb-4">
        <label
          htmlFor="dateOfBirth"
          className="text-left block text-sm font-semibold text-gray-300"
        >
          Filter by Date of Birth
        </label>
        <input
          id="dateOfBirth"
          type="date"
          value={dateOfBirth}
          onChange={handleDateOfBirthChange}
          className="p-2 border rounded-md w-full mt-2"
        />
      </div>

      {/* Display Clients List */}
      {clients.length > 0 ? (
        <>
          <ul className="divide-y divide-gray-600">
            {clients.map((client) => (
              <li
                key={client.client_id}
                className="py-2 border-b-2 border-gray-600"
              >
                <div className="text-left p-2 border-2 border-gray-700 rounded-lg mb-4 shadow-sm bg-white">
                  <ul className="text-lg font-bold text-gray-900">
                    <Link href={`clients/${client.client_id}`}>
                      {client.firstName} {client.middleName} {client.lastName}
                    </Link>
                  </ul>

                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Client ID: </span>
                    {client.client_id}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Phone: </span>
                    {client.phoneNumber}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Email: </span>
                    {client.email}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">
                      First Nation Membership:{" "}
                    </span>
                    {client.firstNationMembership}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Address: </span>
                    {client.address}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Location: </span>
                    {client.city}, {client.province}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Date of Birth: </span>
                    {new Date(client.dateOfBirth).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Clients per page selector */}
          <div className="mb-4">
            <label className="mr-2">Clients per page:</label>
            <select
              value={clientsPerPage}
              onChange={handleClientsPerPageChange}
              className="p-2 border rounded-md"
            >
              {clientsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-between items-center space-x-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-black rounded-md disabled:bg-gray-700 disabled:opacity-50 hover:bg-gray-800"
            >
              Previous
            </button>

            {/* Current Page Indicator */}
            <span className="self-center text-gray-700">
              Page {currentPage} of {totalPages}
            </span>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-black rounded-md disabled:bg-gray-700 disabled:opacity-50 hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">No clients found.</p>
      )}
    </div>
  );
}

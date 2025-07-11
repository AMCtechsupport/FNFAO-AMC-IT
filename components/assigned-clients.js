"use client";

import { useState, useEffect } from "react";
import supabase from "../src/app/lib/supabase";
import Link from "next/link";
import UnassignClient from "./unassign-advocate";

export default function AssignedClientsToAdvocate({ advocateId }) {
  const [assignedClients, setAssignedClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all clients assigned to the selected advocate
  useEffect(() => {
    const fetchAssignedClients = async () => {
      setLoading(true);
      setError(null);

      try {
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

        // Get all clients (no pagination)
        const { data, error } = await query;

        if (error) throw new Error(error.message);

        setAssignedClients(data);
      } catch (err) {
        setError("Failed to fetch assigned clients: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (advocateId) {
      fetchAssignedClients();
    }
  }, [advocateId, searchQuery]);

  // Handle unassignment
  const handleUnassign = (clientId) => {
    setAssignedClients((prevClients) =>
      prevClients.filter(
        (assignment) => assignment.Clients.client_id !== clientId
      )
    );
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

                {/* Unassign Client Button */}
                <UnassignClient
                  advocateId={advocateId}
                  clientId={assignment.Clients.client_id}
                  onUnassign={handleUnassign}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No clients found that match your search.</p>
      )}


    </div>
  );
}

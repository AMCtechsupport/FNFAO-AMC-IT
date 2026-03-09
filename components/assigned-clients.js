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
    <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#47315E" }}>
        Clients Assigned to Advocate
      </div>

      {loading && <div className="p-4 text-sm text-gray-500">Loading...</div>}
      {error && <div className="p-4 text-sm text-red-500">{error}</div>}

      {!loading && !error && assignedClients.length === 0 && (
        <div className="p-4 text-sm text-gray-500">No clients assigned to this advocate.</div>
      )}

      {assignedClients.length > 0 && (
        <div className="divide-y divide-gray-100">
          {assignedClients.map((assignment) => (
            <div key={assignment.Clients.client_id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-base font-bold text-gray-900">
                  {assignment.Clients.firstName} {assignment.Clients.lastName}
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/clients/${assignment.Clients.client_id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border no-underline transition-colors"
                    style={{ backgroundColor: "#B2B3D7", borderColor: "#9899C0", color: "#47315E" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#9899C0"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#B2B3D7"}
                  >
                    View
                  </Link>
                </div>
              </div>

              <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm text-gray-700">
                <span className="font-semibold">Date Assigned: </span>
                {new Date(assignment.dateAssigned).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </div>

              <div className="mt-3">
                <UnassignClient
                  advocateId={advocateId}
                  clientId={assignment.Clients.client_id}
                  onUnassign={handleUnassign}
                />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

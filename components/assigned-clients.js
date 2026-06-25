"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getAssignedClients } from "@/app/lib/get-assigned-clients-server";
import UnassignClient from "./unassign-advocate";

function clientViewHref(client) {
  const isYouth = client.clientType === "Youth Intake";
  return isYouth
    ? `/youth-clients/${client.client_id}/view`
    : `/adult-clients/${client.client_id}/view`;
}

function formatDateAssigned(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function AssignedClientsToAdvocate({ advocateId }) {
  const [allAssignments, setAllAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAssignedClients = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getAssignedClients(advocateId);
        setAllAssignments(result.data || []);
      } catch (err) {
        setError("Failed to fetch assigned clients: " + err.message);
        setAllAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    if (advocateId) {
      fetchAssignedClients();
    }
  }, [advocateId]);

  const assignedClients = useMemo(() => {
    const withClients = allAssignments.filter((row) => row.Clients != null);
    const term = searchQuery.trim().toLowerCase();
    if (!term) return withClients;

    const numericId = /^\d+$/.test(term) ? parseInt(term, 10) : null;

    return withClients.filter((assignment) => {
      const client = assignment.Clients;
      if (numericId !== null) {
        return client.client_id === numericId;
      }
      const fullName = [client.firstName, client.middleName, client.lastName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return fullName.includes(term);
    });
  }, [allAssignments, searchQuery]);

  const handleUnassign = (clientId) => {
    setAllAssignments((prev) =>
      prev.filter((assignment) => assignment.Clients?.client_id !== clientId),
    );
  };

  return (
    <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
      <div
        className="px-4 py-3 text-white text-xs font-semibold uppercase tracking-wider"
        style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}
      >
        Clients Assigned to Advocate
      </div>

      <div className="p-4 border-b border-gray-100">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by client name or ID..."
          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-700 focus:outline-none"
        />
      </div>

      {loading && <div className="p-4 text-sm text-gray-500">Loading...</div>}
      {error && <div className="p-4 text-sm text-red-500">{error}</div>}

      {!loading && !error && assignedClients.length === 0 && (
        <div className="p-4 text-sm text-gray-500">
          No clients assigned to this advocate.
        </div>
      )}

      {assignedClients.length > 0 && (
        <div className="divide-y divide-gray-100">
          {assignedClients.map((assignment) => {
            const client = assignment.Clients;
            return (
              <div key={assignment.assigned_advocate_id ?? client.client_id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-base font-bold text-gray-900">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Status: {client.clientStatus || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={clientViewHref(client)}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border no-underline transition-colors"
                      style={{
                        backgroundColor: "rgba(97, 0, 215, 0.02)",
                        borderColor: "rgba(97, 0, 215, 0.3)",
                        color: "rgba(97, 0, 215, 0.8)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#ffffff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(97, 0, 215, 0.02)";
                        e.currentTarget.style.borderColor =
                          "rgba(97, 0, 215, 0.3)";
                      }}
                    >
                      View
                    </Link>
                  </div>
                </div>

                <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm text-gray-700">
                  <span className="font-semibold">Date Assigned: </span>
                  {formatDateAssigned(assignment.dateAssigned)}
                </div>

                <div className="mt-3">
                  <UnassignClient
                    advocateId={advocateId}
                    clientId={client.client_id}
                    initialStatus={client.clientStatus}
                    onUnassign={handleUnassign}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

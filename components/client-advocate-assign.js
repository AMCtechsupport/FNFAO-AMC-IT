"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

export default function ClientAdvocateAssign({ clientId, onAssignmentChange }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [advocates, setAdvocates] = useState([]);
  const [currentAdvocateId, setCurrentAdvocateId] = useState(null);
  const [currentAdvocateName, setCurrentAdvocateName] = useState(null);
  const [selectedAdvocateId, setSelectedAdvocateId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const loadAssignment = useCallback(async () => {
    if (!clientId) return;
    const res = await fetch(`/api/assigned-advocate?client_id=${clientId}`);
    if (!res.ok) return;
    const json = await res.json();
    setCurrentAdvocateName(json.advocateName || null);
    setCurrentAdvocateId(json.advocate_id || null);
    setSelectedAdvocateId(json.advocate_id ? String(json.advocate_id) : "");
  }, [clientId]);

  useEffect(() => {
    if (!isAdmin || !clientId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const advocatesRes = await fetch("/api/advocates");
        const advocatesJson = await advocatesRes.json();
        setAdvocates(
          (advocatesJson.advocates || []).filter((a) => a.role !== "admin"),
        );
        await loadAssignment();
      } catch (err) {
        setError("Failed to load advocate assignment.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAdmin, clientId, loadAssignment]);

  if (!isAdmin) return null;

  const handleAssign = async () => {
    if (!selectedAdvocateId) {
      setError("Please select an advocate.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/assigned-advocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: Number(clientId),
          advocate_id: Number(selectedAdvocateId),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to assign advocate");
      }

      setMessage(
        json.alreadyAssigned
          ? "This advocate is already assigned to this client."
          : "Advocate assigned successfully.",
      );
      await loadAssignment();
      onAssignmentChange?.();
    } catch (err) {
      setError(err.message || "Failed to assign advocate.");
    } finally {
      setSaving(false);
    }
  };

  const handleUnassign = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/assigned-advocate", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: Number(clientId) }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to unassign advocate");
      }

      setMessage("Advocate unassigned.");
      setCurrentAdvocateId(null);
      setCurrentAdvocateName(null);
      setSelectedAdvocateId("");
      onAssignmentChange?.();
    } catch (err) {
      setError(err.message || "Failed to unassign advocate.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div
        className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider"
        style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}
      >
        Assigned Advocate
      </div>
      <div className="p-5 space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading assignment...</p>
        ) : (
          <>
            <p className="text-sm text-gray-700">
              Current:{" "}
              <strong>{currentAdvocateName || "Unassigned"}</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedAdvocateId}
                onChange={(e) => setSelectedAdvocateId(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
              >
                <option value="">Select advocate...</option>
                {advocates.map((advocate) => (
                  <option key={advocate.advocate_id} value={advocate.advocate_id}>
                    {advocate.firstName} {advocate.lastName}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAssign}
                disabled={saving || !selectedAdvocateId}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-50"
                style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}
              >
                {saving ? "Saving..." : currentAdvocateId ? "Reassign" : "Assign"}
              </button>
              {currentAdvocateId && (
                <button
                  type="button"
                  onClick={handleUnassign}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-red-200 text-red-600 bg-red-50 disabled:opacity-50"
                >
                  Unassign
                </button>
              )}
            </div>
          </>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}
      </div>
    </div>
  );
}

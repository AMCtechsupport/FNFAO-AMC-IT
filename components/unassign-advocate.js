"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../src/app/lib/supabase";

export default function UnassignClient({ advocateId, clientId, initialStatus, onUnassign }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedStatus, setSavedStatus] = useState(initialStatus || "Inactive");
  const [pendingStatus, setPendingStatus] = useState(initialStatus || "Inactive");

  const isDirty = pendingStatus !== savedStatus;

  const handleStatusSelect = (value) => {
    setPendingStatus(value);
    setError(null);
  };

  const handleStatusSave = async () => {
    setStatusLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("Clients")
      .update({ clientStatus: pendingStatus })
      .eq("client_id", clientId);

    if (updateError) {
      setError("Failed to update status: " + updateError.message);
    } else {
      setSavedStatus(pendingStatus);
      router.refresh();
    }
    setStatusLoading(false);
  };

  const handleStatusCancel = () => {
    setPendingStatus(savedStatus);
    setError(null);
  };

  const handleUnassign = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: unassignError } = await supabase
        .from("Assigned Advocates")
        .delete()
        .eq("advocate_id", advocateId)
        .eq("client_id", clientId);

      if (unassignError) throw new Error(unassignError.message);

      // Revert client status to Inactive when unassigned
      await supabase
        .from("Clients")
        .update({ clientStatus: "Inactive" })
        .eq("client_id", clientId);

      onUnassign(clientId);
      router.refresh();
    } catch (err) {
      setError("Failed to unassign client: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={pendingStatus}
        onChange={(e) => handleStatusSelect(e.target.value)}
        className="text-xs px-2.5 py-1 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
      >
        <option value="Select Status">Select status</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
        <option value="Critical Incident Working Group">Critical Incident Working Group</option>
      </select>

      {isDirty ? (
        <>
          <button
            onClick={handleStatusSave}
            disabled={statusLoading}
            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors text-green-600 bg-green-50 hover:bg-green-100 border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {statusLoading ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleStatusCancel}
            disabled={statusLoading}
            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors text-gray-600 bg-gray-100 hover:bg-gray-200 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        </>
      ) : (
        <button
          onClick={handleUnassign}
          disabled={loading}
          className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border transition-colors text-red-500 bg-red-50 hover:bg-red-100 border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Unassign"}
        </button>
      )}

      {error && <p className="text-xs text-red-500 w-full mt-1">{error}</p>}
    </div>
  );
}

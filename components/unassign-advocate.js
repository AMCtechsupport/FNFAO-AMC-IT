"use client";

import { useState } from "react";
import supabase from "../src/app/lib/supabase";

export default function UnassignClient({ advocateId, clientId, onUnassign }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientStatus, setclientStatus] = useState("Inactive");

  // Update status immediately on select change
  const handleStatusChange = async (value) => {
    setclientStatus(value);
    setError(null);

    const { error: updateError } = await supabase
      .from("Clients")
      .update({ clientStatus: value })
      .eq("client_id", clientId);

    if (updateError) {
      setError("Failed to update status: " + updateError.message);
    }
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

      onUnassign(clientId);
    } catch (err) {
      setError("Failed to unassign client: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={clientStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="text-xs px-2.5 py-1 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-300"
      >
        <option value="Select Status">Select status</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
        <option value="Critical Incident Working Group">Critical Incident Working Group</option>
      </select>

      <button
        onClick={handleUnassign}
        disabled={loading}
        className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border transition-colors text-red-500 bg-red-50 hover:bg-red-100 border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "..." : "Unassign"}
      </button>

      {error && <p className="text-xs text-red-500 w-full mt-1">{error}</p>}
    </div>
  );
}

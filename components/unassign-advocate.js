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
    <div>
      <select
        value={clientStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="px-4 py-2 border rounded-md"
      >
        <option value="Select Status">Select status</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
        <option value="Critical Incident Working Group">
          Critical Incident Working Group
        </option>
      </select>

      <button
        onClick={handleUnassign}
        disabled={loading}
        className="px-4 py-2 bg-red-500 text-white rounded-md disabled:bg-gray-500 ml-2"
      >
        {loading ? "Unassigning..." : "Unassign"}
      </button>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

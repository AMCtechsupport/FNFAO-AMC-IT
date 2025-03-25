"use client";

import { useState } from "react";
import supabase from "../src/app/lib/supabase";

export default function UnassignClient({ advocateId, clientId, onUnassign }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientStatus, setclientStatus] = useState("Inactive");

  const handleUnassign = async () => {
    setLoading(true);
    setError(null);

    try {
      // Unassign the client
      const { error: unassignError } = await supabase
        .from("Assigned Advocates")
        .delete()
        .eq("advocate_id", advocateId)
        .eq("client_id", clientId);

      if (unassignError) throw new Error(unassignError.message);

      // Update the client type
      const { error: updateError } = await supabase
        .from("Clients")
        .update({ clientStatus })
        .eq("client_id", clientId);

      if (updateError) throw new Error(updateError.message);

      onUnassign(clientId); // Notify parent component about the unassignment
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
        onChange={(e) => setclientStatus(e.target.value)}
        className="px-4 py-2 border rounded-md"
      >
        <option value="Inactive">Inactive</option>
        <option value="Critical Incident Working Group">
          Critical Incident Working Group
        </option>
        <option value="Closed">Closed</option>
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

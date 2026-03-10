import React, { useEffect, useState } from "react";
import supabase from "@/app/lib/supabase";

const StatusCFSFileSelect = ({ field, form, label, error, disabled }) => {
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    const fetchStatuses = async () => {
      const { data, error } = await supabase
        .from("CFS Status")
        .select("id, cfsStatus");

      if (error) {
        console.error("Error fetching CFS statuses:", error);
      } else {
        setStatuses(data || []);
      }
    };

    fetchStatuses();
  }, []);

  return (
    <>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}:</label>

      <select
        {...field} // Bind Formik's field props
        disabled={disabled}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white"
      >
        <option value="">Select a status</option>
        {statuses.map((status) => (
          <option key={status.id} value={status.cfsStatus}>
            {status.cfsStatus}
          </option>
        ))}
      </select>

      {error && <div className="error">{error}</div>}
    </>
  );
};

export default StatusCFSFileSelect;

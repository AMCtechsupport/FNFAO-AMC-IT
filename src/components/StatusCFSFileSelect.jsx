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
      <label>{label}:</label>
      
      <select
        {...field} // Bind Formik's field props
        disabled={disabled}
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

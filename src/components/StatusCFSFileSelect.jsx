import React, { useEffect, useState } from "react";
import supabase from "@/app/lib/supabase";

const StatusCFSFileSelect  = ({ name, value, onChange, disabled }) => {
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    const fetchStatuses = async () => {
      const { data, error } = await supabase
        .from("CFS Status")
        .select("id, cfsStatus");

      if (error) {
        console.error("Error fetching CFS statuses:", error);
      } else {
        setStatuses(data);
      }
    };

    fetchStatuses();
  }, []);

  const handleChange = (event) => {
    // setFieldValue(name, event.target.value);
    if (typeof onChange === "function") {
      onChange(event);
    } else {
      console.warn("⚠️ onChange is not a function:", onChange);
    }
  };

  return (
    <div className="form-group">
      <label htmlFor={name}>CFS Status:</label>
      <select
        name={name}
        value={value}
        onChange={handleChange}
        className="form-control"
        disabled={disabled}
      >
        <option value="">Select a status</option>
        {statuses.map((status) => (
          <option key={status.id} value={status.cfsStatus}>
            {" "}
            {status.cfsStatus}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StatusCFSFileSelect;

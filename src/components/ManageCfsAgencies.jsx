import React, { useEffect, useState } from "react";
import supabase from "@/app/lib/supabase";

const ManageCfsAgencies = ({ name, value, setFieldValue, disabled }) => {
  const [agencies, setAgencies] = useState([]);

  useEffect(() => {
    const fetchAgencies = async () => {
      const { data, error } = await supabase
        .from("CFS Agencies")
        .select("agency_id, agencyName");

      if (error) {
        console.error("Error fetching CFS agencies:", error);
      } else {
        setAgencies(data);
      }
    };

    fetchAgencies();
  }, []);

  const handleChange = (event) => {
    setFieldValue(name, event.target.value);
  };

  return (
    <div className="form-group">
      <label htmlFor={name}>CFS Agency:</label>
      <select
        name={name}
        value={value}
        onChange={handleChange}
        className="form-control"
        disabled={disabled}
      >
        <option value="">Select an agency</option>
        {agencies.map((agency) => (
          <option key={agency.agency_id} value={agency.agencyName}>
            {" "}
            {agency.agencyName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ManageCfsAgencies;

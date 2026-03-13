import React, { useEffect, useState } from "react";
import supabase from "@/app/lib/supabase";
import styles from "@/app/pre-intake/preIntake.module.css";

const ManageCfsAgencies = ({
  field,
  form,
  label,
  error,
  disabled,
}) => {
  const [agencies, setAgencies] = useState([]);

  useEffect(() => {
    const fetchAgencies = async () => {
      const { data, error } = await supabase
        .from("CFS Agencies")
        .select("agency_id,agencyName");

      if (error) {
        console.error("Error fetching CFS agencies:", error);
      } else {
        setAgencies(data || []);
      }
    };

    fetchAgencies();
  }, []);

  return (
    <>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}:</label>

      <select
        {...field}
        disabled={disabled}
        className={styles.select}
      >
        <option value="">Select an agency</option>
        {agencies.map((agency) => (
          <option key={agency.agency_id} value={agency.agencyName}>
            {agency.agencyName}
          </option>
        ))}
      </select>

      {error && <div className="error">{error}</div>}
    </>
  );
};

export default ManageCfsAgencies;

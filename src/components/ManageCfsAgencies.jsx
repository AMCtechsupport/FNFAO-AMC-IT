import React, { useEffect, useState } from "react";
import supabase from "@/app/lib/supabase";

const ManageCfsAgencies = ({
  field, // Formik field prop
  form, // Formik form prop
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
        {...field} // Bind Formik's field props
        disabled={disabled}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white"
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

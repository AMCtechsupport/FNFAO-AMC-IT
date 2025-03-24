import React, { useEffect, useState } from "react";
import { Field } from "formik";
import supabase from "@/app/lib/supabase";

const ManageCfsAgencies = ({
  name,
  label,
  error,
  value,
  onChange,
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
      <label htmlFor={name}>{label}:</label>

      {/* Use Formik's Field component for binding with the form */}
      <Field as="select" name="cfsAgency">
        <option value="">Select an agency</option>
        {agencies.map((agency) => (
          <option key={agency.agency_id} value={agency.agencyName}>
            {agency.agencyName}
          </option>
        ))}
      </Field>

      {error && <div className="error">{error}</div>}
    </>
  );
};

export default ManageCfsAgencies;

import React, { useEffect, useState } from "react";
import supabase from "@/app/lib/supabase";

const FirstNationSelect = ({ field, form, label, error, disabled }) => {
  const [firstNations, setFirstNations] = useState([]);

  useEffect(() => {
    const fetchFirstNations = async () => {
      const { data, error } = await supabase
        .from("First Nations")
        .select("nation_id,firstNationMembership");

      if (error) {
        console.error("Error fetching first nations:", error);
      } else {
        setFirstNations(data || []);
      }
    };

    fetchFirstNations();
  }, []);

  return (
    <>
      <label htmlFor={name}>{label}:</label>

      <select
        {...field} // Bind Formik's field props
        disabled={disabled}
      >
        <option value="">Select a first nation</option>
        {firstNations.map((nation) => (
          <option key={nation.nation_id} value={nation.firstNationMembership}>
            {nation.firstNationMembership}
          </option>
        ))}
      </select>

      {error && <div className="error">{error}</div>}
    </>
  );
};

export default FirstNationSelect;

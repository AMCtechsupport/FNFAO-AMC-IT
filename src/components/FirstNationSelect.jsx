import React, { useEffect, useState } from "react";
import { Field } from "formik";
import supabase from "@/app/lib/supabase";
import styles from "@/app/pre-intake/preIntake.module.css";

const FirstNationSelect = ({ name, label, error, value, onChange }) => {
  const [firstNations, setFirstNations] = useState([]);

  // Fetch first nations data from Supabase when the component mounts
  useEffect(() => {
    const fetchFirstNations = async () => {
      const { data, error } = await supabase
        .from("First Nations")
        .select("firstNationMembership");

      if (error) {
        console.error("Error fetching first nations:", error);
      } else {
        setFirstNations(data);
      }
    };

    fetchFirstNations();
  }, []);

  return (
    <>
      <label htmlFor={name}>{label}:</label>
      <Field
        as="select"
        name={name}
        className={styles.select}
        value={value}
        onChange={onChange}
      >
        <option value="">Select a first nation</option>
        {firstNations.map((nation) => (
          <option
            key={nation.firstNationMembership}
            value={nation.firstNationMembership}
          >
            {nation.firstNationMembership}
          </option>
        ))}
      </Field>

      {error && <div className="error">{error}</div>}
    </>
  );
};

export default FirstNationSelect;

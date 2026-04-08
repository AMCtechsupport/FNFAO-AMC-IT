import React, { useEffect, useState } from "react";
import { ErrorMessage } from "formik";
import supabase from "@/app/lib/supabase";
import styles from "@/app/pre-intake/preIntake.module.css";

const FirstNationSelect = ({ field, form, label, error, disabled }) => {
  const { name, value } = field;
  const { errors, touched, setFieldValue } = form;

  const [firstNations, setFirstNations] = useState([]);

  useEffect(() => {
    const fetchFirstNations = async () => {
      const { data, error } = await supabase
        .from("First Nations")
        .select("nation_id,firstNationMembership")
      if (error) {
        console.error(error);
      } else {
        const priority = ["Non-Status", "Metis", "Métis"];

        const sorted = data.sort((a, b) => {
          if (priority.includes(a.firstNationMembership)) return -1;
          if (priority.includes(b.firstNationMembership)) return 1;
          return 0;
        });

        setFirstNations(sorted);
      }
    };

    fetchFirstNations();
  }, []);

  const handleChange = (e) => {
    setFieldValue(name, e.target.value);
  };

  return (
    <>
      {label && <label htmlFor={name} className="block text-xs font-medium text-gray-600 mb-1">{label}:</label>}

      <select
        {...field}
        id={name}
        name={name}
        value={value || ""}
        disabled={disabled}
        onChange={handleChange}
        className={`${styles.select} ${errors[name] && touched[name] ? "border-red-400" : ""}`}
      >
        <option value="">Select a first nation</option>
        {firstNations.map((nation) => (
          <option key={nation.nation_id} value={nation.firstNationMembership}>
            {nation.firstNationMembership}
          </option>
        ))}
      </select>

      <ErrorMessage name={name} component="p" className={styles.errorText} />
    </>
  );
};

export default FirstNationSelect;

import React, { useEffect, useState } from "react";
import { ErrorMessage } from "formik";
import supabase from "@/app/lib/supabase";
import styles from "@/app/youth-intake/youthIntake.module.css";

const FirstNationSelect = ({ field, form, label, error, disabled }) => {
  const { name, value } = field;
  const { errors, touched, setFieldValue } = form;
  
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

    const handleChange = (e) => {
    setFieldValue(name, e.target.value);
  };

  return (
    <>
      {label && <label htmlFor={name}>{label}:</label>}

      <select
        {...field} // Bind Formik's field props
        id={name}
        name={name}
        value={value || ""}
        disabled={disabled}
        onChange={handleChange}
        className={errors[name] && touched[name] ? styles.errorInput : ""}
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

import React from "react";
import { Field } from "formik";
import styles from "@/app/pre-intake/preIntake.module.css";

const MartialStatusSelect = ({ name, label, error, disabled }) => {
  return (
    <>
      <label htmlFor="martialStatus">{label}:</label>
      <Field
        as="select"
        name={name}
        className={styles.select}
        disabled={disabled}
      >
        <option value="">Select an option</option>
        <option value="single">Single</option>
        <option value="married">Married</option>
        <option value="commonLawDivorced ">Common Law Divorced </option>
        <option value="widowed">Widowed</option>
      </Field>
    </>
  );
};

export default MartialStatusSelect;

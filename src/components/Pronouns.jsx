import React from "react";
import { Field } from "formik";
import styles from "@/app/pre-intake/preIntake.module.css";

const PronounSelect = ({ name, label, error }) => {
  return (
    <>
      <label htmlFor="pronoun">{label}</label>
      <Field as="select" name={name} className={styles.select}>
        <option value="">Select pronouns</option>
        <option value="she/her">She/Her</option>
        <option value="he/him">He/Him</option>
        <option value="they/them">They/Them</option>
        <option value="prefer_not_to_say">Other/Prefer not to say</option>
      </Field>
    </>
  );
};

export default PronounSelect;


import React from "react";
import { Field } from "formik";
import styles from "@/app/pre-intake/preIntake.module.css";

const ReferredBySelect = ({ name, label, error }) => {
  return (
    <>
      <label htmlFor={name}>{label}</label>
      <Field as="select" name={name} className={styles.select}>
        <option value="">Select an option</option>
        <option value="family_friend">By family/friend</option>
        <option value="online">Online (social media, web etc.)</option>
        <option value="referral">Third-Party Referral</option>
        <option value="walk_in">Walk-in</option>
        <option value="fnfao_management">By FNFAO Management</option>
        <option value="first_nation_chief">By Their First Nation/Chief</option>
      </Field>
      {error && <p className={styles.error}>{error}</p>}
    </>
  );
};

export default ReferredBySelect;

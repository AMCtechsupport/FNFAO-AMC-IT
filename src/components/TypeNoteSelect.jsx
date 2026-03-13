import React from "react";
import { Field } from "formik";
import styles from "@/app/pre-intake/preIntake.module.css";

const TypeNoteSelect = ({name, label, error, disabled }) => {
    return(
        <>
            <label htmlFor="typeNote">{label}:</label>
            <Field as="select" name={name} className={styles.select} disabled={disabled}>
                <option value="">Select an option</option>
                <option value="general">General</option>
                <option value="initialMeeting">Initial Meeting</option>
                <option value="agencyMeeting">Agency Meeting</option>
                <option value="networkMeeting">Network Meeting</option>
                <option value="court">Court</option>
                <option value="otherType">Other</option>
            </Field>
        </>
    );
}

export default TypeNoteSelect;

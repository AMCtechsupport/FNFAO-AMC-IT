import React from "react";
import { Field } from "formik";
import styles from "@/app/pre-intake/preIntake.module.css";

const TypeNoteSelect = ({name, label, error, disabled }) => {
    return(
        <>
            <label htmlFor="typeNote">{label}:</label>
            <Field as="select" name={name} className={styles.select} disabled={disabled}>
                <option value="">Select an option</option>
                <option value="contact">Contact</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
            </Field>
        </>
    );
}

export default TypeNoteSelect;

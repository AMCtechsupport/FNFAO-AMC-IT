import React from "react";
import { Field } from "formik";
import styles from "@/app/pre-intake/preIntake.module.css";

const StatusCFSFileSelect = ({name, label, error, disabled }) => {
    return(
        <>
            <label htmlFor="statusCFSFile">{label}:</label>
            <Field as="select" name={name} className={styles.select} disabled={disabled}>
                <option value="">Select an option</option>
                <option value="temporary">Temporary</option>
                <option value="Permanent">Permanent</option>
                <option value="place_safety">Place of Safety</option>
            </Field>
        </>
    );
}

export default StatusCFSFileSelect;

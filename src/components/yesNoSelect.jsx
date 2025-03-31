import React from "react";
import { Field, useFormikContext } from "formik";
import styles from "@/app/pre-intake/preIntake.module.css";

const YesNoSelect = ({ name, label, error, disabled }) => {
    const { setFieldValue } = useFormikContext();

    return (
        <>
            <label htmlFor={name}>{label}</label>
            <Field
                as="select"
                name={name}
                className={styles.select}
                disabled={disabled}
                onChange={(e) => setFieldValue(name, e.target.value === "true")}
            >
                <option value="">Select an option</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
            </Field>
        </>
    );
};

export default YesNoSelect;


import React from "react";
import { Field, ErrorMessage } from "formik";
import styles from "@/app/pre-intake/preIntake.module.css";

const InputField = ({ name, label, placeholder, error }) => {
    return (
        <>
            <label htmlFor={name}>{label}</label>
            <Field  type="text" id={name} name={name} placeholder={placeholder} />
            <ErrorMessage name={name} component={() => <p className={styles.errorText}>{error}</p>} />
        </>
    );
}

export default InputField;

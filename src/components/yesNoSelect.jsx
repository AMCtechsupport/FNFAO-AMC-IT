import React from "react";
import { Field, useFormikContext } from "formik";
import styles from "@/app/pre-intake/preIntake.module.css";

const YesNoSelect = ({ name, label, error, disabled }) => {
    const { setFieldValue, values } = useFormikContext();
    
    // Get the current field value and convert to appropriate display value
    const getCurrentValue = () => {
        const fieldValue = values[name] || (name.includes('.') ? getNestedValue(values, name) : values[name]);
        if (fieldValue === true) return "true";
        if (fieldValue === false) return "false";
        return "";
    };

    // Helper function to get nested field values
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((current, key) => {
            if (key.includes('[') && key.includes(']')) {
                const arrayKey = key.substring(0, key.indexOf('['));
                const index = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')));
                return current?.[arrayKey]?.[index];
            }
            return current?.[key];
        }, obj);
    };

    return (
        <>
            <label htmlFor={name}>{label}</label>
            <Field
                as="select"
                name={name}
                className={styles.select}
                disabled={disabled}
                value={getCurrentValue()}
                onChange={(e) => {
                    const value = e.target.value;
                    if (value === "true") {
                        setFieldValue(name, true);
                    } else if (value === "false") {
                        setFieldValue(name, false);
                    } else {
                        setFieldValue(name, null);
                    }
                }}
            >
                <option value="">Select an option</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
            </Field>
        </>
    );
};

export default YesNoSelect;

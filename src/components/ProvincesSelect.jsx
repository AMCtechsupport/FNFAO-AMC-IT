import React from "react";
import { Field } from "formik";
import styles from "@/app/pre-intake/preIntake.module.css";

const  ProvincesSelect = ({name, label, error, disabled }) => {

    return (
        <>
            <label htmlFor="province">{label}</label>
            <Field as="select" name={name} className={styles.select} disabled={disabled}>
                <option value="">Select a province</option>
                <option value="alberta">Alberta</option>
                <option value="british_columbia">British Columbia</option>
                <option value="manitoba">Manitoba</option>
                <option value="new_brunswick">New Brunswick</option>
                <option value="newfoundland_and_labrador">Newfoundland and Labrador</option>
                <option value="northwest_territories">Northwest Territories</option>
                <option value="nova_scotia">Nova Scotia</option>
                <option value="nunavut">Nunavut</option>
                <option value="ontario">Ontario</option>
                <option value="prince_edward_island">Prince Edward Island</option>
                <option value="quebec">Quebec</option>
                <option value="saskatchewan">Saskatchewan</option>
                <option value="yukon">Yukon</option>
            </Field>
        </>
    );
}

export default ProvincesSelect;

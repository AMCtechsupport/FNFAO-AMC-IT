import React from "react";
import { Field } from "formik";
import styles from "@/app/pre-intake/preIntake.module.css";

const SubTypeNoteSelect = ({name, label, error, disabled }) => {
    return(
        <>
            <label htmlFor="subTypeNote">{label}:</label>
            <Field as="select" name={name} className={styles.select} disabled={disabled}>
                <option value="">Select an option</option>
                <option value="inOffice">In Office</option>
                <option value="outOffice">Out of Office</option>
                <option value="onLineMeeting">On-Line Meeting</option>
                <option value="otherSubType">Other</option>
            </Field>
        </>
    );
}

export default SubTypeNoteSelect;
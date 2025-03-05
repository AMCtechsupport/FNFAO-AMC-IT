
import React from "react";
import { Field } from "formik";
import styles from "@/app/pre-intake/preIntake.module.css";

const RelationshipToChildrenSelect = ({name, label, error }) => {
    return(
        <>
            <label htmlFor="relationshipToChildren">{label}</label>
            <Field as="select" name={name} className={styles.select}>
                <option value="">Select an option</option>
                <option value="parent">Parent</option>
                <option value="grandparend">Grandparend</option>
                <option value="childInCare<">Child-in-Care</option>
                <option value="fosterParent">Foster Parent</option>
                <option value="familyMembe">Family Member</option>
                <option value="guardian">Guardian</option>
                <option value="other">Other</option>
            </Field>
        </>
    );
}

export default RelationshipToChildrenSelect;
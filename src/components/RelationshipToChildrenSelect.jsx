
import React from "react";
import { ErrorMessage, Field } from "formik";
import styles from "@/app/pre-intake/preIntake.module.css";

const RelationshipToChildrenSelect = ({name, label, error, disabled }) => {
    return(
        <>
            <label htmlFor="relationshipToChildren" className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            <Field as="select" name={name} className={styles.select} disabled={disabled}>
                <option value="">Select an option</option>
                <option value="parent">Parent</option>
                <option value="grandparent">Grandparent</option>
                <option value="childInCare">Child-in-Care</option>
                <option value="fosterParent">Foster Parent</option>
                <option value="familyMember">Family Member</option>
                <option value="guardian">Guardian</option>
                <option value="other">Other</option>
            </Field>

            <ErrorMessage 
                name={name}
                component="div"
                className={styles.errorText}
            />
        </>
    );
}

export default RelationshipToChildrenSelect;
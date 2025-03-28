import React from "react";
import { Field } from "formik";
import styles from "@/app/pre-intake/preIntake.module.css";

const GenderSelect = ({ name, label, error, disabled }) => {
    return (
        <>
            <label htmlFor={name}>{label}</label>
            <Field as="select" name={name} className={styles.select} disabled={disabled}>
                <option value="">Select a gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non_binary">Non-binary</option>
                <option value="transgender">Transgender</option>
                <option value="genderfluid">Genderfluid</option>
                <option value="agender">Agender</option>
                <option value="bigender">Bigender</option>
                <option value="demiboy">Demiboy</option>
                <option value="demigirl">Demigirl</option>
                <option value="intergender">Intergender</option>
                <option value="pangender">Pangender</option>
                <option value="queer_gender">Queer gender</option>
                <option value="androgynous">Androgynous</option>
                <option value="two_spirit">Two-Spirit</option>
                <option value="gender_non_conforming">Gender Non-Conforming</option>
            </Field>
            {error && <div className={styles.errorText}>{error}</div>}
        </>
    );
};

export default GenderSelect;

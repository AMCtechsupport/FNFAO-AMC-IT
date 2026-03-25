import React, { useEffect, useState } from "react";
import { ErrorMessage } from "formik";
import styles from "@/app/pre-intake/preIntake.module.css";

export default function AssignAdvocateUponSubmission({ field, form, label, error }) {
    const { name, value } = field;
    const { errors, touched, setFieldValue } = form;

    // const [firstNations, setFirstNations] = useState([]);
    const [allAdvocates, setAllAdvocates] = useState([]);
    const [advocates, setAdvocates] = useState([]);

    useEffect(() => {
        const fetchAdvocatesDropdown = async () => {
            try {
            const res = await fetch(`/api/advocates`);

            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                console.error(
                    "Error fetching advocates:",
                    json?.error || `Status ${res.status}`,
                );
                setAdvocates([]);
                return;
            }

            const json = await res.json();
            const advocatesList = json.advocates || [];
            setAllAdvocates(advocatesList);
            setAdvocates(advocatesList);
            } catch (err) {
                console.error("Unexpected error:", err);
                setAllAdvocates([]);
                setAdvocates([]);
            }
        };

        fetchAdvocatesDropdown();
    }, []);

    const handleChange = (e) => {
        setFieldValue(name, e.target.value);
    };

    return(
    <>
        {label && <label htmlFor={name} className="block text-xs font-medium text-gray-600 mb-1">{label}:</label>}

        <select
            {...field}
            id={name}
            name={name}
            value={value || ""}
            onChange={handleChange}
            className={`${styles.select} ${errors[name] && touched[name] ? "border-red-400" : ""}`}
        >
            <option value="none">None</option>
            {advocates.map((advocate) => (
            <option key={advocate.advocate_id} value={advocate.advocate_id}>
                {advocate.firstName} {advocate.lastName}
            </option>
            ))}
        </select>

        <ErrorMessage name={name} component="p" className={styles.errorText} />
    </>
    );
}
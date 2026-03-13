import React from "react";
import { ErrorMessage } from "formik";
import styles from "@/app/pre-intake/preIntake.module.css";

// Function to sanitize input (remove non-alphabetic characters except spaces)
const sanitizeInput = (value) => {
  // Replace any character that is not a letter or space with an empty string
  return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
};

// Custom ValidNameInput component
const ValidNameInput = ({ field, form, label, ...props }) => {
  const { name } = field;
  const { errors, touched, setFieldValue } = form;

  // Handle change event to sanitize input before passing to Formik
  const handleChange = (e) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    setFieldValue(name, sanitizedValue); // Update Formik state
  };

  return (
    <div>
      {label && <label htmlFor={name} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <input
        {...field}
        {...props}
        id={name}
        name={name}
        type="text"
        className={`${styles.input} ${errors[name] && touched[name] ? "border-red-400 focus:border-red-400" : ""}`}
        onChange={handleChange}
      />
      {/* Error message */}
      <ErrorMessage name={name} component="p" className="text-red-500 text-xs mt-1" />
    </div>
  );
};

export default ValidNameInput;

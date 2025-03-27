import React from "react";
import { ErrorMessage } from "formik";

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
    setFieldValue(name, sanitizedValue); // Update Formik state with sanitized value
  };

  return (
    <div>
      {label && <label htmlFor={name}>{label}</label>}
      <input
        {...field}
        {...props}
        id={name}
        name={name}
        type="text"
        className={errors[name] && touched[name] ? styles.errorInput : ""}
        onChange={handleChange} // Use the sanitized onChange handler
      />
      {/* Error message */}
      <ErrorMessage name={name} component="p" />
    </div>
  );
};

export default ValidNameInput;

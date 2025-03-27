import React from "react";
import { ErrorMessage } from "formik";

// Function to sanitize email (trim and lowercase)
const sanitizeEmail = (value) => {
  return value.trim().toLowerCase();
};

// Function to validate email format
const validateEmail = (value) => {
  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|ca|org|net|edu|gov|mil)$/;
  if (!value) {
    return "Email is required";
  } else if (!emailRegex.test(value)) {
    return "Please enter a valid email address";
  }
  return null;
};

// Custom EmailInput component
const EmailInput = ({ field, form, label, ...props }) => {
  const { name } = field;
  const { errors, touched, setFieldValue } = form;

  // Handle change event to sanitize email input before passing to Formik
  const handleChange = (e) => {
    const sanitizedValue = sanitizeEmail(e.target.value);
    setFieldValue(name, sanitizedValue); // Update Formik state
  };

  return (
    <div>
      {label && <label htmlFor={name}>{label}</label>}
      <input
        {...field}
        {...props}
        id={name}
        name={name}
        type="email"
        className={errors[name] && touched[name] ? "errorInput" : ""}
        onChange={handleChange}
      />
      {/* Error message */}
      <ErrorMessage
        name={name}
        component="p"
        className="text-red-500 text-sm mt-1"
      />
    </div>
  );
};

export default EmailInput;

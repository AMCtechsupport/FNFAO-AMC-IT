import React from "react";
import { Field, ErrorMessage } from "formik";

const formatPhoneNumber = (value) => {
  if (!value) return value;

  const phoneNumber = value.replace(/[^\d]/g, "");
  const phoneNumberLength = phoneNumber.length;

  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
    3,
    6
  )}-${phoneNumber.slice(6, 10)}`;
};

const PhoneNumberInput = ({ field, form, ...props }) => {
  const handleChange = (e) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    form.setFieldValue(field.name, formattedPhoneNumber);
  };

  return (
    <div className="form-group">
      <label htmlFor={field.name}>{props.label}</label>
      <input
        {...field}
        {...props}
        type="text"
        className="form-control"
        onChange={handleChange}
      />
      <ErrorMessage name={field.name} component="div" className="text-danger" />
    </div>
  );
};

export default PhoneNumberInput;

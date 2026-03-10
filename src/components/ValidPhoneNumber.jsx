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
    <div>
      <input
        {...field}
        {...props}
        value={field.value ?? ""}
        type="text"
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white"
        onChange={handleChange}
      />
      <ErrorMessage name={field.name} component="div" className="text-red-500 text-xs mt-1" />
    </div>
  );
};

export default PhoneNumberInput;

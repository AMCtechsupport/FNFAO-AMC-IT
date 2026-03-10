import React from "react";
import { Field, ErrorMessage } from "formik";
import InputMask from "react-input-mask";

const InputField = ({ label, name, type = "text", placeholder, error, disabled }) => {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {type === "phoneNumber" ? (
        <Field name={name}>
          {({ field }) => (
            <InputMask
              {...field}
              mask="(999) 999-9999"
              maskChar=""
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white"
              placeholder={placeholder}
              disabled={disabled}
            />
          )}
        </Field>
      ) : (
        <Field
          type={type}
          id={name}
          name={name}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white"
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      <ErrorMessage name={name} component="div" className="text-red-500 text-xs mt-1" />
    </div>
  );
};

export default InputField;

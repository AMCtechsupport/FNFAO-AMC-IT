import React from "react";
import { Field, ErrorMessage } from "formik";
import InputMask from "react-input-mask";

const InputField = ({ label, name, type = "text", placeholder, error, disabled }) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      {type === "phoneNumber" ? (
        <Field name={name}>
          {({ field }) => (
            <InputMask
              {...field}
              mask="(999) 999-9999"
              maskChar=""
              className="form-control"
              placeholder={placeholder}
            />
          )}
        </Field>
      ) : (
        <Field
          type={type}
          id={name}
          name={name}
          className="form-control"
          placeholder={placeholder}
        />
      )}
      <ErrorMessage name={name} component="div" className="text-danger" />
    </div>
  );
};

export default InputField;

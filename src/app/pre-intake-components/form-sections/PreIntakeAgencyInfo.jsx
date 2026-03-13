"use client";
import React from "react";
import styles from "../../pre-intake/preIntake.module.css";
import { Field, ErrorMessage } from "formik";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";
import StatusCFSFileSelect from "@/components/StatusCFSFileSelect";
import ManageCfsAgencies from "@/components/ManageCfsAgencies";

const labelCls = "block text-xs font-medium text-gray-600 mb-1";

const PreIntakeAgencyInfo = ({ index, errors }) => {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mt-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Agency Information</p>
      <div className="grid grid-cols-12 gap-4 mb-3">
        <div className="col-span-4">
          <Field name={`children.${index}.childCfsAgency`} component={ManageCfsAgencies} label="CFS Agency" placeholder="Agency Name" error={errors.children?.[index]?.childCfsAgency} />
        </div>
        <div className="col-span-4">
          <InputField name={`children.${index}.childCfsAgentFullName`} label="Agency Worker's Full Name:" placeholder="First Name, Last Name" />
        </div>
        <div className="col-span-4">
          <label className={labelCls} htmlFor={`children.${index}.childCfsAgentNumber`}>Phone Number:</label>
          <Field type="number" id={`children.${index}.childCfsAgentNumber`} name={`children.${index}.childCfsAgentNumber`} component={PhoneNumberInput} placeholder="(123) 456-7890" />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <label className={labelCls} htmlFor={`children.${index}.childCfsAgentEmail`}>Email:</label>
          <Field type="email" id={`children.${index}.childCfsAgentEmail`} name={`children.${index}.childCfsAgentEmail`} placeholder="e.g., name@example.com" className={styles.input} />
          <ErrorMessage name={`children.${index}.childCfsAgentEmail`} component={() => <p className={styles.errorText}>{errors.children?.[index]?.childCfsAgentEmail}</p>} />
        </div>
        <div className="col-span-4">
          <Field name={`children.${index}.childStatusCfsFile`} component={StatusCFSFileSelect} label="CFS File Status" error={errors.children?.[index]?.childStatusCfsFile} />
        </div>
      </div>
    </div>
  );
};

export default PreIntakeAgencyInfo;

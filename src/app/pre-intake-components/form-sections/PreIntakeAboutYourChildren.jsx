"use client";
import React from "react";
import styles from "../../pre-intake/preIntake.module.css";
import { Field, ErrorMessage, FieldArray } from "formik";
import ValidNameInput from "@/components/ValidNameInput";
import InputField from "@/components/InputField";
import FirstNationSelect from "@/components/FirstNationSelect";
import PreIntakeAgencyInfo from "./PreIntakeAgencyInfo";

const fieldCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white";
const labelCls = "block text-xs font-medium text-gray-600 mb-1";
const today = new Date().toISOString().split("T")[0]; // get the current date


const RadioPair = ({ name }) => (
  <div className="flex items-center gap-4 mt-1.5">
    <label className="flex items-center gap-1.5 cursor-pointer text-sm font-normal text-gray-700">
      <Field type="radio" name={name} value="yes" /><span>Yes</span>
    </label>
    <label className="flex items-center gap-1.5 cursor-pointer text-sm font-normal text-gray-700">
      <Field type="radio" name={name} value="no" /><span>No</span>
    </label>
  </div>
);

const PreIntakeAboutYourChildren = ({ values, errors }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#6100D7" }}>
        About Your Children
      </div>
      <div className="p-5 space-y-4">

        <FieldArray name="children">
          {({ push, remove }) => (
            <div className="space-y-4">
              {values.children.map((child, index) => (
                <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Child {index + 1}</p>
                    <button type="button" onClick={() => remove(index)} className="text-xs px-3 py-1 rounded-full text-white font-medium transition-colors" style={{ backgroundColor: "#ef4444" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}>
                      Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-12 gap-4 mb-3">
                    <div className="col-span-3">
                      <label className={labelCls} htmlFor={`children.${index}.firstName`}>First Name:</label>
                      <Field id={`children.${index}.firstName`} name={`children.${index}.firstName`} placeholder="Child's First Name" component={ValidNameInput} />
                    </div>
                    <div className="col-span-3">
                      <label className={labelCls} htmlFor={`children.${index}.middleName`}>Middle Name:</label>
                      <Field id={`children.${index}.middleName`} name={`children.${index}.middleName`} placeholder="Child's Middle Name" component={ValidNameInput} />
                    </div>
                    <div className="col-span-5">
                      <label className={labelCls} htmlFor={`children.${index}.lastName`}>Last Name:</label>
                      <Field id={`children.${index}.lastName`} name={`children.${index}.lastName`} placeholder="Child's Last Name" component={ValidNameInput} />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4 mb-2">
                    <div className="col-span-3">
                      <label className={labelCls} htmlFor={`children.${index}.birthDate`}>Date of Birth:</label>
                      <Field type="date" id={`children.${index}.birthDate`} name={`children.${index}.birthDate`} className={fieldCls} max={today} />
                      <ErrorMessage name={`children.${index}.birthDate`} component={() => <p className={styles.errorText}>{errors.children?.[index]?.birthDate}</p>} />
                    </div>
                    <div className="col-span-6">
                      <Field name={`children.${index}.childNation`} component={FirstNationSelect} label="First Nation Membership" error={errors.childNation} />
                    </div>
                    <div className="col-span-3">
                      <InputField name={`children.${index}.childPlaced`} label="Place of Stay:" placeholder="e.g., 123 Main Street" />
                    </div>
                  </div>

                  <PreIntakeAgencyInfo index={index} errors={errors} />
                </div>
              ))}

              <button
                type="button"
                onClick={() => push({ firstName: "", middleName: "", lastName: "", birthDate: "", childNation: "", childPlaced: "", childCfsAgency: "", childCfsAgentFullName: "", childCfsAgentNumber: "", childCfsAgentEmail: "", childStatusCfsFile: "" })}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors border text-white"
                style={{ backgroundColor: "#6100D7", borderColor: "#3a2649" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3a2649")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#6100D7")}
              >
                + Add Child
              </button>
            </div>
          )}
        </FieldArray>

        {/* Visits */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5">
              <label className={labelCls}>Do you currently have visits with your children?</label>
              <RadioPair name="visitsChild" />
              <ErrorMessage name="visitsChild" component="div" className={styles.errorText} />
            </div>
            {values.visitsChild === "yes" && (
              <div className="col-span-7">
                <label className={labelCls}>If yes, how often?</label>
                <Field as="textarea" name="visitsChildFrequency" placeholder="They visit their children..." className={styles.textarea} />
                <ErrorMessage name="visitsChildFrequency" component="div" className={styles.errorText} />
              </div>
            )}
          </div>
        </div>

        {/* Case plan */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5">
              <label className={labelCls}>Do you have a copy of your case plan(s)?</label>
              <RadioPair name="casePlanCopy" />
              <ErrorMessage name="casePlanCopy" component="div" className={styles.errorText} />
            </div>
            {values.casePlanCopy === "no" && (
              <div className="col-span-7">
                <label className={labelCls}>If no, describe the last requests the agency asked you to complete to get your children home:</label>
                <Field as="textarea" name="casePlanCopyDescribe" placeholder="The last requests were..." className={styles.textarea} />
                <ErrorMessage name="casePlanCopyDescribe" component="div" className={styles.errorText} />
              </div>
            )}
          </div>
        </div>

        {/* CFS reason */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <label className={labelCls}>Reason for CFS involvement with your family:</label>
          <Field as="textarea" name="involvedCFSReason" placeholder="CFS are involved because..." className={styles.textarea} />
          <ErrorMessage name="involvedCFSReason" component="div" className={styles.errorText} />
        </div>

      </div>
    </div>
  );
};

export default PreIntakeAboutYourChildren;

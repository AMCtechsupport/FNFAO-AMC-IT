"use client";
import React, { useState, useEffect, useRef } from "react";
import { Formik, Form, useFormikContext } from "formik";

import preIntakeInitialValues from "./utils/preIntakeInitialValues";
import PreIntakeInputValidation from "./utils/PreIntakeInputValidation";
import PreIntakeFormSubmit from "./utils/PreIntakeFormSubmit";

import GeneralInformationHeader from "../full-intake-components/form-sections/GeneralInformationHeader";
import GeneralInformationPartition from "../full-intake-components/form-sections/GeneralInformationPartition";
import ChildrenPartition from "../full-intake-components/form-sections/ChildrenPartition";
import HealthWellnessPartition from "../full-intake-components/form-sections/HealthWellnessPartition";
import ChildFamilyServicesPartition from "../full-intake-components/form-sections/ChildFamilyServices";
import ReferredBySelect from "@/components/ReferredBySelect";

const TABS = ["General", "Children", "Health & Wellness", "Child & Family Services", "Case Notes", "Legal Notes"];

// Fields belonging to each tab that can produce validation errors
const TAB_ERROR_FIELDS = [
  // Tab 0: General
  ["firstName", "middleName", "lastName", "dateOfBirth", "firstNationMembership", "otherFirstNation",
   "phoneNumber", "address", "city", "postalCode", "email",
   "emergencyContactFirstName", "emergencyContactLastName", "emergencyContactNumber",
   "ninePersonalHealthNumber", "sixPersonalHealthNumber",
   "criminalChargesSpecified", "activeWarrantSpecified", "activeInvestigationExplained", "activeOrdersExplained"],
  // Tab 1: Children
  ["relationshipToChildren", "children"],
  // Tab 2-5: no validated required fields
  [], [], [], [],
];

function ValidationErrorToast({ showToast }) {
  const { submitCount, errors } = useFormikContext();
  const shownForSubmit = useRef(0);
  const errorCount = Object.keys(errors).length;
  useEffect(() => {
    if (submitCount > 0 && errorCount > 0 && submitCount !== shownForSubmit.current) {
      showToast("error", "Some required fields are incomplete. Check tabs with a red dot for errors.");
      shownForSubmit.current = submitCount;
    }
  }, [submitCount, errorCount]);
  return null;
}

export default function PreIntakeForm() {
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };
  const { onSubmitPreIntake } = PreIntakeFormSubmit(showToast);
  const [activeTab, setActiveTab] = useState(0);

  const validateRadio = () => undefined;

  return (
    <Formik
      initialValues={preIntakeInitialValues}
      validate={PreIntakeInputValidation}
      onSubmit={onSubmitPreIntake}
    >
      {({ values, errors, setFieldValue, submitCount }) => (
        <Form>
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pre-Intake Form</h1>
              <p className="text-sm text-gray-500 mt-1">Complete all sections and submit when ready</p>
            </div>
            <div className="w-72">
              <ReferredBySelect name="referredBy" label="How did the client learn about FNFAO?" error={errors.referredBy} />
            </div>
          </div>

          <GeneralInformationHeader
            values={values}
            isEditing={true}
            errors={errors}
            hideMetaRow={true}
          />

          {/* Tab bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {TABS.map((tab, i) => {
                const tabHasError = submitCount > 0 && TAB_ERROR_FIELDS[i]?.some(field => errors[field]);
                return (
                  <button
                    key={tab}
                    type="button"
                    data-view-allow="true"
                    onClick={() => setActiveTab(i)}
                    className="px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1"
                    style={
                      activeTab === i
                        ? { backgroundColor: "#47315E", color: "#fff", borderBottom: "2px solid #47315E" }
                        : { color: "#6b7280", borderBottom: "2px solid transparent" }
                    }
                  >
                    {tab}
                    {tabHasError && (
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {activeTab === 0 && (
                <GeneralInformationPartition
                  values={values}
                  isEditing={true}
                  errors={errors}
                  validateRadio={validateRadio}
                  setFieldValue={setFieldValue}
                />
              )}
              {activeTab === 1 && (
                <ChildrenPartition
                  childrenData={values.children}
                  values={values}
                  isEditing={true}
                  errors={errors}
                  setFieldValue={setFieldValue}
                />
              )}
              {activeTab === 2 && (
                <HealthWellnessPartition
                  values={values}
                  isEditing={true}
                  errors={errors}
                  validateRadio={validateRadio}
                  setFieldValue={setFieldValue}
                />
              )}
              {activeTab === 3 && (
                <ChildFamilyServicesPartition
                  childrenData={values.children}
                  values={values}
                  isEditing={true}
                  errors={errors}
                  validateRadio={validateRadio}
                  hideCfsAgencies={true}
                />
              )}
              {activeTab === 4 && (
                <p className="text-sm text-gray-500 italic">Case notes can be added after the client is created.</p>
              )}
              {activeTab === 5 && (
                <p className="text-sm text-gray-500 italic">Legal notes can be added after the client is created.</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-sm font-semibold rounded-lg transition-colors text-white mb-2"
            style={{ backgroundColor: "#8060A0" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6B4E8A")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8060A0")}
          >
            Submit Pre-Intake
          </button>
          <ValidationErrorToast showToast={showToast} />
          {toast && (
            <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
              {toast.type === "success" ? (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {toast.message}
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
}

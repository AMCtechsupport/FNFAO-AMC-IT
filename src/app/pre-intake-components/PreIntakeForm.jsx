"use client";
import React, { useState } from "react";
import { Formik, Form, Field } from "formik";

import preIntakeInitialValues from "./utils/preIntakeInitialValues";
import PreIntakeInputValidation from "./utils/PreIntakeInputValidation";
import PreIntakeFormSubmit from "./utils/PreIntakeFormSubmit";

import GeneralInformationHeader from "../full-intake-components/form-sections/GeneralInformationHeader";
import GeneralInformationPartition from "../full-intake-components/form-sections/GeneralInformationPartition";
import ChildrenPartition from "../full-intake-components/form-sections/ChildrenPartition";
import HealthWellnessPartition from "../full-intake-components/form-sections/HealthWellnessPartition";
import ChildFamilyServicesPartition from "../full-intake-components/form-sections/ChildFamilyServices";
import ReferredBySelect from "@/components/ReferredBySelect";
import AssignAdvocateUponSubmission from "@/components/AssignAdvocateUponSubmission";
import ValidationErrorToast from "../../../components/ValidationErrorToast";
import ToastNotification from "../../../components/ToastNotification";
import StickyFormActions from "@/components/StickyFormActions";

const TABS = ["General", "Children", "Health & Wellness", "Child & Family Services", "Case Notes", "Legal Notes"];

function tabHasFieldError(errors, field) {
  if (field === "children") {
    return (
      Array.isArray(errors.children) &&
      errors.children.some((child) => child && Object.keys(child).length > 0)
    );
  }
  return Boolean(errors[field]);
}

// Fields belonging to each tab that can produce validation errors
const TAB_ERROR_FIELDS = [
  // Tab 0: General
  ["firstName", "middleName", "lastName", "dateOfBirth",
    "phoneNumber", "address", "city", "postalCode", "email",
    "emergencyContactFirstName", "emergencyContactLastName", "emergencyContactNumber",
    "ninePersonalHealthNumber", "sixPersonalHealthNumber",
    "criminalChargesSpecified", "activeWarrantSpecified", "activeInvestigationExplained", "activeOrdersExplained"],
  // Tab 1: Children
  ["relationshipToChildren", "children"],
  // Tab 2-5: no validated required fields
  [], [], [], [],
];

export default function PreIntakeForm() {
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), type === "error" ? 12000 : 4000);
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
              <h1 className="text-2xl font-bold text-gray-900">Client Pre-Intake Form</h1>
              <p className="text-sm text-gray-500 mt-1">Submit stays visible at the bottom while you complete each section</p>
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
            <div className="flex flex-wrap border-b border-gray-200 overflow-x-auto">
              {TABS.map((tab, i) => {
                const tabHasError = submitCount > 0 && TAB_ERROR_FIELDS[i]?.some((field) => tabHasFieldError(errors, field));
                return (
                  <button
                    key={tab}
                    type="button"
                    data-view-allow="true"
                    onClick={() => setActiveTab(i)}
                    className="px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1"
                    style={
                      activeTab === i
                        ? { backgroundColor: "rgba(97, 0, 215, 0.08)", color: "rgba(97, 0, 215, 0.8)", border: "1.5px solid rgba(97, 0, 215, 0.24)" }
                        : { color: "#6b7280", border: "1px solid transparent" }
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

          <StickyFormActions>
            <div className="w-full sm:w-72 min-w-[12rem]">
              <Field
                name="selectedAdvocate"
                component={AssignAdvocateUponSubmission}
                label="Assign Advocate"
                error={errors.AssignAdvocateUponSubmission}
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto shrink-0 text-sm font-semibold py-2.5 px-6 rounded-lg transition-colors border-2"
              style={{ backgroundColor: "rgba(97, 0, 215, 0.08)", borderColor: "rgba(97, 0, 215, 0.24)", color: "rgba(97, 0, 215, 0.8)", transition: "all 0.3s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.8)"; e.currentTarget.style.color = "#ffffff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.08)"; e.currentTarget.style.color = "rgba(97, 0, 215, 0.8)"; }}
            >
              Submit Pre-Intake
            </button>
          </StickyFormActions>
          <ValidationErrorToast showToast={showToast} message="Some required fields are incomplete. Check tabs with a red dot for errors." />
          <ToastNotification toast={toast} position="bottom-24" />
        </Form>
      )}
    </Formik>
  );
}

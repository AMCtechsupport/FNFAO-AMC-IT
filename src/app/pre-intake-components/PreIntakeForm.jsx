"use client";
import React, { useState } from "react";
import { Formik, Form } from "formik";

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

export default function PreIntakeForm() {
  const { onSubmitPreIntake, formSent } = PreIntakeFormSubmit();
  const [activeTab, setActiveTab] = useState(0);

  const validateRadio = () => undefined;

  return (
    <Formik
      initialValues={preIntakeInitialValues}
      validate={PreIntakeInputValidation}
      onSubmit={onSubmitPreIntake}
    >
      {({ values, errors, setFieldValue }) => (
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
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  type="button"
                  data-view-allow="true"
                  onClick={() => setActiveTab(i)}
                  className="px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors"
                  style={
                    activeTab === i
                      ? { backgroundColor: "#47315E", color: "#fff", borderBottom: "2px solid #47315E" }
                      : { color: "#6b7280", borderBottom: "2px solid transparent" }
                  }
                >
                  {tab}
                </button>
              ))}
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
          {formSent && (
            <p className="text-center text-sm text-green-600 font-medium mb-4">Pre-intake sent successfully</p>
          )}
        </Form>
      )}
    </Formik>
  );
}

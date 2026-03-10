"use client";
import React from "react";
import styles from "../pre-intake/preIntake.module.css";
import { Formik, Form } from "formik";

import preIntakeInitialValues from "./utils/preIntakeInitialValues";
import PreIntakeInputValidation from "./utils/PreIntakeInputValidation";
import PreIntakeFormSubmit from "./utils/PreIntakeFormSubmit";

import PreIntakeGeneralInfo from "./form-sections/PreIntakeGeneralInfo";
import PreIntakeAboutYou from "./form-sections/PreIntakeAboutYou";
import PreIntakeOtherQuestions from "./form-sections/PreIntakeOtherQuestions";
import PreIntakeAboutYourChildren from "./form-sections/PreIntakeAboutYourChildren";
import PreIntakeStaffOnly from "./form-sections/PreIntakeStaffOnly";

export default function PreIntakeForm() {
  const { onSubmitPreIntake, formSent } = PreIntakeFormSubmit();

  const validateRadio = (value) => {
    if (!value) return "Please select an option";
  };

  return (
    <Formik
      initialValues={preIntakeInitialValues}
      validate={PreIntakeInputValidation}
      onSubmit={onSubmitPreIntake}
    >
      {({ values, errors }) => (
        <Form>
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pre-Intake Form</h1>
              <p className="text-sm text-gray-500 mt-1">Complete all sections and submit when ready</p>
            </div>
          </div>

          <PreIntakeGeneralInfo errors={errors} />
          <PreIntakeAboutYou values={values} errors={errors} />
          <PreIntakeAboutYourChildren values={values} errors={errors} />
          <PreIntakeOtherQuestions values={values} validateRadio={validateRadio} errors={errors} />
          <PreIntakeStaffOnly />

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
            <p className={styles.successfulText}>Pre-intake sent successfully</p>
          )}
        </Form>
      )}
    </Formik>
  );
}

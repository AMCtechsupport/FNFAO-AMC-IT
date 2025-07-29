"use client";
import React from "react";
import styles from "../pre-intake/preIntake.module.css";
import { Formik, Form} from "formik";
import "bootstrap/dist/css/bootstrap.min.css";

// Imports which are utilized inside the <Formik>
import preIntakeInitialValues from "./utils/preIntakeInitialValues";
import PreIntakeInputValidation from "./utils/PreIntakeInputValidation";
import PreIntakeFormSubmit from "./utils/PreIntakeFormSubmit";

// Imported Form Sections
import PreIntakeGeneralInfo from "./form-sections/PreIntakeGeneralInfo";
import PreIntakeAboutYou from "./form-sections/PreIntakeAboutYou";
import PreIntakeOtherQuestions from "./form-sections/PreIntakeOtherQuestions";
import PreIntakeAboutYourChildren from "./form-sections/PreIntakeAboutYourChildren";
import PreIntakeStaffOnly from "./form-sections/PreIntakeStaffOnly";

export default function PreIntakeForm() {
  const {onSubmitPreIntake, formSent} = PreIntakeFormSubmit();  

  const validateRadio = (value) => {
    if (!value) {
      return "Please select an option"; 
    }
  };

  return (
    <Formik
      initialValues={preIntakeInitialValues}
      validate={PreIntakeInputValidation}
      onSubmit={onSubmitPreIntake}
    >
      {({ values, errors}) => (
        <Form className={styles.form}>
          <div className={styles.titleContainer}>
            <h2 className={styles.centeredTitle}>PRE-INTAKE FORM</h2>
          </div>
          <hr className="separator-line" />
          
          {/* General Information Section */}
          <PreIntakeGeneralInfo
            errors={errors}
          />

          {/* About You Section */}
          <PreIntakeAboutYou
            values={values}
            errors={errors}
          />

          {/* About Your Children Section */}
          <PreIntakeAboutYourChildren
            values={values}
            errors={errors}
          />
          
          {/* Other Questions Section*/}
          <PreIntakeOtherQuestions
            values={values}
            validateRadio={validateRadio}
            errors={errors}
          />

          {/* Staff Only Section */}
          <PreIntakeStaffOnly/>

          <button type="submit" className={styles.submitButton}>
            Submit Pre-Intake
          </button>
          {formSent && (
            <p className={styles.successfulText}>
              Pre-intake sent successfully
            </p>
          )}
        </Form>
      )}
    </Formik>
  );
}
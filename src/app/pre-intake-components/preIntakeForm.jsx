"use client";
import React from "react";
import styles from "../pre-intake/preIntake.module.css";
import { Formik, Form} from "formik";
import "bootstrap/dist/css/bootstrap.min.css";

// Imports which are utilized inside the <Formik>
import preIntakeInitialValues from "./preIntakeInitialValues";
import PreIntakeInputValidation from "./PreIntakeInputValidation";
import PreIntakeFormSubmit from "./PreIntakeFormSubmit";

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
      {({ values, setFieldValue, errors, touched }) => (
        <Form className={styles.form}>
          <div className={styles.titleContainer}>
            <h2 className={styles.centeredTitle}>PRE-INTAKE FORM</h2>
          </div>
          <hr className="separator-line" />
          
          {/* General Information Section */}
          <PreIntakeGeneralInfo
            values={values}
            setFieldValue={setFieldValue}
            errors={errors}
            touched={touched}
          />

          {/* About You Section */}
          <PreIntakeAboutYou
            values={values}
            setFieldValue={setFieldValue}
            errors={errors}
            touched={touched}
          />

          {/* About Your Children Section */}
          <PreIntakeAboutYourChildren
            values={values}
            setFieldValue={setFieldValue}
            errors={errors}
            touched={touched}
          />
          
          {/* Other Questions Section*/}
          <PreIntakeOtherQuestions
            values={values}
            setFieldValue={setFieldValue}
            errors={errors}
            touched={touched}
            validateRadio={validateRadio}
          />

          {/* Staff Only Section */}
          <PreIntakeStaffOnly
            values={values}
            setFieldValue={setFieldValue}
            errors={errors}
            touched={touched}
          />

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
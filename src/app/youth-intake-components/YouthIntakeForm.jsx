"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../youth-intake/youthIntake.module.css";
import { Formik, Form } from "formik";
import "bootstrap/dist/css/bootstrap.min.css";
import * as Yup from "yup";
import { useUser } from "@clerk/clerk-react";

import youthIntakeInputValidation from "./utils/youthIntakeInputValidation";

// Form Sections
import YouthIntakeOtherInformation from "./form-sections/YouthIntakeOtherInformation";
import YouthIntakeFinancialInfo from "./form-sections/YouthIntakeFinancialInfo";
import YouthIntakeEducation from "./form-sections/YouthIntakeEducation";
import YouthIntakePeopleAtHome from "./form-sections/YouthIntakePeopleAtHome";
import YouthIntakeHousingSituation from "./form-sections/YouthIntakeHousingSituation";
import YouthIntakeBiologicalParentInfo from "./form-sections/YouthIntakeBiologicalParentInfo";
import YouthIntakeAgencyInfo from "./form-sections/YouthIntakeAgencyInfo";
import YouthIntakeEmergencyContact from "./form-sections/YouthIntakeEmergencyContact";
import YouthIntakeGeneralInfo from "./form-sections/YouthIntakeGeneralInfo";

// Utils
import YouthIntakeFetchClientData from "./utils/YouthIntakeFetchClientData";
import YouthIntakeFormSubmit from "./utils/YouthIntakeFormSubmit";
import youthIntakeDefaultValues from "./utils/youthIntakeDefaultValues";

const validationSchema = Yup.object({
  homeMembers: Yup.array().of(
    Yup.object({
      email: Yup.string().email("Please enter a valid email address"),
    })
  ),
  educationalPersons: Yup.array().of(
    Yup.object({
      email: Yup.string().email("Please enter a valid email address"),
    })
  ),
});

function YouthIntakeForm({ editClientId, isEditMode, isViewOnly = false }) {
  const { user } = useUser();
  const router = useRouter();
  const [formSent, setFormSent] = useState(false);
  const { initialValues, isLoading } = YouthIntakeFetchClientData(
    youthIntakeDefaultValues,
    isEditMode,
    editClientId
  );

  useEffect(() => {
    if (!isViewOnly) return;
    if (isLoading) return;

    const t = setTimeout(() => {
      const form = document.querySelector("form");
      if (!form) return;

      const inputs = form.querySelectorAll("input, textarea, select, button");
      inputs.forEach((el) => {
        const tag = el.tagName.toLowerCase();
        if (tag === "button" || tag === "select") {
          el.disabled = true;
          return;
        }
        if (tag === "textarea") {
          el.readOnly = true;
          return;
        }
        if (tag === "input") {
          const type = (el.getAttribute("type") || "text").toLowerCase();
          if (["checkbox", "radio", "file", "date", "time"].includes(type)) el.disabled = true;
          else el.readOnly = true;
        }
      });
    }, 0);

    return () => clearTimeout(t);
  }, [isViewOnly, isLoading]);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h3>Loading client data...</h3>
      </div>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      validationSchema={validationSchema}
      validate={youthIntakeInputValidation}
      onSubmit={(values, { resetForm }) => {
        if (isViewOnly) return;
        return YouthIntakeFormSubmit(values, { resetForm }, user, router, setFormSent, isEditMode, editClientId);
      }}
    >
      {({ values, errors, setFieldValue }) => (
        <Form className={styles.form}>
          <div className={styles.titleContainer}>
            <h2 className={styles.centeredTitle}>YOUTH INTAKE FORM</h2>
          </div>

          <hr className="separator-line" />

          <YouthIntakeGeneralInfo errors={errors} />
          <YouthIntakeEmergencyContact errors={errors} />
          <YouthIntakeAgencyInfo values={values} errors={errors} />
          <YouthIntakeBiologicalParentInfo errors={errors} />
          <YouthIntakeHousingSituation />
          <YouthIntakePeopleAtHome values={values} errors={errors} />
          <YouthIntakeEducation values={values} setFieldValue={setFieldValue} errors={errors} />
          <YouthIntakeFinancialInfo errors={errors} />
          <YouthIntakeOtherInformation values={values} />

          {!isViewOnly && (
            <>
              <button type="submit" className={styles.submitButton}>
                {isEditMode ? "Update Youth Client" : "Submit Youth Intake"}
              </button>

              {formSent && (
                <p className={styles.successfulText}>
                  {isEditMode ? "Youth client updated successfully" : "Youth Intake sent successfully"}
                </p>
              )}
            </>
          )}
        </Form>
      )}
    </Formik>
  );
}

export default YouthIntakeForm;

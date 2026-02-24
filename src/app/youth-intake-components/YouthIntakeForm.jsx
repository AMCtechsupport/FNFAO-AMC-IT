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
  const [isEditing, setIsEditing] = useState(isEditMode && !isViewOnly);
  const [formSent, setFormSent] = useState(false);
  const { initialValues, isLoading } = YouthIntakeFetchClientData(
    youthIntakeDefaultValues,
    isEditMode,
    editClientId
  );

    useEffect(() => {
    if (isViewOnly) setIsEditing(false);
  }, [isViewOnly]);

  // VIEW ONLY PATCH (white boxes + blocked cursor + remove placeholders)
  useEffect(() => {
    if (!isViewOnly) return;
    if (isLoading) return;

    const form = document.querySelector("form");
    if (!form) return;

    const focusHandlers = [];

    const apply = (el) => {
      const tag = el.tagName.toLowerCase();

      // remove placeholders if empty
      if ((tag === "input" || tag === "textarea") && !el.value) {
        el.setAttribute("placeholder", "");
      }

      // prevent caret focus
      const onFocus = () => el.blur();
      if (!el.dataset.viewonlyBound) {
        el.addEventListener("focus", onFocus);
        el.dataset.viewonlyBound = "true";
        focusHandlers.push(() => el.removeEventListener("focus", onFocus));
      }

      // keep white & show blocked cursor
      el.style.backgroundColor = "#ffffff";
      el.style.cursor = "not-allowed";
      el.style.opacity = "1";

      if (tag === "textarea") {
        el.readOnly = true;
        el.disabled = false;
        el.tabIndex = -1;
        return;
      }

      if (tag === "input") {
        const type = (el.getAttribute("type") || "text").toLowerCase();
        if (["checkbox", "radio", "file", "date", "time"].includes(type)) {
          el.disabled = true;
          el.readOnly = false;
          el.tabIndex = -1;
        } else {
          el.readOnly = true;
          el.disabled = false;
          el.tabIndex = -1;
        }
        return;
      }

      if (tag === "select") {
  el.disabled = true;
  el.tabIndex = -1;

  el.style.setProperty("background-color", "#ffffff", "important");
  el.style.setProperty("opacity", "1", "important");
  el.style.setProperty("cursor", "not-allowed", "important");

  const selectedOption = el.options?.[el.selectedIndex];
  const selectedText = (selectedOption?.textContent || "").trim();
  const selectedValue = (el.value || "").trim();

  const isEmptySelect =
    selectedValue === "" ||
    selectedValue === "0" ||
    /^select\b/i.test(selectedText);

  if (isEmptySelect) {
    el.style.setProperty("color", "transparent", "important");
    el.style.setProperty("-webkit-text-fill-color", "transparent", "important");
    el.style.setProperty("text-shadow", "0 0 0 transparent", "important");
  } else {
    el.style.setProperty("color", "#111827", "important");
    el.style.setProperty("-webkit-text-fill-color", "#111827", "important");
    el.style.setProperty("text-shadow", "none", "important");
  }

  return;
}

      if (tag === "button") {
        el.disabled = true;
        el.tabIndex = -1;
      }
    };

    const elements = form.querySelectorAll("input, textarea, select, button");
    elements.forEach(apply);

    return () => {
      focusHandlers.forEach((fn) => fn());
    };
  }, [isViewOnly, isLoading]);

  
    const submitFullWidthStyle = {
      backgroundColor: "black",
      color: "white",
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "16px",
      width: "100%",
    };

    const saveBtnStyle = {
    backgroundColor: "#7C3AED", // purple
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  };

   const cancelBtnStyle = {
    backgroundColor: "#111827", // keep black
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
  };

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
      {({ values, errors, setFieldValue, resetForm }) => (
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
              <div
                style={{
                  display: "flex",
                  justifyContent: isEditMode ? "space-between" : "flex-end",
                  alignItems: "center",
                  width: "100%",
                  maxWidth: "1000px",
                  margin: "20px auto 10px auto",
                }}
              >
                {isEditMode && (
                  <button
                    style={cancelBtnStyle}
                    onClick={() => {
                      resetForm();
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </button>

                )}

                  <button type="submit" style={isEditMode ? saveBtnStyle : submitFullWidthStyle}>
                    {isEditMode ? "Save" : "Submit Youth Intake"}
                  </button>
              </div>

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

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../youth-intake/youthIntake.module.css";
import { Formik, Form } from "formik";
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

  firstNationMembership: Yup.string() // added firt nation membership validation
    .required("First Nation Membership is required"), 

  otherFirstNation: Yup.string()
    .nullable(), // added other first nation validation only if needed
});

function YouthIntakeForm({ editClientId, isEditMode, isViewOnly = false }) {
  const { user } = useUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(isEditMode && !isViewOnly);
  const [formSent, setFormSent] = useState(false);
  const [assignedAdvocateName, setAssignedAdvocateName] = useState("—");

  const { initialValues, isLoading } = YouthIntakeFetchClientData(
    youthIntakeDefaultValues,
    isEditMode,
    editClientId
  );

  useEffect(() => {
    if (!editClientId) return;
    const fetchAssignedAdvocate = async () => {
      const res = await fetch(`/api/assigned-advocate?client_id=${editClientId}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.advocateName) {
        setAssignedAdvocateName(json.advocateName);
      }
    };
    fetchAssignedAdvocate();
  }, [editClientId]);

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

      // keep white look
      el.style.setProperty("background-color", "#ffffff", "important");
      el.style.setProperty("opacity", "1", "important");
      el.style.setProperty("cursor", "default", "important");

      if (tag === "textarea") {
        el.readOnly = true;
        el.disabled = false;
        el.tabIndex = -1;
        return;
      }

      if (tag === "input") {
        const type = (el.getAttribute("type") || "text").toLowerCase();
        if (type === "checkbox") {
          el.style.setProperty("pointer-events", "none", "important");
          el.tabIndex = -1;
        } else if (["radio", "file", "date", "time"].includes(type)) {
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
  el.style.setProperty("cursor", "default", "important");

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
        el.style.setProperty("display", "none", "important");
      }
    };

    const elements = form.querySelectorAll("input, textarea, select, button");
    elements.forEach(apply);

    return () => {
      focusHandlers.forEach((fn) => fn());
    };
  }, [isViewOnly, isLoading]);


  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">Loading client data...</div>
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
        <Form>
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Youth Intake Form</h1>
              <p className="text-sm text-gray-500 mt-1">Complete all sections and submit when ready</p>
            </div>
            {editClientId && (
              <div className="text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                <span className="font-semibold text-gray-800">Assigned to:</span> {assignedAdvocateName}
              </div>
            )}
          </div>

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
              {isEditMode ? (
                <div className="flex items-center justify-between mt-4 mb-2">
                  <button
                    type="button"
                    className="px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors text-white"
                    style={{ backgroundColor: "#6b7280" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4b5563")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#6b7280")}
                    onClick={() => { resetForm(); setIsEditing(false); }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors text-white"
                    style={{ backgroundColor: "#47315E" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3a2649")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#47315E")}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-3 text-sm font-semibold rounded-lg transition-colors text-white mb-2"
                  style={{ backgroundColor: "#8060A0" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6B4E8A")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8060A0")}
                >
                  Submit Youth Intake
                </button>
              )}

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

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useUser } from "@clerk/clerk-react";
import ValidationErrorToast from "../../../components/ValidationErrorToast";
import ToastNotification from "../../../components/ToastNotification";

import youthIntakeInputValidation from "./utils/youthIntakeInputValidation";
import ReferredBySelect from "@/components/ReferredBySelect";

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
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };
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

  // View-only patch - block fields without styling changes
  useEffect(() => {
    if (!isViewOnly) return;

    const runPatch = () => {
      const form = document.querySelector("form");
      if (!form) return;

      const applyToElement = (el) => {
        const tag = el.tagName.toLowerCase();

        if (tag === "button" && el.getAttribute("data-view-allow") !== null) return;

        if (tag === "input" && (el.getAttribute("type") || "text").toLowerCase() === "checkbox") {
          el.style.setProperty("pointer-events", "none", "important");
          return;
        }

        if (tag === "textarea") {
          el.readOnly = true;
          if (!el.value) el.placeholder = "";
          return;
        }

        if (tag === "input") {
          const type = (el.getAttribute("type") || "text").toLowerCase();
          if (["radio", "file", "date", "time"].includes(type)) {
            el.style.setProperty("pointer-events", "none", "important");
            if ((type === "date" || type === "time") && !el.value) el.type = "text";
          } else {
            el.readOnly = true;
            if (!el.value) el.placeholder = "";
          }
          return;
        }

        if (tag === "select") {
          el.style.setProperty("pointer-events", "none", "important");
          if (!el.value && el.options[el.selectedIndex]) el.options[el.selectedIndex].text = "";
          return;
        }

        if (tag === "button") {
          el.style.setProperty("display", "none", "important");
        }
      };

      const elements = form.querySelectorAll("input, textarea, select, button");
      elements.forEach(applyToElement);

      // Block label clicks (prevents triggering radio/checkbox via their labels)
      form.querySelectorAll("label").forEach((label) => {
        label.style.setProperty("pointer-events", "none", "important");
      });
    };

    runPatch();
    const timers = [
      setTimeout(runPatch, 50),
      setTimeout(runPatch, 150),
      setTimeout(runPatch, 300),
      setTimeout(runPatch, 600),
      setTimeout(runPatch, 1000),
    ];

    const onClick = () => runPatch();
    document.addEventListener("click", onClick);

    return () => {
      timers.forEach(clearTimeout);
      document.removeEventListener("click", onClick);
    };
  }, [isViewOnly]);



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
        return YouthIntakeFormSubmit(values, { resetForm }, user, router, showToast, isEditMode, editClientId);
      }}
    >
      {({ values, errors, setFieldValue, resetForm, submitCount }) => (
        <Form>
          {/* Page Header - creation form only */}
          {!isEditMode && (
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Youth Intake Form</h1>
                <p className="text-sm text-gray-500 mt-1">Complete all sections and submit when ready</p>
              </div>
              <div className="w-72">
                <ReferredBySelect name="referredBy" label="How did the client learn about FNFAO?" error={errors.referredBy} />
              </div>
            </div>
          )}

          <YouthIntakeGeneralInfo errors={errors} isEditMode={isEditMode} assignedAdvocateName={assignedAdvocateName} />
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
                    onClick={() => {
                      resetForm();
                      router.push(`/youth-clients/${editClientId}/view`); // go back to viewing page
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors text-white"
                    style={{ backgroundColor: "#6100D7" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3a2649")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#6100D7")}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="submit"
                    className="w-full text-sm font-medium py-2.5 px-4 rounded-lg transition-colors border-2 mb-2"
                    style={{ backgroundColor: "rgba(97, 0, 215, 0.02)", borderColor: "rgba(97, 0, 215, 0.3)", color: "#6100D7", transition: "all 0.3s ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#6100D7"; e.currentTarget.style.color = "#ffffff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.02)"; e.currentTarget.style.color = "#6100D7"; }}
                  >
                    Submit Youth Intake
                  </button>
                  <ValidationErrorToast showToast={showToast} message="Some required fields are incomplete. Please scroll up to check for errors." />
                </>
              )}

              <ToastNotification toast={toast} />
            </>
          )}
        </Form>
      )}
    </Formik>
  );
}

export default YouthIntakeForm;

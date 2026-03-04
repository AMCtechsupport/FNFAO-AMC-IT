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


  
    const submitFullWidthStyle = {
      backgroundColor: "#7C3AED",
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
          <fieldset disabled={isViewOnly}>
          <div className={styles.titleContainer}>
            <h2 className={styles.centeredTitle}>YOUTH INTAKE FORM</h2>
          </div>

          <hr className="separator-line" />

          {editClientId && (
            <div style={{ marginBottom: "12px" }}>
              <strong>Assigned to:</strong> {assignedAdvocateName}
            </div>
          )}
        
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
          </fieldset>
        </Form>
      )}
    </Formik>
  );
}

export default YouthIntakeForm;

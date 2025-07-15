"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../youth-intake/preIntake.module.css";
import { Formik, Form } from "formik";
import "bootstrap/dist/css/bootstrap.min.css";
import * as Yup from "yup";
import validator from "validator";
import { useUser } from "@clerk/clerk-react";
import supabase from "../lib/supabase";

import YouthIntakeInputValidation from "./YouthIntakeInputValidation";
import YouthIntakeOtherInformation from "./form-sections/YouthIntakeOtherInformation";
import YouthIntakeFinancialInfo from "./form-sections/YouthIntakeFinancialInfo";
import YouthIntakeEducation from "./form-sections/YouthIntakeEducation";
import YouthIntakePeopleAtHome from "./form-sections/YouthIntakePeopleAtHome";
import YouthIntakeHousingSituation from "./form-sections/YouthIntakeHousingSituation";
import YouthIntakeBiologicalParentInfo from "./form-sections/YouthIntakeBiologicalParentInfo";
import YouthIntakeAgencyInfo from "./form-sections/YouthIntakeAgencyInfo";
import YouthIntakeEmergencyContact from "./form-sections/YouthIntakeEmergencyContact";
import YouthIntakeGeneralInfo from "./form-sections/YouthIntakeGeneralInfo";

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

function sanitizeInput(input) {
  if (typeof input === "string") {
    return validator.escape(input.trim());
  }
  return input;
}

function sanitizeValues(values) {
  const sanitizedValues = {};
  for (let key in values) {
    sanitizedValues[key] = sanitizeInput(values[key]);
  }
  return sanitizedValues;
}

function YouthIntakeForm({ editClientId, isEditMode }) {
  const { user } = useUser();
  const router = useRouter();
  const [formSent, setFormSent] = useState(false);
  const [initialValues, setInitialValues] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    pronouns: "",
    dateOfBirth: "",
    phoneNumber: "",
    socialMedia: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    email: "",
    emergencyContactFirstName: "",
    emergencyContactLastName: "",
    emergencyContactNumber: "",
    referredBy: "",
    firstNationMembership: "",
    treatyNumber: "",
    otherFirstNation: "",
    inCare: "",
    statusCFSFile: "",
    lastFaceToFace: "",
    cfsAgency: "",
    cfsAgentFullName: "",
    cfsAgentNumber: "",
    cfsAgentEmail: "",
    onReserve: "",
    apprehendedOnReserve: "",
    transitionFromReserve: "",
    currentlyStaying: "",
    currentlyStayingDuration: "",
    peopleHome: 0,
    homeMembers: [
      {
        firstName: "",
        middleName: "",
        lastName: "",
        relationship: "",
        phoneNumber: "",
        email: "",
      },
    ],
    educationalPersons: [
      {
        firstName: "",
        middleName: "",
        lastName: "",
        relationship: "",
        phoneNumber: "",
        email: "",
      },
    ],
    inSchool: "",
    schoolAttending: "",
    currentGrade: "",
    fullStudent: "",
    schoolSchedule: "",
    birthCertificate: false,
    driversLicense: false,
    healthCard: false,
    statusCard: false,
    enhancedID: false,
    studentID: false,
    bankAccount: "",
    incomeAssistance: "",
    caseWorkerFullName: "",
    caseWorkerPhoneNumber: "",
    caseWorkerEmail: "",
    youthJustice: "",
    custodySupportSpecified: "",
    accessElder: "",
    speakingOffice: "",
    youthWorkshops: "",
    disabilities: "",
    disabilitiesExplained: "",
    careExperience: "",
    kindSupport: "",
    personalGoals: "",
    additionalInformation: "",
    motherNation: "",
    accessElderExplained: "",
    connectedCommunity: "",
    connectedCommunityExplained: "",
    motherFirstName: "",
    motherMiddleName: "",
    motherLastName: "",
    fatherFirstName: "",
    fatherMiddleName: "",
    fatherLastName: "",
    fatherNation: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing client data when in edit mode
  useEffect(() => {
    const fetchClientData = async () => {
      if (!isEditMode || !editClientId) return;

      try {
        setIsLoading(true);
        
        // Fetch main client data
        const { data: clientData, error: clientError } = await supabase
          .from("Clients")
          .select("*")
          .eq("client_id", editClientId)
          .single();

        if (clientError) {
          console.error("Error fetching client data:", clientError);
          alert("Error loading client data. Please try again.");
          return;
        }

        // Fetch home members
        const { data: homeMembers, error: homeMembersError } = await supabase
          .from("Home Members")
          .select("*")
          .eq("client_id", editClientId);

        // Fetch educational persons
        const { data: educationalPersons, error: educationalError } = await supabase
          .from("Educational Support Persons")
          .select("*")
          .eq("client_id", editClientId);

        // Fetch emergency contact
        const { data: emergencyContact, error: emergencyError } = await supabase
          .from("Emergency Contacts")
          .select("*")
          .eq("client_id", editClientId)
          .single();

        // Helper function to decode HTML entities
        const decodeHtmlEntities = (text) => {
          if (!text) return "";
          const textarea = document.createElement('textarea');
          textarea.innerHTML = text;
          return textarea.value;
        };

        // Decode HTML entities for main client text fields
        const decodedClientData = {};
        for (const [key, value] of Object.entries(clientData)) {
          if (typeof value === 'string') {
            decodedClientData[key] = decodeHtmlEntities(value);
          } else {
            decodedClientData[key] = value;
          }
        }

        // Populate form with fetched data
        const populatedValues = {
          ...decodedClientData,
          // Format date for HTML date input (YYYY-MM-DD)
          dateOfBirth: clientData.dateOfBirth ? 
            new Date(clientData.dateOfBirth).toISOString().split('T')[0] : "",
          // Handle pronouns case conversion (already decoded in decodedClientData)
          pronouns: decodedClientData.pronouns ? decodedClientData.pronouns.toLowerCase() : "",
          // Map emergency contact data (decode HTML entities)
          emergencyContactFirstName: decodeHtmlEntities(emergencyContact?.firstName) || "",
          emergencyContactLastName: decodeHtmlEntities(emergencyContact?.lastName) || "",
          emergencyContactNumber: decodeHtmlEntities(emergencyContact?.phoneNumber) || "",
          // Handle home members (ensure at least one empty entry if none exist)
          homeMembers: homeMembers && homeMembers.length > 0 
            ? homeMembers.map(member => ({
                firstName: member.firstName || "",
                middleName: member.middleName || "",
                lastName: member.lastName || "",
                relationship: member.relationship || "",
                phoneNumber: member.phoneNumber || "",
                email: member.email || "",
              }))
            : [{
                firstName: "",
                middleName: "",
                lastName: "",
                relationship: "",
                phoneNumber: "",
                email: "",
              }],
          // Handle educational persons (ensure at least one empty entry if none exist)
          educationalPersons: educationalPersons && educationalPersons.length > 0
            ? educationalPersons.map(person => ({
                firstName: person.firstName || "",
                middleName: person.middleName || "",
                lastName: person.lastName || "",
                relationship: person.relationship || "",
                phoneNumber: person.phoneNumber || "",
                email: person.email || "",
              }))
            : [{
                firstName: "",
                middleName: "",
                lastName: "",
                relationship: "",
                phoneNumber: "",
                email: "",
              }],
          // Convert boolean fields to proper formats
          // Checkbox fields (keep as boolean)
          birthCertificate: clientData.birthCertificate || false,
          driversLicense: clientData.driversLicense || false,
          healthCard: clientData.healthCard || false,
          statusCard: clientData.statusCard || false,
          enhancedID: clientData.enhancedID || false,
          studentID: clientData.studentID || false,
          // Radio button fields (convert boolean to "yes"/"no" strings)
          inCare: clientData.inCare ? "yes" : (clientData.inCare === false ? "no" : ""),
          onReserve: clientData.onReserve ? "yes" : (clientData.onReserve === false ? "no" : ""),
          apprehendedOnReserve: clientData.apprehendedOnReserve ? "yes" : (clientData.apprehendedOnReserve === false ? "no" : ""),
          transitionFromReserve: clientData.transitionFromReserve ? "yes" : (clientData.transitionFromReserve === false ? "no" : ""),
          inSchool: clientData.inSchool ? "yes" : (clientData.inSchool === false ? "no" : ""),
          fullStudent: clientData.fullStudent ? "yes" : (clientData.fullStudent === false ? "no" : ""),
          bankAccount: clientData.bankAccount ? "yes" : (clientData.bankAccount === false ? "no" : ""),
          incomeAssistance: clientData.incomeAssistance ? "yes" : (clientData.incomeAssistance === false ? "no" : ""),
          youthJustice: clientData.youthJustice ? "yes" : (clientData.youthJustice === false ? "no" : ""),
          accessElder: clientData.accessElder ? "yes" : (clientData.accessElder === false ? "no" : ""),
          speakingOffice: clientData.speakingOffice ? "yes" : (clientData.speakingOffice === false ? "no" : ""),
          youthWorkshops: clientData.youthWorkshops ? "yes" : (clientData.youthWorkshops === false ? "no" : ""),
          disabilities: clientData.disabilities ? "yes" : (clientData.disabilities === false ? "no" : ""),
          connectedCommunity: clientData.connectedCommunity ? "yes" : (clientData.connectedCommunity === false ? "no" : ""),
        };

        setInitialValues(populatedValues);
      } catch (error) {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [isEditMode, editClientId]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h3>Loading client data...</h3>
      </div>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      validationSchema={validationSchema}
      validate={YouthIntakeInputValidation}
      onSubmit={async (values, { resetForm }) => {
        try {
          const sanitizedValues = sanitizeValues(values);

          const convertedValues = {};

          // Define which fields are radio buttons that need special handling
          const radioBooleanFields = [
            'inCare', 'onReserve', 'apprehendedOnReserve', 'transitionFromReserve',
            'inSchool', 'fullStudent', 'bankAccount', 'incomeAssistance',
            'youthJustice', 'accessElder', 'speakingOffice', 'youthWorkshops',
            'disabilities', 'connectedCommunity'
          ];

          // Loop through all fields in the 'values' object
          // to convert them from "yes/no" to true/false
          for (let key in sanitizedValues) {
            if (sanitizedValues[key] === "yes") {
              convertedValues[key] = true;
            } else if (sanitizedValues[key] === "no") {
              convertedValues[key] = false;
            } else if (radioBooleanFields.includes(key) && sanitizedValues[key] === "") {
              // Convert empty strings to null for radio button fields
              convertedValues[key] = null;
            } else {
              convertedValues[key] = sanitizedValues[key];
            }
          }

          // Debug: Log converted values to verify conversion
          console.log("🔍 DEBUG - Converted values for database:", convertedValues);

          // Get the current date in ISO 8601 format
          const currentDate = new Date().toISOString();

          // Extract children, emergencyContact, homeMembers, educationalPersons
          const {
            emergencyContactFirstName,
            emergencyContactLastName,
            emergencyContactNumber,
            homeMembers,
            educationalPersons,
            ...clientData
          } = convertedValues;

          let clientId;

          if (isEditMode && editClientId) {
            // UPDATE existing client
            clientData.dateModified = currentDate;

            const { error: clientError } = await supabase
              .from("Clients")
              .update(clientData)
              .eq("client_id", editClientId);

            if (clientError) {
              console.error("❌ Error updating client:");
              console.error("Message:", clientError.message || "No message");
              console.error("Details:", clientError.details || "No details");
              console.error("Code:", clientError.code || "No code");
              throw clientError;
            }

            clientId = editClientId;

            // Delete existing related data before inserting new ones
            await supabase.from("Home Members").delete().eq("client_id", clientId);
            await supabase.from("Educational Support Persons").delete().eq("client_id", clientId);
            await supabase.from("Emergency Contacts").delete().eq("client_id", clientId);

          } else {
            // CREATE new client
            clientData.createdAt = currentDate;
            clientData.dateModified = currentDate;
            clientData.clientType = "Youth Intake";

            // Debug: Log final client data being sent to database
            console.log("🔍 DEBUG - Final clientData for database:", clientData);

            const { data: client, error: clientError } = await supabase
              .from("Clients")
              .insert([
                {
                  ...clientData,
                  createdBy: user.id,
                },
              ])
              .select();

            if (clientError) {
              console.error("❌ Error inserting client:");
              console.error("Message:", clientError.message || "No message");
              console.error("Details:", clientError.details || "No details");
              console.error("Code:", clientError.code || "No code");
              throw clientError;
            }

            clientId = client[0]?.client_id;
            if (!clientId) throw new Error("Failed to retrieve client ID.");
          }

          // If there are homeMembers, insert them into the 'Home Members' table
          if (homeMembers && homeMembers.length > 0) {
            const homeMembersData = homeMembers
              .filter((member) => member.firstName || member.lastName)
              .map((homeMember) => {
                const {
                  firstName,
                  middleName,
                  lastName,
                  relationship,
                  phoneNumber,
                  email,
                } = homeMember;
                return {
                  firstName,
                  middleName,
                  lastName,
                  relationship,
                  phoneNumber,
                  email,
                  client_id: clientId, // Associate each home member with the client
                };
              });

            if (homeMembersData.length > 0) {
              const { error: homeMemberError } = await supabase
                .from("Home Members")
                .insert(homeMembersData);

              if (homeMemberError) {
                console.error("Error inserting home members:", homeMemberError);
                throw homeMemberError;
              }

              // console.log("Home Members inserted successfully:", homeMembersData);
            }
          }

          // For Educational Support Persons
          if (educationalPersons && educationalPersons.length > 0) {
            const educationalPersonsData = educationalPersons
              .filter((person) => person.firstName || person.lastName)
              .map((educationalPerson) => {
                const {
                  firstName,
                  middleName,
                  lastName,
                  relationship,
                  phoneNumber,
                  email,
                } = educationalPerson;
                return {
                  firstName,
                  middleName,
                  lastName,
                  relationship,
                  phoneNumber,
                  email,
                  client_id: clientId,
                };
              });

            if (educationalPersonsData.length > 0) {
              const { error: educationalPersonsError } = await supabase
                .from("Educational Support Persons")
                .insert(educationalPersonsData);

              if (educationalPersonsError) {
                console.error(
                  "Error inserting educational support person:",
                  educationalPersonsError
                );
                throw educationalPersonsError;
              }

              // console.log(
              //   "Educational support persons inserted successfully:",
              //   educationalPersonsData
              // );
            }
          }

          // Insert emergency contact into the 'Emergency Contacts' table
          if (
            emergencyContactFirstName &&
            emergencyContactLastName &&
            emergencyContactNumber
          ) {
            const emergencyContactData = {
              firstName: emergencyContactFirstName,
              lastName: emergencyContactLastName,
              phoneNumber: emergencyContactNumber,
              note: "",
              client_id: clientId, // Associate emergency contact with the client
            };

            const { error: emergencyContactError } = await supabase
              .from("Emergency Contacts")
              .insert([emergencyContactData]);

            if (emergencyContactError) {
              console.error("❌ Error inserting emergency contact:");
              console.error(
                "Message:",
                emergencyContactError.message || "No message"
              );
              console.error(
                "Details:",
                emergencyContactError.details || "No details"
              );
              console.error("Code:", emergencyContactError.code || "No code");
              throw emergencyContactError;
            }

            // console.log(
            //   "✅ Emergency contact inserted successfully:",
            //   emergencyContactData
            // );
          }

          // Reset form and show success message
          setFormSent(true);
          
          // Reset initialValues back to empty state
          setInitialValues({
            firstName: "",
            middleName: "",
            lastName: "",
            pronouns: "",
            dateOfBirth: "",
            phoneNumber: "",
            socialMedia: "",
            address: "",
            city: "",
            province: "",
            postalCode: "",
            email: "",
            emergencyContactFirstName: "",
            emergencyContactLastName: "",
            emergencyContactNumber: "",
            referredBy: "",
            firstNationMembership: "",
            treatyNumber: "",
            otherFirstNation: "",
            inCare: "",
            statusCFSFile: "",
            lastFaceToFace: "",
            cfsAgency: "",
            cfsAgentFullName: "",
            cfsAgentNumber: "",
            cfsAgentEmail: "",
            onReserve: "",
            apprehendedOnReserve: "",
            transitionFromReserve: "",
            currentlyStaying: "",
            currentlyStayingDuration: "",
            peopleHome: 0,
            homeMembers: [
              {
                firstName: "",
                middleName: "",
                lastName: "",
                relationship: "",
                phoneNumber: "",
                email: "",
              },
            ],
            educationalPersons: [
              {
                firstName: "",
                middleName: "",
                lastName: "",
                relationship: "",
                phoneNumber: "",
                email: "",
              },
            ],
            inSchool: "",
            schoolAttending: "",
            currentGrade: "",
            fullStudent: "",
            schoolSchedule: "",
            birthCertificate: false,
            driversLicense: false,
            healthCard: false,
            statusCard: false,
            enhancedID: false,
            studentID: false,
            bankAccount: "",
            incomeAssistance: "",
            caseWorkerFullName: "",
            caseWorkerPhoneNumber: "",
            caseWorkerEmail: "",
            youthJustice: "",
            custodySupportSpecified: "",
            accessElder: "",
            speakingOffice: "",
            youthWorkshops: "",
            disabilities: "",
            disabilitiesExplained: "",
            careExperience: "",
            kindSupport: "",
            personalGoals: "",
            additionalInformation: "",
            motherNation: "",
            accessElderExplained: "",
            connectedCommunity: "",
            connectedCommunityExplained: "",
            motherFirstName: "",
            motherMiddleName: "",
            motherLastName: "",
            fatherFirstName: "",
            fatherMiddleName: "",
            fatherLastName: "",
            fatherNation: "",
          });
          
          resetForm();
          
          // Handle post-submission behavior
          if (isEditMode) {
            // For edit mode, redirect to client list after successful update
            setTimeout(() => {
              router.push('/clients');
            }, 1500);
          } else {
            // For new submissions, show success message temporarily
            setTimeout(() => setFormSent(false), 3000);
          }
        } catch (error) {
          console.error("General error:", error);
        }
      }}
    >
      {({ values, errors, setFieldValue }) => (
        <Form className={styles.form}>
          <div className={styles.titleContainer}>
            <h2 className={styles.centeredTitle}>YOUTH INTAKE FORM</h2>
          </div>
          <hr className="separator-line" />

          <YouthIntakeGeneralInfo
            errors={errors}
          />

          <YouthIntakeEmergencyContact
            errors={errors}
          />

          <YouthIntakeAgencyInfo
            values={values}
            errors={errors}
          />

          <YouthIntakeBiologicalParentInfo
            errors={errors} 
          />

          <YouthIntakeHousingSituation />

          <YouthIntakePeopleAtHome
            values={values}
            errors={errors}
          />

          <YouthIntakeEducation
            values={values}
            setFieldValue={setFieldValue}
            errors={errors}
          />

          <YouthIntakeFinancialInfo
            errors={errors}
          />

          <YouthIntakeOtherInformation
            values={values}
          />

          <button type="submit" className={styles.submitButton}>
            {isEditMode ? "Update Youth Client" : "Submit Youth Intake"}
          </button>
          {formSent && (
            <p className={styles.successfulText}>
              {isEditMode ? "Youth client updated successfully" : "Youth Intake sent successfully"}
            </p>
          )}
        </Form>
      )}
    </Formik>
  );
}

export default YouthIntakeForm;
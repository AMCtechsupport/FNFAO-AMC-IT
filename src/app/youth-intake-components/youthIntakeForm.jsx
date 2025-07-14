"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../pre-intake/preIntake.module.css";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import { Button, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import * as Yup from "yup";
import validator from "validator";

import ValidNameInput from "@/components/ValidNameInput";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";
import ReferredBySelect from "@/components/ReferredBySelect";
import ProvincesSelect from "@/components/ProvincesSelect";
import PronounSelect from "@/components/Pronouns";
import StatusCFSFileSelect from "@/components/StatusCFSFileSelect";
import FirstNationSelect from "@/components/FirstNationSelect";
import ManageCfsAgencies from "@/components/ManageCfsAgencies";
import EmailInput from "@/components/ValidEmailInput";

import { useUser } from "@clerk/clerk-react";
import supabase from "../lib/supabase";

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

function validatePhoneNumber(value) {
  const phoneNumberPattern = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (value && !phoneNumberPattern.test(value)) {
    return "Invalid phone number format";
  }
  return undefined;
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
      validate={(values) => {
        let errors = {};

        if (!values.firstName) {
          errors.firstName = "Please enter a name";
        } else if (!/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.firstName)) {
          errors.firstName = "The name can only contain letters and spaces";
        }

        if (
          values.middleName &&
          !/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.middleName)
        ) {
          errors.middleName =
            "The middle name can only contain letters and spaces";
        }

        if (!values.lastName) {
          errors.lastName = "Please enter a last name";
        } else if (!/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.lastName)) {
          errors.lastName = "The last name can only contain letters and spaces";
        }

        if (!values.dateOfBirth) {
          errors.dateOfBirth = "Please select a birth date";
        } else {
          const birthDate = new Date(values.dateOfBirth);
          const today = new Date();
          const minDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
          const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

          // Verify that the date of birth is not in the future
          if (birthDate > today) {
            errors.dateOfBirth = "Birth date cannot be in the future";
          }

          // Age validation - must be between 0 and 20 years old
          if (birthDate > maxDate) {
            errors.dateOfBirth = "Birth date cannot be in the future";
          } else if (birthDate < minDate) {
            errors.dateOfBirth = "Youth must be between 0 and 20 years old";
          }

          // Month validation
          const birthMonth = birthDate.getMonth() + 1;
          if (birthMonth < 1 || birthMonth > 12) {
            errors.dateOfBirth = "Birth month must be between 01 and 12";
          }

          // Day validation
          const birthDay = birthDate.getDate();
          if (birthDay < 1 || birthDay > 31) {
            errors.dateOfBirth = "Birth day must be between 01 and 31";
          }
        }

        const addressRegex = /^[a-zA-Z0-9\s,.-]*$/;
        if (!addressRegex.test(values.address)) {
          errors.address = "The address contains invalid characters";
        }

        if (values.city && !/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.city)) {
          errors.city = "The city can only contain letters and spaces";
        }

        if (
          values.postalCode &&
          !/^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(values.postalCode)
        ) {
          errors.postalCode = "Invalid postal code format (e.g., A1A 1A1)";
        }

        if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
          errors.email = "Invalid email format";
        }

        if (
          values.cfsAgentEmail &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.cfsAgentEmail)
        ) {
          errors.cfsAgentEmail = "Invalid email format";
        }

        if (
          values.caseWorkerEmail &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.caseWorkerEmail)
        ) {
          errors.caseWorkerEmail = "Invalid email format";
        }

        if (
          values.emergencyContactFirstName &&
          !/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.emergencyContactFirstName)
        ) {
          errors.emergencyContactFirstName =
            "The emergency contact name can only contain letters and spaces";
        }

        if (
          values.emergencyContactLastName &&
          !/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.emergencyContactLastName)
        ) {
          errors.emergencyContactLastName =
            "The emergency contact last name can only contain letters and spaces";
        }

        if (values.peopleHome && !/^\d+$/.test(values.peopleHome)) {
          errors.peopleHome =
            "The number of people at home must contain only digits";
        }

        const phoneNumberError = validatePhoneNumber(values.phoneNumber);
        if (phoneNumberError) {
          errors.phoneNumber = phoneNumberError;
        }

        const emergencyContactNumberError = validatePhoneNumber(
          values.emergencyContactNumber
        );
        if (emergencyContactNumberError) {
          errors.emergencyContactNumber = emergencyContactNumberError;
        }

        const cfsAgentNumberError = validatePhoneNumber(values.cfsAgentNumber);
        if (cfsAgentNumberError) {
          errors.cfsAgentNumber = cfsAgentNumberError;
        }

        const caseWorkerPhoneNumberError = validatePhoneNumber(
          values.caseWorkerPhoneNumber
        );
        if (caseWorkerPhoneNumberError) {
          errors.caseWorkerPhoneNumber = caseWorkerPhoneNumberError;
        }

        // Treaty Number validation - must be exactly 9 digits
        if (
          values.treatyNumber &&
          !/^\d{9}$/.test(values.treatyNumber)
        ) {
          errors.treatyNumber = "Treaty number must be exactly 9 digits";
        }

        return errors;
      }}
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
          <Row>
            <Col md={8} />
            <Col md={4}>
              <ReferredBySelect
                name="referredBy"
                label="How did the client learn about FNFAO?"
                error={errors.referredBy}
              />
            </Col>
          </Row>
          <h3 className="text-dark">General Information</h3>
          <Row>
            <Col md={3}>
              <InputField
                name="firstName"
                label="First Name: *"
                placeholder="John"
                error={errors.firstName}
              />
            </Col>

            <Col md={3}>
              <InputField
                name="middleName"
                label="Middle Name:"
                error={errors.middleName}
              />
            </Col>
            <Col md={3}>
              <InputField
                name="lastName"
                label="Last Name: *"
                placeholder="Connor"
                error={errors.lastName}
              />
            </Col>

            <Col md={3}>
              <PronounSelect
                name="pronouns"
                label="Preferred Pronouns:"
                error={errors.pronouns}
              />
            </Col>

            <Col md={3}>
              <div>
                <label htmlFor="dateOfBirth">Birth Date: *</label>
                <Field type="date" id="dateOfBirth" name="dateOfBirth" />
                <ErrorMessage
                  name="dateOfBirth"
                  component={() => (
                    <p className={styles.errorText}>{errors.dateOfBirth}</p>
                  )}
                />
              </div>
            </Col>
          </Row>

          <Row>
            <Col md={3}>
              <InputField
                name="address"
                label="Address:"
                placeholder="161 Main St, Unit 230"
                error={errors.address}
              />
            </Col>

            <Col md={3}>
              <InputField
                name="city"
                label="City:"
                placeholder="Winnipeg"
                error={errors.city}
              />
            </Col>

            <Col md={4}>
              <ProvincesSelect
                name="province"
                label="Province:"
                error={errors.province}
              />
            </Col>

            <Col md={2}>
              <InputField
                name="postalCode"
                label="Postal code:"
                placeholder="R3C 0V8"
                error={errors.postalCode}
              />
            </Col>
          </Row>

          <Row>
            <Col md={3}>
              <Field
                name="phoneNumber"
                label="Phone Number:"
                component={PhoneNumberInput}
                placeholder="(123) 456-7890"
              />
            </Col>

            <Col md={3}>
              <div>
                <label htmlFor="socialMedia">Social Media Contact:</label>
                <Field type="text" id="socialMedia" name="socialMedia" />
              </div>
            </Col>

            <Col md={4}>
              <div>
                <label htmlFor="email">Email:</label>
                <Field type="email" id="email" name="email" />
                <ErrorMessage
                  name="email"
                  component={() => (
                    <p className={styles.errorText}>{errors.email}</p>
                  )}
                />
              </div>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Field
                name="firstNationMembership"
                component={FirstNationSelect}
                label="First Nation Membership"
                error={errors.firstNationMembership}
              />
            </Col>

            <Col md={4}>
              <InputField
                name="treatyNumber"
                label="Treaty Number:"
                placeholder=""
                error={errors.treatyNumber}
                maxLength={9}
              />
            </Col>
            <Col md={4}>
              <Field
                name="otherFirstNation"
                component={FirstNationSelect}
                label="Other First Nation Membership"
                error={errors.otherFirstNation}
              />
            </Col>
          </Row>
          <hr className="separator-line" />
          <Row className={styles.group}>
            <h6>Emergency Contact</h6>
            <Col>
              <InputField
                name="emergencyContactFirstName"
                label="First Name:"
                placeholder=""
                error={errors.emergencyContactFirstName}
              />
            </Col>

            <Col>
              <InputField
                name="emergencyContactLastName"
                label="Last Name:"
                placeholder=""
                error={errors.emergencyContactLastName}
              />
            </Col>

            <Col>
              <div>
                <Field
                  name="emergencyContactNumber"
                  label="Emergency Contact Number:"
                  component={PhoneNumberInput}
                  placeholder="(123) 456-7890"
                />
              </div>
            </Col>
          </Row>

          {/* Agency information */}
          <div className={styles.group}>
            <h3 className="text-dark">Agency Information</h3>

            <Row className={styles.group}>
              <Col md={3}>
                <div>
                  <label>Are you currently in care?</label>
                  <div className="form-check form-check-inline">
                    <Field
                      className="form-check-input"
                      type="radio"
                      name="inCare"
                      value="yes"
                    />
                    <label className="form-check-label">Yes</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <Field
                      className="form-check-input"
                      type="radio"
                      name="inCare"
                      value="no"
                    />
                    <label className="form-check-label">No</label>
                  </div>
                </div>
              </Col>
              {values.inCare === "yes" && (
                <Col md={8}>
                  <Field
                    name="statusCFSFile"
                    component={StatusCFSFileSelect}
                    label="CFS File Status"
                    error={errors.statusCFSFile}
                  />
                </Col>
              )}
            </Row>

            <Row>
              <Col>
                <label>
                  When is the last time you had a face-to-face with your Agency
                  Worker?
                </label>
                <Field
                  as="textarea"
                  name="lastFaceToFace"
                  className={styles.textarea}
                />
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Field
                  name="cfsAgency"
                  component={ManageCfsAgencies}
                  label="CFS Agency"
                  error={errors.cfsAgency}
                />
                {/* <ManageCfsAgencies
                  name="cfsAgency"
                  value={values.cfsAgency}
                  setFieldValue={setFieldValue}
                  label="CFS Agency"
                  error={errors.cfsAgency}
                /> */}
              </Col>

              <Col md={4}>
                <div>
                  <label htmlFor="cfsAgentFullName">CFS Agent Full Name:</label>
                  <Field
                    id="cfsAgentFullName"
                    name="cfsAgentFullName"
                    component={ValidNameInput}
                    placeholder="Agent Name"
                  />
                </div>
              </Col>

              <Col md={4}>
                <Field
                  name="cfsAgentNumber"
                  label="CFS Agent Number:"
                  component={PhoneNumberInput}
                  placeholder="(123) 456-7890"
                />
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <div>
                  <label htmlFor="cfsAgentEmail">Email:</label>
                  <Field type="email" id="cfsAgentEmail" name="cfsAgentEmail" />
                  <ErrorMessage
                    name="cfsAgentEmail"
                    component={() => (
                      <p className={styles.errorText}>{errors.cfsAgentEmail}</p>
                    )}
                  />
                </div>
              </Col>
            </Row>
          </div>

          <div className={styles.group}>
            <h3 className="text-dark">Biological Parent's Information: </h3>
            <Row>
              <Col md={4}>
                <div>
                  <label htmlFor="motherFirstName">Mother's First Name:</label>
                  <Field
                    id="motherFirstName"
                    name="motherFirstName"
                    component={ValidNameInput}
                    placeholder="Mary"
                  />
                </div>
              </Col>

              <Col md={4}>
                <div>
                  <label htmlFor="motherMiddleName">
                    Mother's Middle Name:
                  </label>
                  <Field
                    id="motherMiddleName"
                    name="motherMiddleName"
                    component={ValidNameInput}
                  />
                </div>
              </Col>

              <Col md={4}>
                <div>
                  <label htmlFor="motherLastName">Mother's Last Name:</label>
                  <Field
                    id="motherLastName"
                    name="motherLastName"
                    component={ValidNameInput}
                  />
                </div>
              </Col>
              <Col md={4}>
                <Field
                  name="motherNation"
                  component={FirstNationSelect}
                  label="Mother's First Nation Membership"
                  error={errors.motherNation}
                />
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <div>
                  <label htmlFor="fatherFirstName">Father's First Name:</label>
                  <Field
                    id="fatherFirstName"
                    name="fatherFirstName"
                    component={ValidNameInput}
                    placeholder="Jones"
                  />
                </div>
              </Col>

              <Col md={4}>
                <div>
                  <label htmlFor="fatherMiddleName">
                    Father's Middle Name:
                  </label>
                  <Field
                    id="fatherMiddleName"
                    name="fatherMiddleName"
                    component={ValidNameInput}
                  />
                </div>
              </Col>

              <Col md={4}>
                <div>
                  <label htmlFor="fatherLastName">Father's Last Name:</label>
                  <Field
                    id="fatherLastName"
                    name="fatherLastName"
                    component={ValidNameInput}
                  />
                </div>
              </Col>
              <Col md={4}>
                <Field
                  name="fatherNation"
                  component={FirstNationSelect}
                  label="Father's First Nation Membership"
                  error={errors.fatherNation}
                />
              </Col>
            </Row>
          </div>

          <Row>
            <h3 className="text-dark">Housing Situation: </h3>
          </Row>
          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>Are you living on or off reserve?  </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="onReserve"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="onReserve"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="onReserve"
                  component="div"
                  className={styles.onReserve}
                />
              </div>
            </Col>
            <Col md={4}>
              <div>
                <label>Were you apprehended on or off reserve?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="apprehendedOnReserve"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="apprehendedOnReserve"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div>
                <label>
                  Have you transitioned from a reserve to the city recently?
                </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="transitionFromReserve"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="transitionFromReserve"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="transitionFromReserve"
                  component="div"
                  className={styles.transitionFromReserve}
                />
              </div>
            </Col>
          </Row>

          <Row>
            <Col>
              <label>Where are you currently staying?</label>
              <Field
                as="textarea"
                name="currentlyStaying"
                className={styles.textarea}
              />
            </Col>
            <Col>
              <label>How long have you been staying there?</label>
              <Field
                as="textarea"
                name="currentlyStayingDuration"
                className={styles.textarea}
              />
            </Col>
            <Row>
              <Col md={2}>
                <label>Number of People who live at home:</label>
                <Field as="textarea" name="peopleHome" />
                <ErrorMessage name="peopleHome">
                  {(msg) => <div style={{ color: "red" }}>{msg}</div>}
                </ErrorMessage>
              </Col>
            </Row>

            <div className={styles.group}>
              <h3 className="text-dark">People at Home</h3>
              <FieldArray name="homeMembers">
                {({ push, remove }) => (
                  <div>
                    {values.homeMembers.map((homeMember, index) => (
                      <div
                        key={index}
                        className={`${styles.bglightgrey} border rounded p-2 mb-3`}
                      >
                        <Row className="align-items-center">
                          <Col md={3}>
                            <div>
                              <label htmlFor={`homeMembers.${index}.firstName`}>
                                First Name:
                              </label>
                              <Field
                                id={`homeMembers.${index}.firstName`}
                                name={`homeMembers.${index}.firstName`}
                                component={ValidNameInput}
                              />
                            </div>
                          </Col>

                          <Col md={3}>
                            <div>
                              <label
                                htmlFor={`homeMembers.${index}.middleName`}
                              >
                                Middle Name:
                              </label>
                              <Field
                                id={`homeMembers.${index}.middleName`}
                                name={`homeMembers.${index}.middleName`}
                                component={ValidNameInput}
                              />
                            </div>
                          </Col>
                          <Col md={4}>
                            <div>
                              <label htmlFor={`homeMembers.${index}.lastName`}>
                                Last Name:
                              </label>
                              <Field
                                id={`homeMembers.${index}.lastName`}
                                name={`homeMembers.${index}.lastName`}
                                component={ValidNameInput}
                              />
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={4}>
                            <div>
                              <label
                                htmlFor={`homeMembers.${index}.relationship`}
                              >
                                Relationship:
                              </label>
                              <Field
                                id={`homeMembers.${index}.relationship`}
                                name={`homeMembers.${index}.relationship`}
                                component={ValidNameInput}
                              />
                            </div>
                          </Col>
                          <Col md={3}>
                            <Field
                              name={`homeMembers.${index}.phoneNumber`}
                              label="Phone Number:"
                              component={PhoneNumberInput}
                              placeholder="(123) 456-7890"
                              error={errors.homeMembers?.[index]?.phoneNumber}
                            />
                          </Col>
                          <Col md={3}>
                            <Field
                              name={`homeMembers.${index}.email`}
                              label="Email Address:"
                              component={EmailInput}
                              placeholder="youremail@example.com"
                            />
                          </Col>
                        </Row>
                        <Row>
                          <Col md={9}></Col>
                          <Col md={3} className="d-flex align-items-end mt-2">
                            <Button
                              className="w-100 btn btn-danger"
                              type="button"
                              onClick={() => remove(index)}
                            >
                              Delete
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    ))}
                    <Button
                      className="btn-dark"
                      type="button"
                      onClick={() =>
                        push({
                          firstName: "",
                          middleName: "",
                          lastName: "",
                          relationship: "",
                          phoneNumber: "",
                          email: "",
                        })
                      }
                    >
                      + Add Home Member
                    </Button>
                  </div>
                )}
              </FieldArray>
            </div>
          </Row>

          {/* Education */}
          <Row>
            <h3 className="text-dark">Education:</h3>
          </Row>
          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>
                  Are you currently in school? Or any other program?
                </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="inSchool"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="inSchool"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>
            </Col>

            {values.inSchool === "yes" && (
              <Col md={8}>
                <label>What school or program are you attending?</label>
                <Field
                  as="textarea"
                  name="schoolAttending"
                  className={styles.textarea}
                />
                <label>What grade are you currently in?</label>
                <Field
                  as="textarea"
                  name="currentGrade"
                  className={styles.textarea}
                />

                <div>
                  <label>
                    Are you a full-time student or a part-time student?
                  </label>
                  <div className="form-check form-check-inline">
                    <Field
                      className="form-check-input"
                      type="radio"
                      name="fullStudent"
                      value="yes"
                    />
                    <label className="form-check-label">F/T</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <Field
                      className="form-check-input"
                      type="radio"
                      name="fullStudent"
                      value="no"
                    />
                    <label className="form-check-label">P/T</label>
                  </div>
                </div>

                {values.fullStudent === "no" && (
                  <div>
                    <label>
                      What days of the week, and/or number of hours do you
                      attend school?
                    </label>
                    <Field
                      as="textarea"
                      name="schoolSchedule"
                      className={styles.textarea}
                    />
                  </div>
                )}
              </Col>
            )}
          </Row>

          <Row className={styles.group}>
            <Col md={6}>
              <div>
                <label className="text-xl font-bold">
                  What Personal Identification do you have? (Check all that
                  apply)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ margin: 0, whiteSpace: 'nowrap', width: '200px' }}>Birth Certificate</label>
                    <Field
                      type="checkbox"
                      name="birthCertificate"
                      onChange={({ target: { checked } }) => {
                        setFieldValue("birthCertificate", checked);
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ margin: 0, whiteSpace: 'nowrap', width: '200px' }}>Driver's License</label>
                    <Field
                      type="checkbox"
                      name="driversLicense"
                      onChange={({ target: { checked } }) => {
                        setFieldValue("driversLicense", checked);
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ margin: 0, whiteSpace: 'nowrap', width: '200px' }}>Manitoba Health Card</label>
                    <Field
                      type="checkbox"
                      name="healthCard"
                      onChange={({ target: { checked } }) => {
                        setFieldValue("healthCard", checked);
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ margin: 0, whiteSpace: 'nowrap', width: '200px' }}>Status Card</label>
                    <Field
                      type="checkbox"
                      name="statusCard"
                      onChange={({ target: { checked } }) => {
                        setFieldValue("statusCard", checked);
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ margin: 0, whiteSpace: 'nowrap', width: '200px' }}>Enhanced I.D.</label>
                    <Field
                      type="checkbox"
                      name="enhancedID"
                      onChange={({ target: { checked } }) => {
                        setFieldValue("enhancedID", checked);
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ margin: 0, whiteSpace: 'nowrap', width: '200px' }}>Student I.D.</label>
                    <Field
                      type="checkbox"
                      name="studentID"
                      onChange={({ target: { checked } }) => {
                        setFieldValue("studentID", checked);
                      }}
                    />
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>Do you have access to an elder or Counsellor?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="accessElder"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="accessElder"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>
            </Col>
            {values.accessElder === "no" && (
              <Col md={8}>
                <label>
                  Are you interested in getting access to an Elder or
                  Counsellor?
                </label>
                <Field
                  as="textarea"
                  name="accessElderExplained"
                  className={styles.textarea}
                />
              </Col>
            )}
          </Row>

          <Row className={styles.group}>
            <label>Is there an educational support person you contact?</label>
            <FieldArray name="educationalPersons">
              {({ push, remove }) => (
                <div>
                  {values.educationalPersons.map((educationalPerson, index) => (
                    <div
                      key={index}
                      className={`${styles.bglightgrey} border rounded p-2 mb-3`}
                    >
                      <Row className="align-items-center">
                        <Col md={4}>
                          <div>
                            <label
                              htmlFor={`educationalPersons.${index}.firstName`}
                            >
                              First Name:
                            </label>
                            <Field
                              id={`educationalPersons.${index}.firstName`}
                              name={`educationalPersons.${index}.firstName`}
                              component={ValidNameInput}
                            />
                          </div>
                        </Col>

                        <Col md={4}>
                          <div>
                            <label
                              htmlFor={`educationalPersons.${index}.middleName`}
                            >
                              Middle Name:
                            </label>
                            <Field
                              id={`educationalPersons.${index}.middleName`}
                              name={`educationalPersons.${index}.middleName`}
                              component={ValidNameInput}
                            />
                          </div>
                        </Col>
                        <Col md={4}>
                          <div>
                            <label
                              htmlFor={`educationalPersons.${index}.lastName`}
                            >
                              Last Name:
                            </label>
                            <Field
                              id={`educationalPersons.${index}.lastName`}
                              name={`educationalPersons.${index}.lastName`}
                              component={ValidNameInput}
                            />
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={4}>
                          <div>
                            <label
                              htmlFor={`educationalPersons.${index}.relationship`}
                            >
                              Relationship:
                            </label>
                            <Field
                              id={`educationalPersons.${index}.relationship`}
                              name={`educationalPersons.${index}.relationship`}
                              component={ValidNameInput}
                            />
                          </div>
                        </Col>
                        <Col md={4}>
                          <Field
                            name={`educationalPersons.${index}.phoneNumber`}
                            label="Phone Number:"
                            component={PhoneNumberInput}
                            placeholder="(123) 456-7890"
                            error={
                              errors.educationalPersons?.[index]?.phoneNumber
                            }
                          />
                        </Col>
                        <Col md={4}>
                          <Field
                            name={`educationalPersons.${index}.email`}
                            label="Email Address:"
                            component={EmailInput}
                            placeholder="youremail@example.com"
                          />
                        </Col>
                      </Row>
                      <Row>
                        <Col md={9}></Col>
                        <Col md={3} className="d-flex align-items-end mt-2">
                          <Button
                            className="w-100 btn btn-danger"
                            type="button"
                            onClick={() => remove(index)}
                          >
                            Delete
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  ))}
                  <Button
                    className="btn-dark"
                    type="button"
                    onClick={() =>
                      push({
                        firstName: "",
                        middleName: "",
                        lastName: "",
                        relationship: "",
                        phoneNumber: "",
                        email: "",
                      })
                    }
                  >
                    + Add Educational Support Person
                  </Button>
                </div>
              )}
            </FieldArray>
          </Row>

          <div className={styles.group}>
            <h3 className="text-dark">Financial Information:</h3>

            <Row className={styles.group}>
              <Col md={4}>
                <div>
                  <label>Do you have a Bank Account?</label>
                  <div className="form-check form-check-inline">
                    <Field
                      className="form-check-input"
                      type="radio"
                      name="bankAccount"
                      value="yes"
                    />
                    <label className="form-check-label">Yes</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <Field
                      className="form-check-input"
                      type="radio"
                      name="bankAccount"
                      value="no"
                    />
                    <label className="form-check-label">No</label>
                  </div>
                </div>
              </Col>

              <Col md={5}>
                <div>
                  <label>Are you on Employment and Income Assistance?</label>
                  <div className="form-check form-check-inline">
                    <Field
                      className="form-check-input"
                      type="radio"
                      name="incomeAssistance"
                      value="yes"
                    />
                    <label className="form-check-label">Yes</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <Field
                      className="form-check-input"
                      type="radio"
                      name="incomeAssistance"
                      value="no"
                    />
                    <label className="form-check-label">No</label>
                  </div>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <div>
                  <label htmlFor="caseWorkerFullName">
                    Case Worker's Full Name:
                  </label>
                  <Field
                    id="caseWorkerFullName"
                    name="caseWorkerFullName"
                    component={ValidNameInput}
                    placeholder="Jimmy"
                  />
                </div>
              </Col>

              <Col md={4}>
                <div>
                  <Field
                    name="caseWorkerPhoneNumber"
                    label="Case Worker Phone Number:"
                    component={PhoneNumberInput}
                    placeholder="(123) 456-7890"
                  />
                </div>
              </Col>
              <Col md={4}>
                <div>
                  <label htmlFor="caseWorkerEmail">Case Worker Email:</label>
                  <Field
                    type="email"
                    id="caseWorkerEmail"
                    name="caseWorkerEmail"
                  />
                  <ErrorMessage
                    name="caseWorkerEmail"
                    component={() => (
                      <p className={styles.errorText}>
                        {errors.caseWorkerEmail}
                      </p>
                    )}
                  />
                </div>
              </Col>
            </Row>
          </div>

          <Row>
            <h3 className="text-dark">Other Information:</h3>
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>
                  Do you have any involvement with the Youth Justice System?
                </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="youthJustice"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="youthJustice"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>
            </Col>
            {values.youthJustice === "yes" && (
              <Col md={8}>
                <label>
                  Please share the details: (examples, any pending/active
                  charges, conditions or how it may affect you)
                </label>
                <Field
                  as="textarea"
                  name="custodySupportSpecified"
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="custodySupportSpecified"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>
                  Would you be interested in speaking to someone at the office?
                </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="speakingOffice"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="speakingOffice"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>
            </Col>
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>
                  Are you interested in attending any youth workshops?
                </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="youthWorkshops"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="youthWorkshops"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>
            </Col>
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>
                  Are you connected to any other community or organization?
                </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="connectedCommunity"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="connectedCommunity"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>
            </Col>
            {values.connectedCommunity === "yes" && (
              <Col md={8}>
                <label>Please share the details:</label>
                <Field
                  as="textarea"
                  name="connectedCommunityExplained"
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="connectedCommunityExplained"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>
                  Do you have any disabilities (physical, intellectual, etc.)?
                </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="disabilities"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="disabilities"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>
            </Col>
            {values.disabilities === "yes" && (
              <Col md={8}>
                <label>Please Explain:</label>
                <Field
                  as="textarea"
                  name="disabilitiesExplained"
                  className={styles.textarea}
                />
              </Col>
            )}
          </Row>

          <Row>
            <Col>
              <label>
                If comfortable, please tell us about your experience in care:
              </label>
              <Field
                as="textarea"
                name="careExperience"
                className={styles.textarea}
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <label>
                Please tell us what kind of support and/or advocacy you hope to
                receive from the First Nations Family Advocate Office (FNFAO)
                Rites of Passage Team:
              </label>
              <Field
                as="textarea"
                name="kindSupport"
                className={styles.textarea}
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <label>Please tell us about some of your personal goals:</label>
              <Field
                as="textarea"
                name="personalGoals"
                className={styles.textarea}
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <label>
                Please tell us about any additional information that you would
                like to share or attach any documents you feel may be important
                to your journey at this time:
              </label>
              <Field
                as="textarea"
                name="additionalInformation"
                className={styles.textarea}
              />
            </Col>
          </Row>

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

// Export the PreIntakeForm component for use in other pages
export default YouthIntakeForm;
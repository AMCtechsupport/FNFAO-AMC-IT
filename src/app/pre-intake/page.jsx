"use client";
import React, { useState } from "react";
import UserHome from "../user-home/page";
import styles from "./preIntake.module.css";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import { Button, Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import ValidNameInput from "@/components/ValidNameInput";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";
import ReferredBySelect from "@/components/ReferredBySelect";
import ProvincesSelect from "@/components/ProvincesSelect";
import RelationshipToChildrenSelect from "@/components/RelationshipToChildrenSelect";
import StatusCFSFileSelect from "@/components/StatusCFSFileSelect";
import FirstNationSelect from "@/components/FirstNationSelect";
import ManageCfsAgencies from "@/components/ManageCfsAgencies";

import { useUser } from "@clerk/clerk-react";
import supabase from "../lib/supabase";

export default function PreIntake() {
  return (
    <UserHome>
      <div className={styles.preIntakeContainer}>
        <div className={styles.container}>
          <PreIntakeForm />
        </div>
      </div>
    </UserHome>
  );
}

function PreIntakeForm() {
  const { user } = useUser();
  const [formSent, setFormSent] = useState(false);

  const validateRadio = (value) => {
    if (!value) {
      return "Please select an option"; // Error message if there is no selection
    }
  };

  function validatePhoneNumber(value) {
    const phoneNumberPattern = /^\(\d{3}\) \d{3}-\d{4}$/;
    if (value && !phoneNumberPattern.test(value)) {
      return "Invalid phone number format";
    }
    return undefined;
  }

  return (
    <Formik
      initialValues={{
        firstName: "",
        middleName: "",
        lastName: "",
        dateOfBirth: "",
        phoneNumber: "",
        address: "",
        city: "",
        province: "",
        postalCode: "",
        email: "",
        emergencyContactFirstName: "",
        emergencyContactLastName: "",
        emergencyContactNumber: "",
        referredBy: "",
        relationshipToChildren: "",
        otherAdultsInvolved: "",
        otherAdultsInvolvedExplained: "",
        firstNationMembership: "",
        treatyNumber: "",
        nineTreatyNumber: "", 
        otherFirstNation: "",
        ninePersonalHealthNumber: "",
        sixPersonalHealthNumber: "",
        onReserve: "",
        transitionFromReserve: "",
        previousFNFAOClient: "",
        seekingAdvocacy: "",
        visitsChild: "",
        visitsChildFrequency: "",
        casePlanCopy: "",
        casePlanCopyDescribe: "",
        involvedCFSReason: "",
        prenatalSupport: "",
        prenatalSupportSpecified: "",
        housingSupport: "",
        housingSupportSpecified: "",
        addictionsSupport: "",
        addictionsSupportSpecified: "",
        youthSupport: "",
        youthSupportSpecified: "",
        custodySupport: "",
        custodySupportSpecified: "",
        criminalCharges: "",
        criminalChargesSpecified: "",
        activeWarrant: "",
        activeWarrantSpecified: "",
        activeInvestigation: "",
        activeInvestigationExplained: "",
        activeOrders: "",
        activeOrdersExplained: "",
        currentLawyer: "",
        legalAssistance: "",
        legalAssistanceSpecified: "",
        unableToAssistExplained: "",
        referForSupport: "",
        children: [],
      }}
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
          errors.dateOfBirth = "Please choose a valid birth date";
        } else {
          const birthDate = new Date(values.dateOfBirth);
          const currentYear = new Date().getFullYear();
          const birthYear = birthDate.getFullYear();
          const today = new Date();

          // Verify that the date of birth is not in the future
          if (birthDate > today) {
            errors.dateOfBirth = "Birth date cannot be in the future";
          }

          // Year validation
          if (birthYear > currentYear) {
            errors.dateOfBirth = "Birth year cannot be in the future";
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

        values.children.forEach((child, index) => {
          const childCfsAgentNumberError = validatePhoneNumber(
            child.childCfsAgentNumber
          );
          if (childCfsAgentNumberError) {
            if (!errors.children) errors.children = [];
            if (!errors.children[index]) errors.children[index] = {};
            errors.children[index].childCfsAgentNumber =
              childCfsAgentNumberError;
          }
        });

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

        // Validation for 9 digits (only if the user enters something)
        if (
          values.ninePersonalHealthNumber &&
          !/^\d{9}$/.test(values.ninePersonalHealthNumber)
        ) {
          errors.ninePersonalHealthNumber = "Must be exactly 9 digits";
        }

        if (
          values.nineTreatyNumber &&
          !/^\d{9}$/.test(values.nineTreatyNumber)
        ) {
          errors.nineTreatyNumber = "Treaty number must be exactly 9 digits";
        }


        // Validation for 6 digits (only if the user enters something)
        if (
          values.sixPersonalHealthNumber &&
          !/^\d{6}$/.test(values.sixPersonalHealthNumber)
        ) {
          errors.sixPersonalHealthNumber = "Must be exactly 6 digits";
        }

        if (
          values.criminalCharges === "yes" &&
          !values.criminalChargesSpecified
        ) {
          errors.criminalChargesSpecified = "Please specify why.";
        }

        if (values.activeWarrant === "yes" && !values.activeWarrantSpecified) {
          errors.activeWarrantSpecified = "Please specify why.";
        }

        if (
          values.activeInvestigation  === "yes" &&
          !values.activeInvestigationExplained
        ) {
          errors.activeInvestigationExplained = "Please select a start date.";
        }
        if (values.activeOrders === "yes" && !values.activeOrdersExplained) {
          errors.activeOrdersExplained = "Please specify why.";
        }

        return errors;
      }}
      onSubmit={async (values, { resetForm }) => {
        console.log("Submitting:", values);
        try {
          const convertedValues = {};

          // Loop through all fields in the 'values' object
          // to convert them from "yes/no" to true/false
          for (let key in values) {
            if (values[key] === "yes") {
              convertedValues[key] = true;
            } else if (values[key] === "no") {
              convertedValues[key] = false;
            } else if (
              values[key] === "" ||
              values[key] === undefined ||
              values[key] === null
            ) {
              convertedValues[key] = null; // Assigns null if nothing is selected
            } else {
              convertedValues[key] = values[key];
            }
          }

          // console.log("Converted values:", convertedValues);

          // Get the current date in ISO 8601 format
          const currentDate = new Date().toISOString();

          // Extract 'children', 'emergencyContactFirstName', 'emergencyContactLastName' and 'emergencyContactNumber'
          // from convertedValues and keep the rest as client data
          const {
            children,
            emergencyContactFirstName,
            emergencyContactLastName,
            emergencyContactNumber,
            ...clientData
          } = convertedValues;

          // Add date fields before inserting
          clientData.createdAt = currentDate;
          clientData.dateModified = currentDate;
          clientData.clientType = "Pre-Intake";

          // console.log("Client data to insert:", clientData);

          // Insert client data into the 'Clients' table
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

          // console.log("Client inserted successfully:", client);

          // Get the inserted client's ID
          const clientId = client[0]?.client_id;
          if (!clientId) throw new Error("Failed to retrieve client ID.");

          // If there are children, insert them into the 'Childs' table
          if (children && children.length > 0) {
            const childrenData = children.map((child) => ({
              ...child,
              client_id: clientId, // Associate each child with the client
            }));

            const { error: childrenError } = await supabase
              .from("Childs")
              .insert(childrenData);

            if (childrenError) {
              console.error("Error inserting children:", childrenError);
              throw childrenError;
            }

            // console.log("Children inserted successfully:", childrenData);
          }

          // Insert emergency contact into  the 'Emergency Contact' table
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
              client_id: clientId, // Associate emergency contact with the cliente
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
          resetForm();
          setTimeout(() => setFormSent(false), 5000);
        } catch (error) {
          console.error("General error:", error);
        }
      }}
    >
      {({ values, setFieldValue, errors, touched }) => (
        <Form className={styles.form}>
          <div className={styles.titleContainer}>
            <h2 className={styles.centeredTitle}>PRE-INTAKE FORM</h2>
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
          {/* <div className="bg- p-2 rounded border border-light border-1"> */}
          <Row>
            <Col md={3}>
              <InputField
                name="firstName"
                label="First Name:*"
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
                label="Last Name:*"
                placeholder="Connor"
                error={errors.lastName}
              />
            </Col>

            <Col md={3}>
              <div>
                <label htmlFor="dateOfBirth">Birth Date:*</label>
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
              <div>
                <label htmlFor="phoneNumber">Phone Number:</label>
                <Field
                  type="number"
                  id="phoneNumber"
                  name="phoneNumber"
                  component={PhoneNumberInput}
                  placeholder="(123) 456-7890"
                />
              </div>
            </Col>

            <Col md={4}>
              <div>
                <label htmlFor="email">Email:</label>
                <Field type="email" id="email" name="email" placeholder="john123@example.com" />
                <ErrorMessage
                  name="email"
                  component={() => (
                    <p className={styles.errorText}>{errors.email}</p>
                  )}
                />
              </div>
            </Col>
          </Row>

          {/* Emrgency contact */}
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
                <label htmlFor="emergencyContactNumber">Phone Number:</label>
                <Field
                  type="number"
                  id="emergencyContactNumber"
                  name="emergencyContactNumber"
                  component={PhoneNumberInput}
                  placeholder="(123) 456-7890"
                />
              </div>
            </Col>
          </Row>

          {/* About you */}
          <Row>
            <h3 className="text-dark">About You</h3>
            <Col md={4}>
              <RelationshipToChildrenSelect
                name="relationshipToChildren"
                label="What is your relationship to the child(ren)?"
                error={errors.relationshipToChildren}
              />
            </Col>
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>
                  Are there any other adults involved in your matter?
                </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="otherAdultsInvolved"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="otherAdultsInvolved"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="otherAdultsInvolved"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.otherAdultsInvolved === "yes" && (
              <Col md={8}>
                <label>Please specify:</label>
                <Field
                  as="textarea"
                  name="otherAdultsInvolvedExplained"
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="otherAdultsInvolvedExplained"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>

          <Row>
            <Col md={4}>
              <FirstNationSelect
                name="firstNationMembership"
                label="First Nation Membership"
                error={errors.firstNationMembership}
              />
            </Col>
            <Col md={4}>
             <div>
                <label>TreatyNumber (9-Digit):</label>
                <Field
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={9}
                  id="nineTreatyNumber"
                  placeholder="123456789"
                  name="nineTreatyNumber"
                />
                <ErrorMessage
                  name="nineTreatyNumber"
                  component={() => (
                    <p className={styles.errorText}>
                      {errors.nineTreatyNumber}
                    </p>
                  )}
                />
              </div>
              {/* <InputField
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={9}
                name="treatyNumber"
                label="Treaty Number:"
                placeholder="123456789"
                error={errors.treatyNumber}
              /> */}
            </Col>
            <Col md={4}>
              <FirstNationSelect
                name="otherFirstNation"
                label="Other First Nation"
                error={errors.otherFirstNation}
              />
            </Col>
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>Personal Health Identification Numbers (9-Digit):</label>
                <Field
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={9}
                  id="ninePersonalHealthNumber"
                  placeholder="123456789"
                  name="ninePersonalHealthNumber"
                />
                <ErrorMessage
                  name="ninePersonalHealthNumber"
                  component={() => (
                    <p className={styles.errorText}>
                      {errors.ninePersonalHealthNumber}
                    </p>
                  )}
                />
              </div>
            </Col>
            <Col md={2}>
              <label>(6-Digit):</label>
              <Field
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                id="sixPersonalHealthNumber"
                placeholder="000000"
                name="sixPersonalHealthNumber"
              />
              <ErrorMessage
                name="sixPersonalHealthNumber"
                component={() => (
                  <p className={styles.errorText}>
                    {errors.sixPersonalHealthNumber}
                  </p>
                )}
              />
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <div>
                <label>Are you living on or off reserve?  </label>
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
            <Col md={4}>
              <div>
                <label>Are you a previous client of FNFAO?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="previousFNFAOClient"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="previousFNFAOClient"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="previousFNFAOClient"
                  component="div"
                  className={styles.previousFNFAOClient}
                />
              </div>
            </Col>
          </Row>

          <Row className={styles.group}>
            <Col>
              <label>Why are you seeking advocacy today?</label>
              <Field
                as="textarea"
                name="seekingAdvocacy"
                className={styles.textarea}
              />
              <ErrorMessage
                name="seekingAdvocacy"
                component="div"
                className={styles.errorText}
              />
            </Col>
          </Row>

          {/* About your children */}
          <Row>
            <h3 className="text-dark">About Your Children</h3>
            <FieldArray name="children">
              {({ push, remove }) => (
                <div>
                  {values.children.map((child, index) => (
                    <div
                      key={index}
                      className={`${styles.bglightgrey} border rounded p-2 mb-3`}
                    >
                      <Row className="align-items-center">
                        <Col md={3}>
                          <div>
                            <label htmlFor={`children.${index}.firstName`}>
                              First Name:
                            </label>
                            <Field
                              id={`children.${index}.firstName`}
                              name={`children.${index}.firstName`}
                              component={ValidNameInput}
                            />
                          </div>
                        </Col>

                        <Col md={3}>
                          <div>
                            <label htmlFor={`children.${index}.middleName`}>
                              Middle Name:
                            </label>
                            <Field
                              id={`children.${index}.middleName`}
                              name={`children.${index}.middleName`}
                              component={ValidNameInput}
                            />
                          </div>
                        </Col>
                        <Col md={5}>
                          <div>
                            <label htmlFor={`children.${index}.lastName`}>
                              Last Name:
                            </label>
                            <Field
                              id={`children.${index}.lastName`}
                              name={`children.${index}.lastName`}
                              component={ValidNameInput}
                            />
                          </div>
                        </Col>
                      </Row>
                      <Row className="mb-4">
                        <Col md={3}>
                          <div>
                            <label htmlFor={`children.${index}.birthDate`}>
                              Date of Birth:
                            </label>
                            <Field
                              type="date"
                              id={`children.${index}.birthDate`}
                              name={`children.${index}.birthDate`}
                            />
                            <ErrorMessage
                              name={`children.${index}.birthDate`}
                              component={() => (
                                <p className={styles.errorText}>
                                  {errors.children?.[index]?.birthDate}
                                </p>
                              )}
                            />
                          </div>
                        </Col>
                        <Col md={6}>
                          <FirstNationSelect
                            name={`children.${index}.childNation`}
                            label="First Nation Membership"
                            error={errors.childNation}
                          />
                        </Col>
                        <Col md={3}>
                          <InputField
                            name={`children.${index}.childPlaced`}
                            label="Place of Stay:"
                          />
                        </Col>
                      </Row>

                      {/* Agency information */}
                      <div className="bg-light border border-light p-3 rounded">
                        <Row className="mt-2">
                          <h5 className="text-dark">Agency Information</h5>
                          <Col md={4}>
                            <Field
                              name={`children.${index}.childCfsAgency`}
                              component={ManageCfsAgencies}
                              label="CFS Agency"
                              error={errors.children?.[index]?.childCfsAgency}
                            />
                          </Col>
                          <Col md={4}>
                            <InputField
                              name={`children.${index}.childCfsAgentFullName`}
                              label="Agency Worker's Full Name:"
                            />
                          </Col>
                          <Col md={4}>
                            <div>
                              <label
                                htmlFor={`children.${index}.childCfsAgentNumber`}
                              >
                                Phone Number:
                              </label>
                              <Field
                                type="number"
                                id={`children.${index}.childCfsAgentNumber`}
                                name={`children.${index}.childCfsAgentNumber`}
                                component={PhoneNumberInput}
                                placeholder="(123) 456-7890"
                              />
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={4}>
                            <div>
                              <label
                                htmlFor={`children.${index}.childCfsAgentEmail`}
                              >
                                Email:
                              </label>
                              <Field
                                type="email"
                                id={`children.${index}.childCfsAgentEmail`}
                                name={`children.${index}.childCfsAgentEmail`}
                              />
                              <ErrorMessage
                                name={`children.${index}.childCfsAgentEmail`}
                                component={() => (
                                  <p className={styles.errorText}>
                                    {
                                      errors.children?.[index]
                                        ?.childCfsAgentEmail
                                    }
                                  </p>
                                )}
                              />
                            </div>
                          </Col>
                          <Col md={4}>
                            <Field
                              name={`children.${index}.childStatusCfsFile`}
                              component={StatusCFSFileSelect}
                              label="CFS File Status"
                              error={
                                errors.children?.[index]?.childStatusCfsFile
                              }
                            />
                          </Col>
                        </Row>
                      </div>
                      {/* END Agency information */}

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
                        birthDate: "",
                        childNation: "",
                        childPlaced: "",
                        childCfsAgency: "",
                        childCfsAgentFullName: "",
                        childCfsAgentNumber: "",
                        childCfsAgentEmail: "",
                        childStatusCfsFile: "",
                      })
                    }
                  >
                    + Add Child
                  </Button>
                </div>
              )}
            </FieldArray>
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>Do you currently have visits with your children?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="visitsChild"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="visitsChild"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="visitsChild"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.visitsChild === "yes" && (
              <Col md={8}>
                <label>If yes, how often?</label>
                <Field
                  as="textarea"
                  name="visitsChildFrequency"
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="visitsChildFrequency"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>
          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>Do you have a copy of your case plan(s)?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="casePlanCopy"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="casePlanCopy"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="casePlanCopy"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.casePlanCopy === "no" && (
              <Col md={8}>
                <label>
                  If no, describe the last requests the agency asked you to
                  complete to get your children home:
                </label>
                <Field
                  as="textarea"
                  name="casePlanCopyDescribe"
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="casePlanCopyDescribe"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>
          <Row className={styles.group}>
            <Col>
              <label>Reason for CFS involvement with your family:</label>
              <Field
                as="textarea"
                name="involvedCFSReason"
                className={styles.textarea}
              />
              <ErrorMessage
                name="involvedCFSReason"
                component="div"
                className={styles.errorText}
              />
            </Col>
          </Row>

          {/* Other questions */}
          <Row>
            <h3 className="text-dark">Other Questions</h3>
          </Row>
          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>Need prenatal support?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="prenatalSupport"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="prenatalSupport"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="prenatalSupport"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.prenatalSupport === "yes" && (
              <Col md={8}>
                <label>
                  If yes, specify (e.g. help avoiding birth apprehension, access
                  to prenatal care, breastfeeding information, preparing for
                  baby, etc.):
                </label>
                <Field
                  as="textarea"
                  name="prenatalSupportSpecified"
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="prenatalSupportSpecified"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>Need housing support?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="housingSupport"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="housingSupport"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="housingSupport"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.housingSupport === "yes" && (
              <Col md={8}>
                <label>
                  If yes, specify (e.g. urgent housing, preventing eviction,
                  dealing with the Residential Tenancies Branch, etc):
                </label>
                <Field
                  as="textarea"
                  name="housingSupportSpecified"
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="housingSupportSpecified"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>Need addictions support?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="addictionsSupport"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="addictionsSupport"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="addictionsSupport"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.addictionsSupport === "yes" && (
              <Col md={8}>
                <label>
                  If yes, specify (e.g. access to detox, treatment, relapse
                  prevention programming, etc.):
                </label>
                <Field
                  as="textarea"
                  name="addictionsSupportSpecified"
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="addictionsSupportSpecified"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>Need youth support for you/your children?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="youthSupport"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="youthSupport"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="youthSupport"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.youthSupport === "yes" && (
              <Col md={8}>
                <label>
                  If yes, specify (e.g. help avoiding birth apprehension, access
                  to prenatal care, breastfeeding information, preparing for
                  baby, etc.):
                </label>
                <Field
                  as="textarea"
                  name="youthSupportSpecified"
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="youthSupportSpecified"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>Need custody-related support?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="custodySupport"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="custodySupport"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="custodySupport"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.custodySupport === "yes" && (
              <Col md={8}>
                <label>
                  If yes, specify (e.g. ex-spouse not honouring custody
                  arrangement for access/visitation, grandparent access, child
                  support, etc:)
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
                <label>Do you have any criminal charges (past, active or pending)? *</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="criminalCharges"
                    value="yes"
                    validate={validateRadio}
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="criminalCharges"
                    value="no"
                    validate={validateRadio}
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="criminalCharges"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.criminalCharges === "yes" && (
              <Col md={8}>
                <label>If yes, please specify why: </label>
                <Field
                  as="textarea"
                  name="criminalChargesSpecified"
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="criminalChargesSpecified"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>Do you currently have an active arrest warrant? *</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="activeWarrant"
                    value="yes"
                    validate={validateRadio}
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="activeWarrant"
                    value="no"
                    validate={validateRadio}
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="activeWarrant"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.activeWarrant === "yes" && (
              <Col md={8}>
                <label>If yes, please specify why: </label>
                <Field
                  as="textarea"
                  name="activeWarrantSpecified"
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="activeWarrantSpecified"
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
                  Are you currently under child abuse investigation? *
                </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="activeInvestigation"
                    value="yes"
                    validate={validateRadio}
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="activeInvestigation"
                    value="no"
                    validate={validateRadio}
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="activeInvestigation"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.activeInvestigation === "yes" && (
              <Col md={3}>
                <label>If yes, start date: </label>
                <Field
                  type="date"
                  id="activeInvestigationExplained"
                  name="activeInvestigationExplained"
                  max={new Date().toISOString().split("T")[0]}
                />
                <ErrorMessage
                  name="activeInvestigationExplained"
                  component={() => (
                    <p className={styles.errorText}>
                      {errors.activeInvestigationExplained}
                    </p>
                  )}
                />
              </Col>
            )}
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>
                  Any active No Contact Orders or Protection Orders? *
                </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="activeOrders"
                    value="yes"
                    validate={validateRadio}
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="activeOrders"
                    value="no"
                    validate={validateRadio}
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="activeOrders"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.activeOrders === "yes" && (
              <Col md={8}>
                <label>If yes, against who or against you?</label>
                <Field
                  as="textarea"
                  name="activeOrdersExplained"
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="activeOrdersExplained"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>

          <Row className={styles.group}>
            <Col md={3}>
              <div>
                <label>Do you have a lawyer?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="currentLawyer"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="currentLawyer"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="currentLawyer"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.currentLawyer === "no" && (
              <>
                <Col md={3}>
                  <div>
                    <label>If no, need legal assistance?</label>
                    <div className="form-check form-check-inline">
                      <Field
                        className="form-check-input"
                        type="radio"
                        name="legalAssistance"
                        value="yes"
                      />
                      <label className="form-check-label">Yes</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <Field
                        className="form-check-input"
                        type="radio"
                        name="legalAssistance"
                        value="no"
                      />
                      <label className="form-check-label">No</label>
                    </div>
                    <ErrorMessage
                      name="legalAssistance"
                      component="div"
                      className={styles.errorText}
                    />
                  </div>
                </Col>
                {values.legalAssistance === "yes" && (
                  <Col md={6}>
                    <label>If yes, specify:</label>
                    <Field
                      as="textarea"
                      name="legalAssistanceSpecified"
                      className={styles.textarea}
                    />
                    <ErrorMessage
                      name="legalAssistanceSpecified"
                      component="div"
                      className={styles.errorText}
                    />
                  </Col>
                )}
              </>
            )}
          </Row>
          <Row>
            <h3 className="text-dark">Staff Only</h3>
            <Col>
              <label>
                If we are unable to assist, please list why (Example: they do
                not fit FNFAO’s mandate, etc.):
              </label>
              <Field
                as="textarea"
                name="unableToAssistExplained"
                className={styles.textarea}
              />
              <ErrorMessage
                name="unableToAssistExplained"
                component="div"
                className={styles.errorText}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <label>
                If we are unable to assist, please identify where you are
                referring them to for support:
              </label>
              <Field
                as="textarea"
                name="referForSupport"
                className={styles.textarea}
              />
              <ErrorMessage
                name="referForSupport"
                component="div"
                className={styles.errorText}
              />
            </Col>
          </Row>

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

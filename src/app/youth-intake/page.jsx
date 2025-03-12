"use client";
import React, { useState } from "react";
import UserHome from "../user-home/page";
import styles from "./preIntake.module.css";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import { Button, Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import InputField from "@/components/InputField";
import ReferredBySelect from "@/components/ReferredBySelect";
import ProvincesSelect from "@/components/ProvincesSelect";
import StatusCFSFileSelect from "@/components/StatusCFSFileSelect";
import FirstNationSelect from "@/components/FirstNationSelect";
import PronounSelect from "@/components/Pronouns";

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
  const [formSent, setFormSent] = useState(false);

  return (
    <Formik
      initialValues={{
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
        otherFirstnation: "",
        inCare: false,
        statusCFSFile: "",
        lastFaceToFace: "",
        cfsAgency: "",
        cfsAgentFullName: "",
        cfsAgentNumber: "",
        cfsAgentEmail: "",
        onReserve: false,
        apprehendedOnReserve: false,
        transitionFromReserve: false,
        currentlyStaying: "",
        currentlyStayingDuraton: "",
        peopleHome: 0,
        homeMembers: [],
        inSchool: false,
        schoolAttending: "",
        currentGrade: "",
        fullStudent: false,
        schoolSchedule: "",
        birthCertificate: false,
        driversLicense: false,
        healthCard: false,
        statusCard: false,
        enhancedID: false,
        studentID: false,
        bankAccount: false,
        incomeAssistance: false,
        caseWorkerFullName: "",
        caseWorkerPhoneNumber: "",
        caseWorkerEmail: "",
        youthJustice: false,
        custodySupportSpecified: "",
        accessElder: false,
        speakingOffice: false,
        youthWorkshops: false,
        disabilities: false,
        disabilitiesExplained: "",
        careExperience: "",
        kindSupport: "",
        personalGoals: "",
        additionalInformation: "",
        youthIntakeAccurate: "",
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
          errors.dateOfBirth = "Please select a birth date";
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

        return errors;
      }}
      onSubmit={async (values, { resetForm }) => {
        try {
          const convertedValues = {};

          // Loop through all fields in the 'values' object
          // to convert them from "yes/no" to true/false
          for (let key in values) {
            if (values[key] === "yes") {
              convertedValues[key] = true;
            } else if (values[key] === "no") {
              convertedValues[key] = false;
            } else {
              convertedValues[key] = values[key];
            }
          }

          console.log("Converted values:", convertedValues);

          // Get the current date in ISO 8601 format
          const currentDate = new Date().toISOString();

          // Extract 'children', 'emergencyContactFirstName', 'emergencyContactLastName', 'emergencyContactNumber', and 'homeMembers'
          // from convertedValues and keep the rest as client data
          const {
            children,
            emergencyContactFirstName,
            emergencyContactLastName,
            emergencyContactNumber,
            homeMembers,
            ...clientData
          } = convertedValues;

          // Add date fields before inserting
          clientData.createdAt = currentDate;
          clientData.dateModified = currentDate;
          clientData.clientType = "Youth Intake";

          console.log("Client data to insert:", clientData);

          // Insert client data into the 'Clients' table
          const { data: client, error: clientError } = await supabase
            .from("Clients")
            .insert([clientData])
            .select(); // Retrieve inserted data to get the client ID

          if (clientError) {
            console.error("❌ Error inserting client:");
            console.error("Message:", clientError.message || "No message");
            console.error("Details:", clientError.details || "No details");
            console.error("Code:", clientError.code || "No code");
            throw clientError;
          }

          console.log("Client inserted successfully:", client);

          // Get the inserted client's ID
          const clientId = client[0]?.client_id;
          if (!clientId) throw new Error("Failed to retrieve client ID.");

          // If there are homeMembers, insert them into the 'Home Members' table
          if (homeMembers && homeMembers.length > 0) {
            const homeMembersData = homeMembers.map((homeMember) => {
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

            const { error: homeMemberError } = await supabase
              .from("Home Members")
              .insert(homeMembersData);

            if (homeMemberError) {
              console.error("Error inserting home members:", homeMemberError);
              throw homeMemberError;
            }

            console.log("Home Members inserted successfully:", homeMembersData);
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

            console.log(
              "✅ Emergency contact inserted successfully:",
              emergencyContactData
            );
          }

          // Reset form and show success message
          setFormSent(true);
          resetForm();
          setTimeout(() => setFormSent(false), 3000);
        } catch (error) {
          console.error("General error:", error);
        }
      }}
    >
      {({ values, errors, setFieldValue }) => (
        <Form className={styles.form}>
          <h2 className={styles.centeredTitle}>YOUTH INTAKE FORM</h2>
          <Row>
            <h4 className="text-dark">General Information</h4>
            <Col md={8} />
            <Col md={4}>
              <ReferredBySelect
                name="referredBy"
                label="How did the client learn about FNFAO?"
                error={errors.referredBy}
              />
            </Col>
          </Row>

          <Row>
            <Col md={3}>
              <InputField
                name="firstName"
                label="First Name:"
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
                label="Last Name:"
                placeholder="Connor"
                error={errors.lastName}
              />
            </Col>

            <Col md={2}>
              <PronounSelect
                name="province"
                label="Preferred Pronouns:"
                error={errors.province}
              />
            </Col>

            <Col md={3}>
              <div>
                <label htmlFor="dateOfBirth">Birth Date:</label>
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
                <Field type="number" id="phoneNumber" name="phoneNumber" />
                <ErrorMessage
                  name="phoneNumber"
                  component={() => (
                    <p className={styles.errorText}>{errors.phoneNumber}</p>
                  )}
                />
              </div>
            </Col>

            <Col md={3}>
              <div>
                <label htmlFor="socialMedia">Social Media Contact:</label>
                <Field type="number" id="socialMedia" name="socialMedia" />
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
                />
                <ErrorMessage
                  name="emergencyContactNumber"
                  component={() => (
                    <p className={styles.errorText}>
                      {errors.emergencyContactNumber}
                    </p>
                  )}
                />
              </div>
            </Col>
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
              <InputField
                name="treatyNumber"
                label="Treaty Number:"
                placeholder=""
                error={errors.treatyNumber}
              />
            </Col>
            <Col md={4}>
              <FirstNationSelect
                name="otherFirstnation"
                label="Other First Nation"
                error={errors.otherFirstnation}
              />
            </Col>
          </Row>

          {/* Agency information */}
          <Row>
            <h4 className="text-dark">Agency Information</h4>

            <Row className={styles.group}>
              <Col md={4}>
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
                  <StatusCFSFileSelect
                    name="statusCFSFile"
                    label="CFS File Status:"
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

            <Col>
              <InputField
                name="cfsAgency"
                label="CFS Agency Name:"
                placeholder=""
                error={errors.cfsAgency}
              />
            </Col>
            <Col>
              <InputField
                name="cfsAgentFullName"
                label="Agency Worker’s Full Name:"
                placeholder=""
                error={errors.cfsAgentFullName}
              />
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <div>
                <label htmlFor="cfsAgentNumber">Phone Number:</label>
                <Field
                  type="number"
                  id="cfsAgentNumber"
                  name="cfsAgentNumber"
                />
                <ErrorMessage
                  name="cfsAgentNumber"
                  component={() => (
                    <p className={styles.errorText}>{errors.cfsAgentNumber}</p>
                  )}
                />
              </div>
            </Col>
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

          <Row>
            <h4 className="text-dark">Biological Parent's Information: </h4>
          </Row>
          <Row>
            <Col md={3}>
              <InputField
                name="motherFirstName"
                label="Mother's First Name:"
                placeholder="Mary"
                error={errors.firstName}
              />
            </Col>

            <Col md={3}>
              <InputField
                name="motherMiddleName"
                label="Mother's Middle Name:"
                error={errors.middleName}
              />
            </Col>
            <Col md={3}>
              <InputField
                name="motherLastName"
                label="Mother's Last Name:"
                placeholder="Davis"
                error={errors.lastName}
              />
            </Col>
            <Col md={3}>
              <FirstNationSelect
                name="motherNation"
                label="Mother's First Nation Membership"
                error={errors.firstNationMembership}
              />
            </Col>

            <Row>
              <Col md={3}>
                <InputField
                  name="fatherFirstName"
                  label="Father's First Name:"
                  placeholder="John"
                  error={errors.firstName}
                />
              </Col>

              <Col md={3}>
                <InputField
                  name="fatherMiddleName"
                  label="Father's Middle Name:"
                  error={errors.middleName}
                />
              </Col>
              <Col md={3}>
                <InputField
                  name="fatherLastName"
                  label="Father's Last Name:"
                  placeholder="Davis"
                  error={errors.lastName}
                />
              </Col>
              <Col md={3}>
                <FirstNationSelect
                  name="motherNation"
                  label="Mother's First Nation Membership"
                  error={errors.firstNationMembership}
                />
              </Col>
            </Row>
          </Row>

          <Row>
            <h4 className="text-dark">Housing Situation: </h4>
          </Row>
          <Row className={styles.group}>
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
                name="currentlyStayingDuraton"
                className={styles.textarea}
              />
            </Col>
            <Row>
              <Col md={2}>
                <label>Number of People who live at home:</label>
                <Field
                  as="textarea"
                  name="peopleHome"
                  className={styles.textarea}
                />
              </Col>
            </Row>
            <Row>
              <h4 className="text-dark">People at Home</h4>
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
                            <InputField
                              name={`homeMembers.${index}.firstName`}
                              label="First Name:"
                            />
                          </Col>
                          <Col md={3}>
                            <InputField
                              name={`homeMembers.${index}.middleName`}
                              label="Middle Name:"
                            />
                          </Col>
                          <Col md={3}>
                            <InputField
                              name={`homeMembers.${index}.lastName`}
                              label="Last Name:"
                            />
                          </Col>
                        </Row>
                        <Row>
                          <Col md={2}>
                            <InputField
                              name={`homeMembers.${index}.relationship`}
                              label="Relationship:"
                            />
                          </Col>
                          <Col md={3}>
                            <InputField
                              name={`homeMembers.${index}.phoneNumber`}
                              label="Phone Number:"
                            />
                          </Col>
                          <Col md={3}>
                            <InputField
                              name={`homeMembers.${index}.email`}
                              label="Email Address:"
                              error={errors.email}
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
            </Row>
          </Row>

          {/* Education */}
          <Row>
            <h4 className="text-dark">Education:</h4>
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
            <Col md={4}>
              <div>
                <label>What Personal Identification do you have?</label>
                <div className="form-check">
                  <label className="form-check-label">Birth Certificate</label>
                  <Field
                    className="form-check-input"
                    type="checkbox"
                    name="birthCertificate"
                    onChange={({ target: { checked } }) => {
                      setFieldValue("birthCertificate", checked);
                    }}
                  />
                </div>

                <div className="form-check">
                  <label className="form-check-label">Driver's License</label>

                  <Field
                    className="form-check-input"
                    type="checkbox"
                    name="driversLicense"
                    onChange={({ target: { checked } }) => {
                      setFieldValue("driversLicense", checked);
                    }}
                  />
                </div>

                <div className="form-check">
                  <label className="form-check-label">
                    Manitoba Health Card
                  </label>

                  <Field
                    className="form-check-input"
                    type="checkbox"
                    name="healthCard"
                    onChange={({ target: { checked } }) => {
                      setFieldValue("healthCard", checked);
                    }}
                  />
                </div>

                <div className="form-check">
                  <label className="form-check-label">Status Card</label>
                  <Field
                    className="form-check-input"
                    type="checkbox"
                    name="statusCard"
                    onChange={({ target: { checked } }) => {
                      setFieldValue("statusCard", checked);
                    }}
                  />
                </div>

                <div className="form-check">
                  <label className="form-check-label">Enhanced I.D.</label>
                  <Field
                    className="form-check-input"
                    type="checkbox"
                    name="enhancedID"
                    onChange={({ target: { checked } }) => {
                      setFieldValue("enhancedID", checked);
                    }}
                  />
                </div>

                <div className="form-check">
                  <label className="form-check-label">Student I.D.</label>
                  <Field
                    className="form-check-input"
                    type="checkbox"
                    name="studentID"
                    onChange={({ target: { checked } }) => {
                      setFieldValue("studentID", checked);
                    }}
                  />
                </div>
              </div>
            </Col>
          </Row>

          <Row>
            <h4 className="text-dark">Financial Information:</h4>
          </Row>

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
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
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
            <Col md={3}>
              <InputField
                name="caseWorkerFullName"
                label="Case Worker's Full Name:"
                placeholder="Jimmy"
              />
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <div>
                <label htmlFor="caseWorkerPhoneNumber">
                  Case Worker Phone Number:
                </label>
                <Field
                  type="number"
                  id="caseWorkerPhoneNumber"
                  name="caseWorkerPhoneNumber"
                />
                <ErrorMessage
                  name="caseWorkerPhoneNumber"
                  component={() => (
                    <p className={styles.errorText}>
                      {errors.caseWorkerPhoneNumber}
                    </p>
                  )}
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
                    <p className={styles.errorText}>{errors.caseWorkerEmail}</p>
                  )}
                />
              </div>
            </Col>
          </Row>

          <Row>
            <h4 className="text-dark">Other Information:</h4>
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

          <Row>
            <Col>
              <label>
                The First Nations Family Advocate Office (FNFAO) Rites of
                Passage Stream of Service strives to provide the best possible
                advocacy and support services to First Nations youth who are
                experiencing difficulties and high stress on their emotional,
                physical, mental, and spiritual well-being. To best help youth
                clients to meet their needs, we will gather information that
                will aid in our ability to provide efficient services and life
                coaching. We expect honest and accurate information to best help
                youth clients.
                <br />
                <br />I declare that the information provided in this Youth
                Intake Form is accurate and truthful to the best of my
                knowledge.
              </label>
              <Field
                as="textarea"
                name="youthIntakeAccurate"
                className={styles.textarea}
                placeholder="Type Name Here"
              />
            </Col>
          </Row>

          <button type="submit" className={styles.submitButton}>
            Send Pre-Intake
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

"use client";
import React, { useState } from "react";
import UserHome from "../user-home/page";
import styles from "./fullIntake.module.css";
import { Formik, Form, Field, ErrorMessage, FieldArray  } from "formik";
import { Button, Container, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

import InputField from "@/components/InputField";
import ReferredBySelect from "@/components/ReferredBySelect";
import ProvincesSelect from "@/components/ProvincesSelect";
import RelationshipToChildrenSelect from "@/components/RelationshipToChildrenSelect";
import StatusCFSFileSelect from "@/components/StatusCFSFileSelect";
import FirstNationSelect from "@/components/FirstNationSelect";

import supabase from "../../lib/supabase";

import {Tabs, TabList, Tab, TabPanel} from 'react-tabs';
import 'react-tabs/style/react-tabs.css'


export default function FullIntake() {
    return (
        <UserHome>
            <div className={styles.fullIntakeContainer}>
                <div className={styles.container}>
                    <FullIntakeForm />
                </div>
            </div>
        </UserHome>
    );
}

function FullIntakeForm(){
    return(
        <div>
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
                    otherAdultsInvolved:'no',
                    otherAdultsInvolvedExplained: "",
                    firstNationMembership: "",
                    treatyNumber: "",
                    otherFirstnation: "",
                    ninePersonalHealthNumber: "",
                    sixPersonalHealthNumber: "",
                    onReserve: "",
                    transitionFromReserve: "",
                    previousFNFAOClient: "",
                    seekingAdvocacy: "",
                    cfsAgency: "",
                    cfsAgentFullName: "",
                    cfsAgentNumber: "",
                    cfsAgentEmail: "",
                    statusCFSFile: "",
                    visitsChild:'no',
                    visitsChildFrequency: "",
                    casePlanCopy:'yes',
                    casePlanCopyDescribe: "",
                    involvedCFSReason: "",
                    prenatalSupport:'no',
                    prenatalSupportSpecified: "",
                    housingSupport:'no',
                    housingSupportSpecified: "",
                    addictionsSupport:'no',
                    addictionsSupportSpecified: "",
                    youthSupport:'no',
                    youthSupportSpecified: "",
                    custodySupport:'no',
                    custodySupportSpecified: "",
                    criminalCharges:'no',
                    criminalChargesSpecified: "",
                    activeWarrant:'no',
                    activeWarrantSpecified: "",
                    activeInvestigation:'no',
                    activeInvestigationExplained: "",
                    activeOrders:'no',
                    activeOrdersExplained: "",
                    currentLawyer:'yes',
                    legalAssistance:'no',
                    legalAssistanceSpecified: "",
                    unableToAssistExplained: "",
                    referForSupport : "",
                    children: []

                }}
                validate={(values) => {
                    let errors = {};

                    if (!values.firstName) {
                        errors.firstName = "Please enter a name";
                    } else if (!/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.firstName)) {
                        errors.firstName = "The name can only contain letters and spaces";
                    }

                    if (values.middleName && !/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.middleName)) {
                        errors.middleName = "The middle name can only contain letters and spaces";
                    }

                    if (!values.lastName) {
                        errors.lastName = "Please enter a last name";
                    } else if (!/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.lastName)) {
                        errors.lastName = "The last name can only contain letters and spaces";
                    }

                    if (!values.dateOfBirth) {
                        errors.dateOfBirth = "Please select a birth date";
                    }else {
                        const birthDate = new Date(values.dateOfBirth);
                        const currentYear = new Date().getFullYear();
                        const birthYear = birthDate.getFullYear();

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

                    if (!values.phoneNumber) {
                        errors.phoneNumber = "Please enter a phone number";
                    }

                    const addressRegex = /^[a-zA-Z0-9\s,.-]*$/;
                    if (!values.address) {
                        errors.address = "Please enter an address";
                    } else if (!addressRegex.test(values.address)) {
                        errors.address = "The address contains invalid characters";
                    }

                    if (!values.city) {
                        errors.city = "Please enter a city";
                    } else if (!/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.city)) {
                        errors.city = "The city can only contain letters and spaces";
                    }

                    if (!values.province) {
                        errors.province = "Please select a province";
                    }

                    if (values.postalCode && !/^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(values.postalCode)) {
                        errors.postalCode = "Invalid postal code format (e.g., A1A 1A1)";
                    }

                    if (!values.email) {
                        errors.email = "Please enter an email";
                    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
                        errors.email = "Invalid email format";
                    }

                    if (!values.emergencyContactFirstName) {
                        errors.emergencyContactFirstName = "Please provide an emergency contact first name.";
                    }

                    if (!values.emergencyContactLastName) {
                        errors.emergencyContactLastName = "Please provide an emergency contact last name.";
                    }

                    if (!values.emergencyContactNumber) {
                        errors.emergencyContactNumber = "Please provide an emergency contact phone.";
                    }

                    if (!values.relationshipToChildren) {
                        errors.relationshipToChildren = "Please provide a relationship with the child(ren).";
                    }

                    if (values.otherAdultsInvolved === true && !values.otherAdultsInvolvedExplained.trim()) {
                        errors.otherAdultsInvolvedExplained = "Please specify the other involved adult(s)";
                    }

                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.cfsAgentEmail)) {
                        errors.cfsAgentEmail = "Invalid email format";
                    }

                    return errors;
                }}
                onSubmit={(values, { resetForm }) => {
                    console.log(values);
                    setFormSent(true);
                    resetForm();
                    setTimeout(() => setFormSent(false), 3000);
                }}

            >
            {({ values, errors }) => (
                <Form className={styles.form}>
                    <h2 className={styles.centeredTitle}>FULL-INTAKE FORM</h2>
                    <Row >
                        <Col md={3}>
                            <InputField name="firstName" label="First Name:" placeholder="John" error={errors.firstName} />
                        </Col>

                        <Col md={3}>
                            <InputField name="middleName" label="Middle Name:" error={errors.middleName} />
                        </Col>
                        <Col md={3}>
                            <InputField name="lastName" label="Last Name:" placeholder="Connor" error={errors.lastName} />
                        </Col>

                        <Col md={3}>
                            <div>
                                <label htmlFor="dateOfBirth">Birth Date:</label>
                                <Field type="date" id="dateOfBirth" name="dateOfBirth" />
                                <ErrorMessage name="dateOfBirth" component={() => <p className={styles.errorText}>{errors.dateOfBirth}</p>} />
                            </div>
                        </Col>
                    </Row>

                    <Row >
                        <Col md={3}>
                            <InputField name="address" label="Address:" placeholder="161 Main St, Unit 230" error={errors.address} />
                        </Col>

                        <Col md={3}>
                            <InputField name="city" label="City:" placeholder="Winnipeg" error={errors.city} />
                        </Col>

                        <Col md={4}>
                            <ProvincesSelect name="province" label="Province:" error={errors.province}/>
                        </Col>

                        <Col md={2}>
                            <InputField name="postalCode" label="Postal code:" placeholder="R3C 0V8" error={errors.postalCode} />
                        </Col>
                    </Row>

                    <Row>
                        <Col md={3}>
                            <div>
                                <label htmlFor="phoneNumber">Phone Number:</label>
                                <Field type="number" id="phoneNumber" name="phoneNumber" />
                                <ErrorMessage name="phoneNumber" component={() => <p className={styles.errorText}>{errors.phoneNumber}</p>} />
                            </div>
                        </Col>

                        <Col md={4}>
                            <div>
                                <label htmlFor="email">Email:</label>
                                <Field type="email" id="email" name="email" />
                                <ErrorMessage name="email" component={() => <p className={styles.errorText}>{errors.email}</p>} />
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Tabs className={styles.customTab}>
                            <TabList >
                                <Tab href="/generalInfo" onClick={() => console.log("Tab 1 clicked!")}>General Information</Tab>
                                <Tab href="/cfs" onClick={() => console.log("Tab 2 clicked!")}>CFS</Tab>
                                <Tab href="/childrenInfo" onClick={() => console.log("Tab 3 clicked!")}>Children Information</Tab>
                                <Tab href="/community" onClick={() => console.log("Tab 4 clicked!")}>Community Housing</Tab>
                                <Tab href="/employment" onClick={() => console.log("Tab 5 clicked!")}>Employment</Tab>
                                <Tab href="/caseNotes" onClick={() => console.log("Tab 6 clicked!")}>Case Notes</Tab>
                                <Tab href="/legalNotes" onClick={() => console.log("Tab 7 clicked!")}>Legal Notes</Tab>
                            </TabList>
                            <TabPanel>Tab panel 1

                            </TabPanel>
                            <TabPanel>Tab panel 2   </TabPanel>
                            <TabPanel>Tab panel 3   </TabPanel>
                            <TabPanel>Tab panel 4   </TabPanel>
                            <TabPanel>Tab panel 5   </TabPanel>
                            <TabPanel>Tab panel 6   </TabPanel>
                            <TabPanel>Tab panel 7   </TabPanel>
                        </Tabs>

                    </Row>

                </Form>
            )}
            </Formik>




        </div>
    );
}
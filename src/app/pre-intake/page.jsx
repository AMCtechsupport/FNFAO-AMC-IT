"use client";
import React, { useState } from "react";
import UserHome from "../user-home/page";
import styles from "./preIntake.module.css";
import { Formik, Form, Field, ErrorMessage, FieldArray  } from "formik";
import { Button, Container, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

import {insertPreIntake} from "../actions/pre-intakeActions"


export default function PreIntake() {
    return (
        <UserHome>
            <div className={styles.preIntakeContainer}>
                <div className={styles.container}>
                    {/* <h2 className={styles.centeredTitle}>PRE-INTAKE FORM</h2> */}
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
                dateOfBirth: "",
                phoneNumber: "",
                address: "",
                city: "",
                province: "",
                postalCode: "",
                email: "",
                emergencyContactName: "",
                emergencyContactNumber: "",
                referredBy: "",
                relationshipToChildren: "",
                otherAdultsInvolved: 'no',
                otherAdultsInvolvedExplained:"",
                firstNationMembership:"",
                treatyNumber:"",
                otherFirstnation:"",
                ninePersonalHealthNumber:"",
                sixPersonalHealthNumber:"",
                onReserve:"",
                transitionFromReserve:"",
                previousFNFAOClient:"",
                seekingAdvocacy:"",
                cfsAgency:"",
                cfsAgentFullName:"",
                cfsAgentNumber:"",
                cfsAgentEmail:"",
                visitsChild:'no',
                visitsChildFrequency:"",
                casePlanCopy:"",
                casePlanCopyDescribe:"",
                involvedCFSReason:"",
                prenatalSupport:'no',
                prenatalSupportSpecified:"",
                housingSupport:"",
                housingSupportSpecified:"",
                addictionsSupport:"",
                addictionsSupportSpecified:"",
                youthSupport:"",
                youthSupportSpecified:"",
                custodySupport:"",
                custodySupportSpecified:"",
                criminalCharges:"",
                criminalChargesSpecified:"",
                activeWarrant:"",
                activeWarrantSpecified:"",
                activeInvestigation:"",
                activeInvestigationExplained:"",
                activeOrders:"",
                activeOrdersExplained:"",
                currentLawyer:"",
                legalAssistance:"",
                legalAssistanceSpecified:"",
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
                    const birthMonth = birthDate.getMonth() + 1; // Los meses empiezan desde 0 (enero es 0, diciembre es 11)
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

                if (!values.emergencyContactName) {
                    errors.emergencyContactName = "Please provide an emergency contact name.";
                }

                if (!values.emergencyContactNumber) {
                    errors.emergencyContactNumber = "Please provide an emergency contact phone.";
                }

                if (!values.relationshipToChildren) {
                    errors.relationshipToChildren = "Please provide a relationship with the child(ren).";
                }

                if (values.otherAdultsInvolved === "yes" && !values.otherAdultsInvolvedExplained.trim()) {
                    errors.otherAdultsInvolvedExplained = "Please specify the other involved adult(s)";
                }


                return errors;
            }}
            onSubmit={async (values, { resetForm }) => {
                console.log(values);

                try {
                    await insertPreIntake(values);
                    setMessage("pre-intake successfully added");
                    setFormSent(true);
                    resetForm();
                    setTimeout(() => setFormSent(false), 3000);
                } catch (error){
                    setMessage ("Error:" + error.message);
                }

            }}
        >
            {({ values, errors }) => (
                <Form className={styles.form}>
                    <h2 className={styles.centeredTitle}>PRE-INTAKE FORM</h2>
                    <Row>
                    <h4 className="text-dark">General Information</h4>
                        <Col>
                        </Col>

                        <Col  md={4}>
                            <div>
                                <label htmlFor="referredBy">How did the client learn about FNFAO?</label>
                                <Field as="select" name="referredBy" className={styles.select}>
                                    <option value="">Select an option</option>
                                    <option value="family_friend">By family/friend</option>
                                    <option value="online">Online (social media, web etc.)</option>
                                    <option value="referral">Third-Party Referral</option>
                                    <option value="walk_in">Walk-in</option>
                                    <option value="fnfao_management">By FNFAO Management</option>
                                    <option value="first_nation_chief">By Their First Nation/Chief</option>
                                </Field>
                            </div>
                        </Col>
                    </Row>

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
                            <div>
                                <label htmlFor="province">Province:</label>
                                <Field as="select" name="province" className={styles.select}>
                                    <option value="">Select a province</option>
                                    <option value="alberta">Alberta</option>
                                    <option value="british_columbia">British Columbia</option>
                                    <option value="manitoba">Manitoba</option>
                                    <option value="new_brunswick">New Brunswick</option>
                                    <option value="newfoundland_and_labrador">Newfoundland and Labrador</option>
                                    <option value="northwest_territories">Northwest Territories</option>
                                    <option value="nova_scotia">Nova Scotia</option>
                                    <option value="nunavut">Nunavut</option>
                                    <option value="ontario">Ontario</option>
                                    <option value="prince_edward_island">Prince Edward Island</option>
                                    <option value="quebec">Quebec</option>
                                    <option value="saskatchewan">Saskatchewan</option>
                                    <option value="yukon">Yukon</option>
                                </Field>
                            </div>
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

                    <Row className={styles.group}>
                        <h6>Emergency Contact</h6>
                        <Col>
                            <InputField name="emergencyContactName" label="Full Name:" placeholder="" error={errors.emergencyContactName} />
                        </Col>

                        <Col>
                            <div>
                                <label htmlFor="emergencyContactNumber">Phone Number:</label>
                                <Field type="number" id="emergencyContactNumber" name="emergencyContactNumber" />
                                <ErrorMessage name="emergencyContactNumber" component={() => <p className={styles.errorText}>{errors.emergencyContactNumber}</p>} />
                            </div>
                        </Col>
                    </Row>


                    {/* About you */}
                    <Row>
                        <h4 className="text-dark">About You</h4>
                        <Col md={4}>
                            <div>
                                <label htmlFor="relationshipToChildren">What is your relationshipToChildren to the child(ren)?</label>
                                <Field as="select" name="relationshipToChildren" className={styles.select}>
                                    <option value="">Select an option</option>
                                    <option value="parent">Parent</option>
                                    <option value="guardian">Grandparend</option>
                                    <option value="guardian">Child-in-Care</option>
                                    <option value="guardian">Foster Parent</option>
                                    <option value="guardian">Family Member</option>
                                    <option value="guardian">Guardian</option>
                                    <option value="other">Other</option>
                                </Field>
                            </div>
                        </Col>
                    </Row>

                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Are there any other adults involved in your matter?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="otherAdultsInvolved" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="otherAdultsInvolved" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="otherAdultsInvolved" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.otherAdultsInvolved === "yes" && (

                            <Col md={8}>
                                <label>Please specify:</label>
                                <Field as="textarea" name="otherAdultsInvolvedExplained" className={styles.textarea} />
                                <ErrorMessage name="otherAdultsInvolvedExplained" component="div" className={styles.errorText} />
                            </Col>
                        )}

                    </Row>

                    <Row>
                        <Col md={4}>
                            <FirstNationSelect name="firstNationMembership" label="First Nation Membership:" error={errors.firstNationMembership}/>
                           </Col>
                        <Col md={4}>
                            <InputField name="treatyNumber" label="Treaty Number:" placeholder="" error={errors.treatyNumber} />

                        </Col>
                        <Col md={4}>
                            <FirstNationSelect name="otherFirstnation" label="Other First Nation:" error={errors.otherFirstnation}/>
                        </Col>
                    </Row>

                    <Row className={styles.group}>
                        <Col md={4}>
                            <label>Personal Health Identification Numbers</label>
                            <Field type="number" id="ninePersonalHealthNumber" placeholder="000 000 000" name="ninePersonalHealthNumber" />
                            <ErrorMessage name="ninePersonalHealthNumber" component={() => <p className={styles.errorText}>{errors.ninePersonalHealthNumber}</p>} />
                        </Col>
                        <Col md={2}>
                            <label>6-Digit:</label>
                            <Field type="number" id="sixPersonalHealthNumber" placeholder="000000" name="sixPersonalHealthNumber" />
                            <ErrorMessage name="sixPersonalHealthNumber" component={() => <p className={styles.errorText}>{errors.sixPersonalHealthNumber}</p>} />
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                            <div>
                                <label>Are you living on or off reserve?  </label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="onReserve" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="onReserve" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="onReserve" component="div" className={styles.onReserve} />
                            </div>
                        </Col>
                        <Col md={4}>
                            <div>
                                <label>Have you transitioned from a reserve to the city recently?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="transitionFromReserve" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="transitionFromReserve" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="transitionFromReserve" component="div" className={styles.transitionFromReserve} />
                            </div>
                        </Col>
                        <Col md={4}>
                            <div>
                                <label>Are you a previous client of FNFAO?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="previousFNFAOClient" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="previousFNFAOClient" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="previousFNFAOClient" component="div" className={styles.previousFNFAOClient} />
                            </div>
                        </Col>
                    </Row>

                    <Row  className={styles.group}>
                        <Col>
                            <label>Why are you seeking advocacy today?</label>
                            <Field as="textarea" name="seekingAdvocacy" className={styles.textarea} />
                            <ErrorMessage name="seekingAdvocacy" component="div" className={styles.errorText} />
                        </Col>
                    </Row>

                    {/* About your children */}
                    <Row>
                        <h4 className="text-dark">About Your Children</h4>

                        <FieldArray name="children">
                            {({ push, remove }) => (
                                <div>
                                    {values.children.map((child, index) => (
                                        <div key={index} className="border rounded p-2 mb-1 bg-light" >
                                            <Row className="align-items-center">
                                                <Col md={4}>
                                                    <InputField name={`children.${index}.childFullName`} label="Full Name:" />
                                                </Col>
                                                <Col md={2}>
                                                    <div>
                                                        <label htmlFor={`children.${index}.childDateOfBirth`}>Date of Birth:</label>
                                                        <Field type="date" id={`children.${index}.childDateOfBirth`} name={`children.${index}.childDateOfBirth`} />
                                                        <ErrorMessage
                                                            name={`children.${index}.childDateOfBirth`}
                                                            component={() => <p className={styles.errorText}>{errors.children?.[index]?.childDateOfBirth}</p>}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col md={3}>
                                                    <FirstNationSelect name={`children.${index}.childNation`} label="First Nation Membership:" error={errors.childNation}/>
                                                </Col>
                                                <Col md={2}>
                                                    <InputField name={`children.${index}.childPlaced`} label="Place of Stay:" />
                                                </Col>
                                                <Col md={1} className="d-flex align-items-end">
                                                    <Button className="w-100 h-100" variant="danger" type="button" onClick={() => remove(index)}>Delete</Button>
                                                </Col>
                                            </Row>
                                        </div>
                                    ))}
                                    <Button type="button" onClick={() => push({ childFullName: "", childDateOfBirth: "", childNation: "", childPlaced: "" })}>
                                        + Add Child
                                    </Button>
                                </div>
                            )}
                        </FieldArray>

                    </Row>

                    {/* Agency information */}
                    <Row>
                        <h4 className="text-dark">Agency Information</h4>
                        <Col>
                            <InputField name="cfsAgency:" label="CFS Agency Name:" placeholder="" error={errors.cfsAgency} />
                        </Col>
                        <Col>
                            <InputField name="cfsAgentFullName:" label="Agency Worker’s Full Name:" placeholder="" error={errors.cfsAgentFullName} />
                        </Col>
                        <Col md={4}>
                            <div>
                                <label htmlFor="cfsAgentNumber">Phone Number:</label>
                                <Field type="number" id="cfsAgentNumber" name="cfsAgentNumber" />
                                <ErrorMessage name="cfsAgentNumber" component={() => <p className={styles.errorText}>{errors.cfsAgentNumber}</p>} />
                            </div>
                        </Col>

                    </Row>

                    <Row>
                        <Col md={4}>
                            <div>
                                <label htmlFor="cfsAgentEmail">Email:</label>
                                <Field type="email" id="cfsAgentEmail" name="cfsAgentEmail" />
                                <ErrorMessage name="cfsAgentEmail" component={() => <p className={styles.errorText}>{errors.cfsAgentEmail}</p>} />
                            </div>
                        </Col>
                        <Col  md={4}>
                            <div>
                                <label htmlFor="cfs_Status">CFS File Status:</label>
                                <Field as="select" name="cfs_Status:" className={styles.select}>
                                    <option value="">Select an option</option>
                                    <option value="temporary">Temporary</option>
                                    <option value="Permanent">Permanent</option>
                                    <option value="place_safety">Place of Safety</option>
                                </Field>
                            </div>
                        </Col>
                    </Row>
                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Do you currently have visits with
                                your children?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="visitsChild" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="visitsChild" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="visitsChild" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.visitsChild === "yes" && (

                            <Col md={8}>
                                <label>If yes, how often?</label>
                                <Field as="textarea" name="visitsChildFrequency" className={styles.textarea} />
                                <ErrorMessage name="visitsChildFrequency" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>
                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Do you have a copy of your case plan(s)?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="casePlanCopy" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="casePlanCopy" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="casePlanCopy" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.casePlanCopy === "no" && (

                            <Col md={8}>
                                <label>If no, describe the last requests the agency asked you to complete to get your children home:</label>
                                <Field as="textarea" name="casePlanCopyDescribe" className={styles.textarea} />
                                <ErrorMessage name="casePlanCopyDescribe" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>
                    <Row  className={styles.group}>
                        <Col>
                            <label>Reason for CFS involvement with your family:</label>
                            <Field as="textarea" name="involvedCFSReason" className={styles.textarea} />
                            <ErrorMessage name="involvedCFSReason" component="div" className={styles.errorText} />
                        </Col>
                    </Row>

                     {/* Other questions */}
                    <Row>
                        <h4 className="text-dark">Other Questions</h4>
                    </Row>
                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Need prenatal support?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="prenatalSupport" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="prenatalSupport" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="prenatalSupport" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.prenatalSupport === "yes" && (

                            <Col md={8}>
                                <label>If yes, specify (e.g. help avoiding birth apprehension, access to prenatal care, breastfeeding information, preparing for baby, etc.):</label>
                                <Field as="textarea" name="prenatalSupportSpecified" className={styles.textarea} />
                                <ErrorMessage name="prenatalSupportSpecified" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>

                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Need housing support?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="housingSupport" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="housingSupport" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="housingSupport" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.housingSupport === "yes" && (

                            <Col md={8}>
                                <label>If yes, specify (e.g. urgent housing, preventing eviction, dealing with the Residential Tenancies Branch, etc):</label>
                                <Field as="textarea" name="housingSupportSpecified" className={styles.textarea} />
                                <ErrorMessage name="housingSupportSpecified" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>

                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Need addictions support?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="addictionsSupport" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="addictionsSupport" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="addictionsSupport" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.addictionsSupport === "yes" && (

                            <Col md={8}>
                                <label>If yes, specify (e.g. access to detox, treatment, relapse prevention programming, etc.):</label>
                                <Field as="textarea" name="addictionsSupportSpecified" className={styles.textarea} />
                                <ErrorMessage name="addictionsSupportSpecified" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>

                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Need youth support for you/your children?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="youthSupport" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="youthSupport" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="youthSupport" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.youthSupport === "yes" && (

                            <Col md={8}>
                                <label>If yes, specify (e.g. help avoiding birth apprehension, access to prenatal care, breastfeeding information, preparing for baby, etc.):</label>
                                <Field as="textarea" name="youthSupportSpecified" className={styles.textarea} />
                                <ErrorMessage name="youthSupportSpecified" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>

                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Need custody-related support?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="custodySupport" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="custodySupport" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="custodySupport" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.custodySupport === "yes" && (

                            <Col md={8}>
                                <label>If yes, specify (e.g. ex-spouse not honouring custody arrangement for access/visitation, grandparent access, child support, etc:)</label>
                                <Field as="textarea" name="custodySupportSpecified" className={styles.textarea} />
                                <ErrorMessage name="custodySupportSpecified" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>

                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Do you have any criminal charges (past, active or pending)?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="criminalCharges" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="criminalCharges" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="criminalCharges" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.criminalCharges === "yes" && (

                            <Col md={8}>
                                <label>If yes, please specify why: </label>
                                <Field as="textarea" name="criminalChargesSpecified" className={styles.textarea} />
                                <ErrorMessage name="criminalChargesSpecified" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>

                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Do you currently have an active arrest warrant?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="activeWarrant" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="activeWarrant" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="activeWarrant" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.activeWarrant === "yes" && (

                            <Col md={8}>
                                <label>If yes, please specify why: </label>
                                <Field as="textarea" name="activeWarrantSpecified" className={styles.textarea} />
                                <ErrorMessage name="activeWarrantSpecified" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>

                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Are you currently under child abuse investigation?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="activeInvestigation" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="activeInvestigation" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="activeInvestigation" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.activeInvestigation === "yes" && (

                            <Col md={3}>
                                <label>If yes, start date: </label>
                                <Field type="date" id="activeInvestigationExplained" name="activeInvestigationExplained" />
                                <ErrorMessage name="activeInvestigationExplained" component={() => <p className={styles.errorText}>{errors.activeInvestigationExplained}</p>} />
                            </Col>
                        )}
                    </Row>

                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Any active No Contact Orders or Protection Orders?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="activeOrders" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="activeOrders" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="activeOrders" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.activeOrders === "yes" && (

                            <Col md={8}>
                                <label>If yes, against who or against you?</label>
                                <Field as="textarea" name="activeOrdersExplained" className={styles.textarea} />
                                <ErrorMessage name="activeOrdersExplained" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>

                    <Row className={styles.group}>
                        <Col md={3}>
                            <div>
                                <label>Do you have a lawyer?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="currentLawyer" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="currentLawyer" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="currentLawyer" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.currentLawyer === "no" && (
                            <>
                                <Col md={3}>
                                    <div>
                                        <label>If no, need legal assistance?</label>
                                        <div className="form-check form-check-inline">
                                            <Field  className="form-check-input" type="radio" name="legalAssistance" value="yes" />
                                            <label className="form-check-label">Yes</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <Field  className="form-check-input" type="radio" name="legalAssistance" value="no" />
                                            <label className="form-check-label">No</label>
                                        </div>
                                        <ErrorMessage name="legalAssistance" component="div" className={styles.errorText} />
                                    </div>
                                </Col>
                                {values.legalAssistance === "yes" && (
                                <Col md={6}>
                                        <label>If yes, specify:</label>
                                        <Field as="textarea" name="legalAssistanceSpecified" className={styles.textarea} />
                                        <ErrorMessage name="legalAssistanceSpecified" component="div" className={styles.errorText} />
                                </Col>
                                )}
                            </>
                        )}
                    </Row>



                    <button type="submit" className={styles.submitButton}>Send Pre-Intake</button>
                    {formSent && <p className={styles.successfulText}>Pre-intake sent successfully</p>}
                </Form>
            )}
        </Formik>

    );
}

function InputField({ name, label, placeholder, error }) {
    return (
        <div>
            <label htmlFor={name}>{label}</label>
            <Field  type="text" id={name} name={name} placeholder={placeholder} />
            <ErrorMessage name={name} component={() => <p className={styles.errorText}>{error}</p>} />
        </div>
    );
}

function FirstNationSelect({name, label, error }){
    return(
        <div>
            <label htmlFor="province">{label}:</label>
            <Field as="select" name={name} className={styles.select}>
                <option value="">Select a first nation</option>
                <option value="barren_lands">Barren Lands First Nation (Brochet)</option>
                <option value="berens_river">Berens River First Nation</option>
                <option value="birdtail_sioux">Birdtail Sioux Dakota Nation</option>
                <option value="black_river">Black River First Nation</option>
                <option value="bloodvein">Bloodvein First Nation</option>
                <option value="brokenhead">Brokenhead Ojibway Nation</option>
                <option value="buffalo_point">Buffalo Point First Nation</option>
                <option value="bunibonibee">Bunibonibee Cree Nation</option>
                <option value="canupawakpa">Canupawakpa Dakota Nation</option>
                <option value="chemawawin">Chemawawin Cree Nation</option>
                <option value="cross_lake">Cross Lake (Pimicikamak) First Nation</option>
                <option value="dakota_plains">Dakota Plains Wahpeton Nation</option>
                <option value="dakota_tipi">Dakota Tipi First Nation</option>
                <option value="dauphin_river">Dauphin River First Nation</option>
                <option value="ebb_and_flow">Ebb and Flow First Nation</option>
                <option value="fisher_river">Fisher River Cree Nation</option>
                <option value="fox_lake">Fox Lake Cree Nation</option>
                <option value="gamblers">Gambler's First Nation</option>
                <option value="garden_hill">Garden Hill First Nation</option>
                <option value="gods_lake">God's Lake First Nation</option>
                <option value="hollow_water">Hollow Water First Nation</option>
                <option value="keeseekoowenin">Keeseekoowenin Ojibway Nation</option>
                <option value="kinonjeoshtegon">Kinonjeoshtegon First Nation (Jackhead)</option>
                <option value="lake_manitoba">Lake Manitoba Treaty 2 First Nation (Dog Creek)</option>
                <option value="lake_st_martin">Lake St. Martin First Nation</option>
                <option value="little_grand_rapids">Little Grand Rapids First Nation</option>
                <option value="little_saskatchewan">Little Saskatchewan First Nation</option>
                <option value="long_plain">Long Plain First Nation</option>
                <option value="manto_sipi">Manto Sipi Cree Nation (God's River)</option>
                <option value="marcel_colomb">Marcel Colomb First Nation (Black Sturgeon)</option>
                <option value="misipawistik">Misipawistik Cree Nation (Grand Rapids)</option>
                <option value="mosakahiken">Mosakahiken Cree Nation (Moose Lake)</option>
                <option value="nisichawayasihk">Nisichawayasihk Cree Nation (Nelson House)</option>
                <option value="northlands_denesuline">Northlands Denesuline First Nation (Lac Brochet)</option>
                <option value="norway_house">Norway House Cree Nation</option>
                <option value="o_chi_chak_ko_sipi">O-Chi-Chak-Ko-Sipi First Nation (Crane River)</option>
                <option value="opaskwayak">Opaskwayak Cree Nation</option>
                <option value="o_pipon_na_piwin">O-Pipon-Na-Piwin Cree Nation (South Indian Lake)</option>
                <option value="pauingassi">Pauingassi First Nation</option>
                <option value="peguis">Peguis First Nation</option>
                <option value="pinaymootang">Pinaymootang First Nation (Fairford)</option>
                <option value="pine_creek">Pine Creek First Nation</option>
                <option value="poplar_river">Poplar River First Nation</option>
                <option value="pukatawagan">Pukatawagan Cree Nation (Mathias Colomb)</option>
                <option value="red_sucker_lake">Red Sucker Lake First Nation</option>
                <option value="rolling_river">Rolling River First Nation</option>
                <option value="roseau_river">Roseau River Anishinabe First Nation</option>
                <option value="sagkeeng">Sagkeeng First Nation</option>
                <option value="sandy_bay">Sandy Bay First Nation</option>
                <option value="sapotaweyak">Sapotaweyak Cree Nation (Pelican Rapids)</option>
                <option value="sayisi_dene">Sayisi Dene First Nation (Tadoule Lake)</option>
                <option value="shamattawa">Shamattawa First Nation</option>
                <option value="sioux_valley">Sioux Valley First Nation</option>
                <option value="skownan">Skownan First Nation</option>
                <option value="st_theresa_point">St. Theresa Point First Nation</option>
                <option value="swan_lake">Swan Lake First Nation</option>
                <option value="tataskweyak">Tataskweyak Cree Nation</option>
                <option value="tootinaowaziibeeng">Tootinaowaziibeeng Treaty Reserve (Valley River)</option>
                <option value="war_lake">War Lake First Nation</option>
                <option value="wasagamack">Wasagamack First Nation</option>
                <option value="waywayseecappo">Waywayseecappo First Nation</option>
                <option value="wuskwi_sipihk">Wuskwi Sipihk First Nation (Swampy Cree)</option>
                <option value="york_factory">York Factory First Nation</option>
                <option value="non_status">Non-Status</option>
                <option value="metis">Metis</option>
                <option value="na">N/A</option>
                <option value="other">Other</option>
            </Field>
        </div>
    )
}

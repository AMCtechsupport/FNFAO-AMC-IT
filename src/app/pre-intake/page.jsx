"use client";
import React, { useState } from "react";
import UserHome from "../user-home/page";
import styles from "./preIntake.module.css";
import { Formik, Form, Field, ErrorMessage, FieldArray  } from "formik";
import { Button, Container, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';


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
                first_name: "",
                middle_name: "",
                last_name: "",
                birth_date: "",
                telephone: "",
                address: "",
                city: "",
                province: "",
                postal_code: "",
                email: "",
                emergency_contact_name: "",
                emergency_contact_phone: "",
                howClientFoundFNFAO: "",
                relationship: "",
                other_adults_involved: 'no',
                yes_involved_adults:"",
                first_nation_membership:"",
                treaty_number:"",
                other_first_nation:"",
                living_on_off_reserve:"",
                is_new_city_resident:"",
                previous_client:"",
                why_seeking_advocacy:"",
                cfs_agency_name:"",
                agency_worker_name:"",
                agency_contact_phone:"",
                agency_email:"",
                visit_children:'no',
                yes_visit_children:"",
                case_plan_copy:"",
                no_case_plan_copy:"",
                cfs_involvement_reason:"",
                prenatal_support:'no',
                yes_prenatal_support:"",
                housing_support:"",
                yes_housing_support:"",
                addictions_support:"",
                yes_addictions_support:"",
                youth_support:"",
                yes_youth_support:"",
                custody_support:"",
                yes_custody_support:"",
                criminal_charges:"",
                yes_criminal_charges:"",
                arrest_warrant:"",
                active_arrest_warrant:"",
                child_abuse_investigation:"",
                active_child_abuse_investigation:"",
                orders:"",
                active_orders:"",
                lawyer:"",
                legal_assistance:"",
                need_legal_assistance:"",
                children: []

            }}
            validate={(values) => {
                let errors = {};

                if (!values.first_name) {
                    errors.first_name = "Please enter a name";
                } else if (!/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.first_name)) {
                    errors.first_name = "The name can only contain letters and spaces";
                }

                if (values.middle_name && !/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.middle_name)) {
                    errors.middle_name = "The middle name can only contain letters and spaces";
                }

                if (!values.last_name) {
                    errors.last_name = "Please enter a last name";
                } else if (!/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.last_name)) {
                    errors.last_name = "The last name can only contain letters and spaces";
                }

                if (!values.birth_date) {
                    errors.birth_date = "Please select a birth date";
                }else {
                    const birthDate = new Date(values.birth_date);
                    const currentYear = new Date().getFullYear();
                    const birthYear = birthDate.getFullYear();

                    // Year validation
                    if (birthYear > currentYear) {
                        errors.birth_date = "Birth year cannot be in the future";
                    }

                     // Month validation
                    const birthMonth = birthDate.getMonth() + 1; // Los meses empiezan desde 0 (enero es 0, diciembre es 11)
                    if (birthMonth < 1 || birthMonth > 12) {
                        errors.birth_date = "Birth month must be between 01 and 12";
                    }

                    // Day validation
                    const birthDay = birthDate.getDate();
                    if (birthDay < 1 || birthDay > 31) {
                        errors.birth_date = "Birth day must be between 01 and 31";
                    }
                }

                if (!values.telephone) {
                    errors.telephone = "Please enter a telephone";
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

                if (values.postal_code && !/^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(values.postal_code)) {
                    errors.postal_code = "Invalid postal code format (e.g., A1A 1A1)";
                }

                if (!values.email) {
                    errors.email = "Please enter an email";
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
                    errors.email = "Invalid email format";
                }

                if (!values.emergency_contact_name) {
                    errors.emergency_contact_name = "Please provide an emergency contact name.";
                }

                if (!values.emergency_contact_phone) {
                    errors.emergency_contact_phone = "Please provide an emergency contact phone.";
                }

                if (!values.relationship) {
                    errors.relationship = "Please provide a relationship with the child(ren).";
                }

                if (values.other_adults_involved === "yes" && !values.yes_involved_adults.trim()) {
                    errors.yes_involved_adults = "Please specify the other involved adult(s)";
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
                    <h2 className={styles.centeredTitle}>PRE-INTAKE FORM</h2>
                    <Row>
                    <h4 className="text-dark">General Information</h4>
                        <Col>
                        </Col>

                        <Col  md={4}>
                            <div>
                                <label htmlFor="howClientFoundFNFAO">How did the client learn about FNFAO?</label>
                                <Field as="select" name="howClientFoundFNFAO" className={styles.select}>
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
                            <InputField name="first_name" label="First Name:" placeholder="John" error={errors.first_name} />
                        </Col>

                        <Col md={3}>
                            <InputField name="middle_name" label="Middle Name:" error={errors.middle_name} />
                        </Col>
                        <Col md={3}>
                             <InputField name="last_name" label="Last Name:" placeholder="Connor" error={errors.last_name} />
                        </Col>

                        <Col md={3}>
                            <div>
                                <label htmlFor="birth_date">Birth Date:</label>
                                <Field type="date" id="birth_date" name="birth_date" />
                                <ErrorMessage name="birth_date" component={() => <p className={styles.errorText}>{errors.birth_date}</p>} />
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
                            <InputField name="postal_code" label="Postal code:" placeholder="R3C 0V8" error={errors.postal_code} />
                        </Col>
                    </Row>

                    <Row>
                        <Col md={3}>
                            <div>
                                <label htmlFor="telephone">Phone Number:</label>
                                <Field type="number" id="telephone" name="telephone" />
                                <ErrorMessage name="telephone" component={() => <p className={styles.errorText}>{errors.telephone}</p>} />
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
                            <InputField name="emergency_contact_name" label="Name:" placeholder="" error={errors.emergency_contact_name} />
                        </Col>

                        <Col>
                            <div>
                                <label htmlFor="emergency_contact_phone">Phone Number:</label>
                                <Field type="number" id="emergency_contact_phone" name="emergency_contact_phone" />
                                <ErrorMessage name="emergency_contact_phone" component={() => <p className={styles.errorText}>{errors.emergency_contact_phone}</p>} />
                            </div>
                        </Col>
                    </Row>


                    {/* About you */}
                    <Row>
                        <h4 className="text-dark">About You</h4>
                        <Col md={4}>
                            <div>
                                <label htmlFor="relationship">What is your relationship to the child(ren)?</label>
                                <Field as="select" name="relationship" className={styles.select}>
                                    <option value="">Select an option</option>
                                    <option value="parent">Parent</option>
                                    <option value="guardian">Guardian</option>
                                    <option value="relative">Relative</option>
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
                                    <Field  className="form-check-input" type="radio" name="other_adults_involved" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="other_adults_involved" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="other_adults_involved" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.other_adults_involved === "yes" && (

                            <Col md={8}>
                                <label>Please specify:</label>
                                <Field as="textarea" name="yes_involved_adults" className={styles.textarea} />
                                <ErrorMessage name="yes_involved_adults" component="div" className={styles.errorText} />
                            </Col>
                        )}

                    </Row>

                    <Row>
                        <Col md={4}>
                            <InputField className="mb-3" name="first_nation_membership" label="First Nation Membership:" placeholder="" error={errors.first_nation_membership} />
                            <InputField name="health_identification_numbers" label="Personal Health Identification Numbers:" placeholder="" error={errors.health_identification_numbers} />
                        </Col>
                        <Col md={4}>
                            <InputField name="treaty_number" label="Treaty Number:" placeholder="" error={errors.treaty_number} />
                        </Col>
                        <Col md={4}>
                            <InputField name="other_first_nation" label="Other First Nation:" placeholder="" error={errors.other_first_nation} />
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                            <div>
                                <label>Are you living on or off reserve?  </label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="living_on_off_reserve" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="living_on_off_reserve" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="living_on_off_reserve" component="div" className={styles.living_on_off_reserve} />
                            </div>
                        </Col>
                        <Col md={4}>
                            <div>
                                <label>Have you transitioned from a reserve to the city recently?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="is_new_city_resident" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="is_new_city_resident" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="is_new_city_resident" component="div" className={styles.is_new_city_resident} />
                            </div>
                        </Col>
                        <Col md={4}>
                            <div>
                                <label>Are you a previous client of FNFAO?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="previous_client" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="previous_client" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="previous_client" component="div" className={styles.previous_client} />
                            </div>
                        </Col>
                    </Row>

                    <Row  className={styles.group}>
                        <Col>
                            <label>Why are you seeking advocacy today?</label>
                            <Field as="textarea" name="why_seeking_advocacy" className={styles.textarea} />
                            <ErrorMessage name="why_seeking_advocacy" component="div" className={styles.errorText} />
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
                                                    <InputField name={`children.${index}.full_name`} label="Full Name:" />
                                                </Col>
                                                <Col md={2}>
                                                    {/* <InputField name={`children.${index}.date_birth`} label="Date of Birth:" type="date" /> */}
                                                    <div>
                                                        <label htmlFor={`children.${index}.date_birth`}>Date of Birth:</label>
                                                        <Field type="date" id={`children.${index}.date_birth`} name={`children.${index}.date_birth`} />
                                                        <ErrorMessage
                                                            name={`children.${index}.date_birth`}
                                                            component={() => <p className={styles.errorText}>{errors.children?.[index]?.date_birth}</p>}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col md={3}>
                                                    <InputField name={`children.${index}.first_nation_membership`} label="First Nation Membership:" />
                                                </Col>
                                                <Col md={2}>
                                                    <InputField name={`children.${index}.place_of_stay`} label="Place of Stay:" />
                                                </Col>
                                                <Col md={1} className="d-flex align-items-end">
                                                    <Button className="w-100 h-100" variant="danger" type="button" onClick={() => remove(index)}>Delete</Button>
                                                </Col>
                                            </Row>

                                        </div>
                                    ))}
                                    <Button type="button" onClick={() => push({ full_name: "", date_birth: "", first_nation_membership: "", place_of_stay: "" })}>
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
                            <InputField name="cfs_agency_name:" label="CFS Agency Name:" placeholder="" error={errors.cfs_agency_name} />
                        </Col>
                        <Col>
                            <InputField name="agency_worker_name:" label="Agency Worker’s Full Name:" placeholder="" error={errors.agency_worker_name} />
                        </Col>
                        <Col md={4}>
                            <div>
                                <label htmlFor="agency_contact_phone">Phone Number:</label>
                                <Field type="number" id="agency_contact_phone" name="agency_contact_phone" />
                                <ErrorMessage name="agency_contact_phone" component={() => <p className={styles.errorText}>{errors.agency_contact_phone}</p>} />
                            </div>
                        </Col>

                    </Row>

                    <Row>
                        <Col md={4}>
                            <div>
                                <label htmlFor="agency_email">Email:</label>
                                <Field type="email" id="agency_email" name="agency_email" />
                                <ErrorMessage name="agency_email" component={() => <p className={styles.errorText}>{errors.agency_email}</p>} />
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
                                    <Field  className="form-check-input" type="radio" name="visit_children" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="visit_children" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="visit_children" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.visit_children === "yes" && (

                            <Col md={8}>
                                <label>If yes, how often?</label>
                                <Field as="textarea" name="yes_visit_children" className={styles.textarea} />
                                <ErrorMessage name="yes_visit_children" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>
                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Do you have a copy of your case plan(s)?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="case_plan_copy" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="case_plan_copy" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="case_plan_copy" component="div" className={styles.case_plan_copy} />
                            </div>
                        </Col>
                        {values.case_plan_copy === "no" && (

                            <Col md={8}>
                                <label>If no, describe the last requests the agency asked you to complete to get your children home:</label>
                                <Field as="textarea" name="no_case_plan_copy" className={styles.textarea} />
                                <ErrorMessage name="no_case_plan_copy" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>
                    <Row  className={styles.group}>
                        <Col>
                            <label>Reason for CFS involvement with your family:</label>
                            <Field as="textarea" name="cfs_involvement_reason" className={styles.textarea} />
                            <ErrorMessage name="cfs_involvement_reason" component="div" className={styles.errorText} />
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
                                    <Field  className="form-check-input" type="radio" name="prenatal_support" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="prenatal_support" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="prenatal_support" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.prenatal_support === "yes" && (

                            <Col md={8}>
                                <label>If yes, specify (e.g. help avoiding birth apprehension, access to prenatal care, breastfeeding information, preparing for baby, etc.):</label>
                                <Field as="textarea" name="yes_prenatal_support" className={styles.textarea} />
                                <ErrorMessage name="yes_prenatal_support" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>

                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Need housing support?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="housing_support" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="housing_support" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="housing_support" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.housing_support === "yes" && (

                            <Col md={8}>
                                <label>If yes, specify (e.g. urgent housing, preventing eviction, dealing with the Residential Tenancies Branch, etc):</label>
                                <Field as="textarea" name="yes_housing_support" className={styles.textarea} />
                                <ErrorMessage name="yes_housing_support" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>

                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Need addictions support?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="addictions_support" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="addictions_support" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="addictions_support" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.addictions_support === "yes" && (

                            <Col md={8}>
                                <label>If yes, specify (e.g. access to detox, treatment, relapse prevention programming, etc.):</label>
                                <Field as="textarea" name="yes_addictions_support" className={styles.textarea} />
                                <ErrorMessage name="yes_addictions_support" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>

                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Need youth support for you/your children?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="youth_support" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="youth_support" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="youth_support" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.youth_support === "yes" && (

                            <Col md={8}>
                                <label>If yes, specify (e.g. help avoiding birth apprehension, access to prenatal care, breastfeeding information, preparing for baby, etc.):</label>
                                <Field as="textarea" name="yes_youth_support" className={styles.textarea} />
                                <ErrorMessage name="yes_youth_support" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>

                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Need custody-related support?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="custody_support" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="custody_support" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="custody_support" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.custody_support === "yes" && (

                            <Col md={8}>
                                <label>If yes, specify (e.g. ex-spouse not honouring custody arrangement for access/visitation, grandparent access, child support, etc:)</label>
                                <Field as="textarea" name="yes_custody_support" className={styles.textarea} />
                                <ErrorMessage name="yes_custody_support" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>

                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Do you have any criminal charges (past, active or pending)?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="criminal_charges" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="criminal_charges" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="criminal_charges" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.criminal_charges === "yes" && (

                            <Col md={8}>
                                <label>If yes, please specify why: </label>
                                <Field as="textarea" name="yes_criminal_charges" className={styles.textarea} />
                                <ErrorMessage name="yes_criminal_charges" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>

                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Do you currently have an active arrest warrant?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="arrest_warrant" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="arrest_warrant" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="arrest_warrant" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.arrest_warrant === "yes" && (

                            <Col md={8}>
                                <label>If yes, please specify why: </label>
                                <Field as="textarea" name="active_arrest_warrant" className={styles.textarea} />
                                <ErrorMessage name="active_arrest_warrant" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>

                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Are you currently under child abuse investigation?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="child_abuse_investigation" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="child_abuse_investigation" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="child_abuse_investigation" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.child_abuse_investigation === "yes" && (

                            <Col md={3}>
                                <label>If yes, start date: </label>
                                <Field type="date" id="active_child_abuse_investigation" name="active_child_abuse_investigation" />
                                <ErrorMessage name="active_child_abuse_investigation" component={() => <p className={styles.errorText}>{errors.active_child_abuse_investigation}</p>} />
                            </Col>
                        )}
                    </Row>

                    <Row className={styles.group}>
                        <Col md={4}>
                            <div>
                                <label>Any active No Contact Orders or Protection Orders?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="orders" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="orders" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="orders" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.orders === "yes" && (

                            <Col md={8}>
                                <label>If yes, against who or against you?</label>
                                <Field as="textarea" name="active_orders" className={styles.textarea} />
                                <ErrorMessage name="active_orders" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>

                    <Row className={styles.group}>
                        <Col md={3}>
                            <div>
                                <label>Do you have a lawyer?</label>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="lawyer" value="yes" />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field  className="form-check-input" type="radio" name="lawyer" value="no" />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="lawyer" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.lawyer === "no" && (
                            <>
                                <Col md={3}>
                                    <div>
                                        <label>If no, need legal assistance?</label>
                                        <div className="form-check form-check-inline">
                                            <Field  className="form-check-input" type="radio" name="legal_assistance" value="yes" />
                                            <label className="form-check-label">Yes</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <Field  className="form-check-input" type="radio" name="legal_assistance" value="no" />
                                            <label className="form-check-label">No</label>
                                        </div>
                                        <ErrorMessage name="legal_assistance" component="div" className={styles.errorText} />
                                    </div>
                                </Col>
                                {values.legal_assistance === "yes" && (
                                <Col md={6}>
                                        <label>If yes, specify:</label>
                                        <Field as="textarea" name="need_legal_assistance" className={styles.textarea} />
                                        <ErrorMessage name="need_legal_assistance" component="div" className={styles.errorText} />
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

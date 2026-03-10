"use client";
import styles from "../../full-intake/fullIntake.module.css"
import { Field, ErrorMessage, FieldArray } from "formik";
import { Button, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";
import RelationshipToChildrenSelect from "@/components/RelationshipToChildrenSelect";
import StatusCFSFileSelect from "@/components/StatusCFSFileSelect";
import FirstNationSelect from "@/components/FirstNationSelect";
import GenderSelect from "@/components/GenderSelect";
import ManageCfsAgencies from "@/components/ManageCfsAgencies";

import "react-tabs/style/react-tabs.css";

const ChildrenPartition = ({
    childrenData,
    values,
    isEditing,
    errors
}) => {
    return (
        <>
            {values.children.length === 0 ? (
                <p>No children found for this client.</p>
            ) : (
                <>
                    <Row className="mt-1 mb-3">
                        <Col md={4}>
                            <RelationshipToChildrenSelect name="relationshipToChildren" label="What is your relationship to the child(ren)?" error={errors.relationshipToChildren} disabled={!isEditing} />
                        </Col>
                        <Col md={8}></Col>
                    </Row>
                    <Row className={styles.group}>
                        <Col md={5}>
                            <div>
                                <label>Are there any other adults involved in your matter?</label>
                                <div className="form-check form-check-inline">
                                    <Field className="form-check-input" type="radio" name="otherAdultsInvolved" value="yes" checked={values.otherAdultsInvolved === "yes"} disabled={!isEditing} />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field className="form-check-input" type="radio" name="otherAdultsInvolved" value="no" checked={values.otherAdultsInvolved === "no"} disabled={!isEditing} />
                                    <label className="form-check-label">No</label>
                                </div>
                                <ErrorMessage name="otherAdultsInvolved" component="div" className={styles.errorText} />
                            </div>
                        </Col>
                        {values.otherAdultsInvolved === "yes" && (

                            <Col md={12}>
                                <label>Please specify:</label>
                                <Field as="textarea" name="otherAdultsInvolvedExplained" className={styles.textarea} disabled={!isEditing} />
                                <ErrorMessage name="otherAdultsInvolvedExplained" component="div" className={styles.errorText} />
                            </Col>
                        )}
                    </Row>
                </>

            )}

            {/* list of children */}
            <Row className="mb-3">
                <h5 className="text-dark">List of Children</h5>
                <label className="text-dark">(List all children, including those at home or in care):</label>

                <FieldArray name="children">
                    {({ push, remove }) => (
                        <div>
                            {values.children
                                .map((child, originalIndex) => ({ child, originalIndex }))
                                .sort((a, b) => (a.child.child_id ?? Infinity) - (b.child.child_id ?? Infinity))
                                .map(({ child, originalIndex }, displayIndex) => (
                                    <div key={`${child.child_id ?? 'new'}-${originalIndex}`} className={`${styles.bglightgrey} border rounded p-2 mb-3`} >
                                        <Row className="mb-2">
                                            <Col>
                                                <h5>{displayIndex + 1}. </h5>
                                            </Col>
                                        </Row>
                                        <Row className="align-items-center">
                                            <Col md={3}>
                                                <InputField name={`children.${originalIndex}.firstName`} label="First Name:" disabled={!isEditing} />
                                            </Col>
                                            <Col md={3}>
                                                <InputField name={`children.${originalIndex}.middleName`} label="Middle Name:" disabled={!isEditing} />
                                            </Col>
                                            <Col md={6}>
                                                <InputField name={`children.${originalIndex}.lastName`} label="Last Name:" disabled={!isEditing} />
                                            </Col>

                                        </Row>
                                        <Row >
                                            <Col md={3}>
                                                <div>
                                                    <label htmlFor={`children.${originalIndex}.birthDate`}>Date of Birth:</label>
                                                    <Field type="date" id={`children.${originalIndex}.birthDate`} name={`children.${originalIndex}.birthDate`} disabled={!isEditing} />
                                                    <ErrorMessage
                                                        name={`children.${originalIndex}.birthDate`}
                                                        component={() => <p className={styles.errorText}>{errors.children?.[originalIndex]?.birthDate}</p>}
                                                    />
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <Field
                                                    name={`children.${originalIndex}.childNation`}
                                                    component={FirstNationSelect}
                                                    label="First Nation Membership"
                                                    error={errors.childNation}
                                                    disabled={!isEditing}
                                                />
                                            </Col>
                                            <Col md={3}>
                                                <GenderSelect name={`children.${originalIndex}.gender`} label="Gender:" error={errors.gender} disabled={!isEditing} />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <InputField name={`children.${originalIndex}.childPlaced`} label="Place of Stay:" disabled={!isEditing} />
                                            </Col>
                                        </Row>

                                        {/* Agency information */}
                                        <hr className="separator-line" />
                                        <div className="bg-light border border-light p-3 rounded">
                                            <Row>
                                                <h5 className="text-dark">Agency Information</h5>
                                                <Col md={4}>

                                                    <Field
                                                        name={`children.${originalIndex}.childCfsAgency`}
                                                        component={ManageCfsAgencies}
                                                        label="CFS Agency Name:"
                                                        error={<ErrorMessage name={`children.${originalIndex}.childCfsAgency`} component="div" className="text-red-500" />}
                                                        disabled={!isEditing}
                                                        value={child.childCfsAgency}
                                                        onChange={(e) => setFieldValue(`children.${originalIndex}.childCfsAgency`, e.target.value)}
                                                    />
                                                </Col>
                                                <Col md={6}>
                                                    <Field
                                                        name={`children.${originalIndex}.childStatusCfsFile`}
                                                        component={StatusCFSFileSelect}
                                                        label="CFS File Status"
                                                        error={errors.children?.[originalIndex]?.childStatusCfsFile}
                                                        disabled={!isEditing}
                                                        value={child.childStatusCfsFile}
                                                        onChange={(e) => setFieldValue(`children.${originalIndex}.childStatusCfsFile`, e.target.value)}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={4}>
                                                    <InputField name={`children.${originalIndex}.childCfsAgentFullName`} label="Worker's Full Name:" disabled={!isEditing} />
                                                </Col>
                                                <Col md={4}>
                                                    <div>
                                                        <label htmlFor={`children.${originalIndex}.childCfsAgentNumber`}>Worker's Phone Number:</label>
                                                        <Field type="number" id={`children.${originalIndex}.childCfsAgentNumber`} name={`children.${originalIndex}.childCfsAgentNumber`} component={PhoneNumberInput} placeholder="(123) 456-7890" disabled={!isEditing} />
                                                        <ErrorMessage
                                                            name={`children.${originalIndex}.childCfsAgentNumber`}
                                                            component={() => <p className={styles.errorText}>{errors.children?.[originalIndex]?.childCfsAgentNumber}</p>} />
                                                    </div>
                                                </Col>
                                                <Col md={4}>
                                                    <div>
                                                        <label htmlFor={`children.${originalIndex}.childCfsAgentEmail`}>Worker's Email:</label>
                                                        <Field type="email" id={`children.${originalIndex}.childCfsAgentEmail`} name={`children.${originalIndex}.childCfsAgentEmail`} disabled={!isEditing} />
                                                        <ErrorMessage
                                                            name={`children.${originalIndex}.childCfsAgentEmail`}
                                                            component={() => <p className={styles.errorText}>{errors.children?.[originalIndex]?.childCfsAgentEmail}</p>} />
                                                    </div>
                                                </Col>

                                            </Row>

                                            {/* CFS Supervisor information */}
                                            <Row>
                                                <Col md={4}>
                                                    <InputField name={`children.${originalIndex}.childCfsSupervisorFullName`} label="Supervisor Full Name:" disabled={!isEditing} />
                                                </Col>
                                                <Col md={4}>
                                                    <div>
                                                        <label htmlFor={`children.${originalIndex}.childCfsSupervisorNumber`}>Supervisor Phone Number:</label>
                                                        <Field type="number" id={`children.${originalIndex}.childCfsSupervisorNumber`} name={`children.${originalIndex}.childCfsSupervisorNumber`} component={PhoneNumberInput} placeholder="(123) 456-7890" disabled={!isEditing} />
                                                        <ErrorMessage
                                                            name={`children.${originalIndex}.childCfsSupervisorNumber`}
                                                            component={() => <p className={styles.errorText}>{errors.children?.[originalIndex]?.childCfsSupervisorNumber}</p>} />
                                                    </div>
                                                </Col>
                                                <Col md={4}>
                                                    <div>
                                                        <label htmlFor={`children.${originalIndex}.childCfsSupervisorEmail`}>Supervisor Email:</label>
                                                        <Field type="email" id={`children.${originalIndex}.childCfsSupervisorEmail`} name={`children.${originalIndex}.childCfsSupervisorEmail`} disabled={!isEditing} />
                                                        <ErrorMessage
                                                            name={`children.${originalIndex}.childCfsSupervisorEmail`}
                                                            component={() => <p className={styles.errorText}>{errors.children?.[originalIndex]?.childCfsSupervisorEmail}</p>} />
                                                    </div>
                                                </Col>
                                            </Row>

                                        </div>
                                        {/* END Agency information */}

                                        {/* Child medical condition */}
                                        <hr className="separator-line" />
                                        <div className="bg-light border border-light p-3 rounded">
                                            <h5>Child's Medical Information</h5>
                                            <Row className={styles.group}>
                                                <Col md={5}>
                                                    <div>
                                                        <label>Does your child have any medical needs?</label>
                                                        <div className="form-check form-check-inline">
                                                            <Field className="form-check-input" type="radio" name={`children.${originalIndex}.childMedicalNeeds`} value="yes" checked={child.childMedicalNeeds === "yes"} disabled={!isEditing} />
                                                            <label className="form-check-label">Yes</label>
                                                        </div>
                                                        <div className="form-check form-check-inline">
                                                            <Field className="form-check-input" type="radio" name={`children.${originalIndex}.childMedicalNeeds`} value="no" checked={child.childMedicalNeeds === "no"} disabled={!isEditing} />
                                                            <label className="form-check-label">No</label>
                                                        </div>
                                                        <ErrorMessage name={`children.${originalIndex}.childMedicalNeeds`} component="div" className={styles.errorText} />
                                                    </div>
                                                </Col>
                                                {child.childMedicalNeeds === "yes" && (

                                                    <Col md={12}>
                                                        <label>Please specify:</label>
                                                        <Field as="textarea" name={`children.${originalIndex}.childMedicalNeedsExplained`} className={styles.textarea} disabled={!isEditing} />
                                                        <ErrorMessage name={`children.${originalIndex}.childMedicalNeedsExplained`} component="div" className={styles.errorText} />
                                                    </Col>
                                                )}
                                            </Row>
                                        </div>
                                        {/* END Child medical condition */}

                                        {/* Another Biological Parent*/}
                                        <hr className="separator-line" />
                                        <div className="bg-light border border-light p-3 rounded">
                                            <h5>Other Biological Parent Information</h5>
                                            <Row className="align-items-center">
                                                <Col md={3}>
                                                    <InputField name={`children.${originalIndex}.biologicalParentFirstName`} label="First Name:" disabled={!isEditing} />
                                                </Col>
                                                <Col md={3}>
                                                    <InputField name={`children.${originalIndex}.biologicalParentLastName`} label="Last Name:" disabled={!isEditing} />
                                                </Col>
                                                <Col md={6}>
                                                    <Field
                                                        name={`children.${originalIndex}.biologicalParentFirstNation`}
                                                        component={FirstNationSelect}
                                                        label="First Nation Membership"
                                                        error={errors.biologicalParentFirstNation}
                                                        disabled={!isEditing}
                                                    />
                                                </Col>

                                            </Row>
                                        </div>
                                        {/* END Another Biological Parent*/}

                                        <Row>
                                            <Col md={9}></Col>
                                            <Col md={3} className="d-flex align-items-end mt-2">
                                                <Button className="w-100 btn btn-danger opacity-70" type="button" onClick={() => remove(originalIndex)} disabled={!isEditing} >Delete</Button>
                                            </Col>
                                        </Row>

                                    </div>
                                ))}
                            <Button className="btn-dark" type="button" onClick={() =>
                                push({
                                    firstName: "",
                                    middleName: "",
                                    lastName: "",
                                    birthDate: "",
                                    childNation: "",
                                    gender: "",
                                    childPlaced: "",
                                    childCfsAgency: "",
                                    childCfsAgentFullName: "",
                                    childCfsAgentNumber: "",
                                    childCfsAgentEmail: "",
                                    childStatusCfsFile: "",
                                    childCfsSupervisorFullName: "",
                                    childCfsSupervisorNumber: "",
                                    childCfsSupervisorEmail: "",
                                    childMedicalNeeds: "",
                                    childMedicalNeedsExplained: "",
                                    biologicalParentFirstName: "",
                                    biologicalParentLastName: "",
                                    biologicalParentFirstNation: "",
                                })} disabled={!isEditing}>
                                + Add Child
                            </Button>
                        </div>
                    )}
                </FieldArray>
            </Row>
        </>
    );
};

export default ChildrenPartition;
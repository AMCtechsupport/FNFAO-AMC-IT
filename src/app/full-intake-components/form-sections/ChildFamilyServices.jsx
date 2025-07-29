"use client";
import styles from "../../full-intake/fullIntake.module.css"
import { Field, ErrorMessage, FieldArray } from "formik";
import { Button, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";
import "react-tabs/style/react-tabs.css";

const ChildFamilyServicesPartition = ({
    childrenData,
    isEditing,
    values
}) => {
    return (
        <>
            <h5 className="text-dark">CFS Agencies </h5>
            {childrenData.length === 0 ? (
                <p>No children found for this client.</p>
            ) : (
                (() => {
                    // Group children by agency
                    const agenciesMap = new Map();

                    childrenData.forEach(child => {
                        if (!agenciesMap.has(child.childCfsAgency)) {
                            agenciesMap.set(child.childCfsAgency, []);
                        }
                        agenciesMap.get(child.childCfsAgency).push(child);
                    });

                    // Convert Map to an array for rendering
                    const agenciesArray = Array.from(agenciesMap.entries());

                    return (
                        <table className="table table-striped table-bordered">
                            {/* Table header */}
                            <thead className="table-dark">
                                <tr>
                                    <th>CFS Agency</th>
                                    <th>Child Name</th>
                                    <th>CFS Agent</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            {/* Table body with grouped data */}
                            <tbody>
                                {agenciesArray.map(([agency, children]) =>
                                    children.map((child, index) => (
                                        <tr key={child.child_id}>
                                            {/* Show agency name only on the first row of the group */}
                                            {index === 0 && (
                                                <td rowSpan={children.length}>{agency || "N/A"}</td>
                                            )}
                                            <td>{child.firstName} {child.lastName}</td>
                                            <td>{child.childCfsAgentFullName || "N/A"}</td>
                                            <td>{child.childStatusCfsFile || "N/A"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    );
                })()
            )}

            <hr className="separator-line" />

            {/* Agency Worker's table */}
            <h5 className="text-dark">Agency Worker </h5>
            {childrenData.length > 0 && (() => {
                // Extract unique agents from childrenData
                const uniqueAgents = Array.from(
                    new Map(
                        childrenData
                            .filter(child => child.childCfsAgentFullName)
                            .map(child => [child.childCfsAgentFullName, {
                                fullName: child.childCfsAgentFullName,
                                phone: child.childCfsAgentNumber || "N/A",
                                email: child.childCfsAgentEmail || "N/A",
                                supervisorName: child.childCfsSupervisorFullName || "N/A"
                            }])
                    ).values()
                );

                return uniqueAgents.length > 0 ? (
                    <table className="table table-striped table-bordered">
                        {/* Table header */}
                        <thead className="table-dark">
                            <tr>
                                <th>Full Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                            </tr>
                        </thead>

                        {/* Body of the table with the data of the unique agents*/}
                        <tbody>
                            {uniqueAgents.map((agent, index) => (
                                <tr key={index}>
                                    <td>{agent.fullName}</td>
                                    <td>{agent.phone}</td>
                                    <td>{agent.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : null;
            })()}

            <hr className="separator-line" />

            {/* Supervisor's table */}
            <h5 className="text-dark">Supervisor</h5>
            {childrenData.length > 0 && (() => {
                // Extract unique supervisors from childrenData
                const uniqueSupervisors = Array.from(
                    new Map(
                        childrenData
                            .filter(child => child.childCfsSupervisorFullName)
                            .map(child => [child.childCfsSupervisorFullName, {
                                supervisorName: child.childCfsSupervisorFullName,
                                supervisorPhone: child.childCfsSupervisorNumber || "N/A",
                                supervisorEmail: child.childCfsSupervisorEmail || "N/A"
                            }])
                    ).values()
                );

                return uniqueSupervisors.length > 0 ? (
                    <table className="table table-striped table-bordered">
                        {/* Table header */}
                        <thead className="table-dark">
                            <tr>
                                <th>Supervisor Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                            </tr>
                        </thead>

                        {/* Body of the table with the data of the unique supervisors*/}
                        <tbody>
                            {uniqueSupervisors.map((supervisor, index) => (
                                <tr key={index}>
                                    <td>{supervisor.supervisorName}</td>
                                    <td>{supervisor.supervisorPhone}</td>
                                    <td>{supervisor.supervisorEmail}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : null;
            })()}

            <hr className="separator-line" />

            <Row className={styles.group}>
                <Col>
                    <label>How long have your children been in CFS care?</label>
                    <Field
                        as="textarea"
                        name="childrenInCareDuration"
                        className={styles.textarea}
                        disabled={!isEditing}
                    />
                    <ErrorMessage
                        name="childrenInCareDuration"
                        component="div"
                        className={styles.errorText}
                    />
                </Col>
            </Row>

            <Row className={styles.group}>
                <Col>
                    <label> What was the reason given by CFS for apprehending your children?</label>
                    <Field
                        as="textarea"
                        name="cfsChildrenApprehesionReason"
                        className={styles.textarea}
                        disabled={!isEditing}
                    />
                    <ErrorMessage
                        name="cfsChildrenApprehesionReason"
                        component="div"
                        className={styles.errorText}
                    />
                </Col>
            </Row>

            <Row className={styles.group}>
                <Col md={4}>
                    <div>
                        <label>Are any of your children placed with family (Kinship Care)?</label>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="kinship" value="yes"  checked={values.kinship === "yes"} disabled={!isEditing} />
                            <label className="form-check-label">Yes</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="kinship" value="no" checked={values.kinship === "no"} disabled={!isEditing} />
                            <label className="form-check-label">No</label>
                        </div>
                        <ErrorMessage name="kinship" component="div" className={styles.errorText} />
                    </div>
                </Col>
                {values.kinship === "yes" && (

                    <Col md={8}>
                        <label>If yes, explain:</label>
                        <Field as="textarea" name="kinshipExplained" className={styles.textarea} disabled={!isEditing} />
                        <ErrorMessage name="kinshipExplained" component="div" className={styles.errorText} />
                    </Col>
                )}
            </Row>

            {/* Family members or friends for Kinship Care */}
            <Row className={styles.group}>
                <h5 className="text-dark">Family Members or Friends for Kinship Care</h5>
                <Col md={8}>
                    <div>
                        <label>Do you have any family members or friends that you can turn to for Kinship Care?</label>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="turnToKinshipCare" value="yes"  checked={values.turnToKinshipCare === "yes"} disabled={!isEditing} />
                            <label className="form-check-label">Yes</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="turnToKinshipCare" value="no" checked={values.turnToKinshipCare === "no"} disabled={!isEditing} />
                            <label className="form-check-label">No</label>
                        </div>
                        <ErrorMessage name="turnToKinshipCare" component="div" className={styles.errorText} />
                    </div>
                </Col>
                {values.turnToKinshipCare === "yes" && (
                    <Row className="mt-3">

                        <FieldArray name="family">
                        {({ push, remove }) => (
                            <div  className="bg-gray-100 p-2 rounded border border-light border-2">
                            {values.family.map((member, index) => (
                                <div key={`${member.family_and_friends_id}-${index}`} className={`${styles.bglightgrey} border rounded p-2 mb-3`}>
                                <Row className="align-items-center">
                                    <Col md={4}>
                                    <InputField
                                        name={`family.${index}.firstName`}
                                        label="First Name:"
                                        disabled={!isEditing}
                                    />
                                    </Col>

                                    <Col md={4}>
                                    <InputField
                                        name={`family.${index}.lastName`}
                                        label="Last Name:"
                                        disabled={!isEditing}
                                    />
                                    </Col>

                                    <Col md={4}>
                                    <InputField
                                        name={`family.${index}.relationshipToClient`}
                                        label="Relationship:"
                                        disabled={!isEditing}
                                    />
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={4}>
                                        <div>
                                        <label
                                            htmlFor={`family.${index}.phoneNumber`}
                                        >
                                            Phone Number:
                                        </label>
                                        <Field
                                            type="number"
                                            id={`family.${index}.phoneNumber`}
                                            name={`family.${index}.phoneNumber`}
                                            component={PhoneNumberInput}
                                            placeholder="(123) 456-7890"
                                            disabled={!isEditing}
                                        />
                                        </div>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={9}></Col>
                                    <Col md={3} className="d-flex align-items-end mt-2">
                                    <Button
                                        className="w-100 btn btn-danger"
                                        type="button"
                                        onClick={() => remove(index)}
                                        disabled={!isEditing}
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
                                disabled={!isEditing}
                                onClick={() =>
                                push({
                                    firstName: "",
                                    lastName: "",
                                    relationshipToClient: "",
                                    phoneNumber: "",
                                })
                                }
                            >
                                + Add Member
                            </Button>
                            </div>
                        )}
                        </FieldArray>
                    </Row>
                )}
            </Row>
            {/* END Family or friends for Kinship Care */}

            <Row className={styles.group}>
                <Col>
                    <label> Are there any concerns you have about the level of care your child(ren) are currently receiving?</label>
                    <Field
                        as="textarea"
                        name="anyConcerns"
                        className={styles.textarea}
                        disabled={!isEditing}
                    />
                    <ErrorMessage
                        name="anyConcerns"
                        component="div"
                        className={styles.errorText}
                    />
                </Col>
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
                        disabled={!isEditing}
                    />
                    <label className="form-check-label">Yes</label>
                    </div>
                    <div className="form-check form-check-inline">
                    <Field
                        className="form-check-input"
                        type="radio"
                        name="casePlanCopy"
                        value="no"
                        disabled={!isEditing}
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
                        disabled={!isEditing}
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
                <Col md={4}>
                    <div>
                        <label>Did you receive any preventative supports to assist you with your children prior to their apprehension?</label>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="prentativeSupport" value="yes"  checked={values.prentativeSupport === "yes"} disabled={!isEditing} />
                            <label className="form-check-label">Yes</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="prentativeSupport" value="no" checked={values.prentativeSupport === "no"} disabled={!isEditing} />
                            <label className="form-check-label">No</label>
                        </div>
                        <ErrorMessage name="prentativeSupport" component="div" className={styles.errorText} />
                    </div>
                </Col>
                {values.prentativeSupport === "yes" && (

                    <Col md={8}>
                        <label>If yes, explain:</label>
                        <Field as="textarea" name="prentativeSupportExplained" className={styles.textarea} disabled={!isEditing} />
                        <ErrorMessage name="prentativeSupportExplained" component="div" className={styles.errorText} />
                    </Col>
                )}
            </Row>

            <Row className={styles.group}>
                <Col md={4}>
                    <div>
                        <label>Do you currently have a Private Agreement or Safety Plan for any of your children?</label>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="privateAgreement" value="yes" checked={values.privateAgreement === "yes"} disabled={!isEditing} />
                            <label className="form-check-label">Yes</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="privateAgreement" value="no" checked={values.privateAgreement === "no"} disabled={!isEditing} />
                            <label className="form-check-label">No</label>
                        </div>
                        <ErrorMessage name="privateAgreement" component="div" className={styles.errorText} />
                    </div>
                </Col>
                {values.privateAgreement === "yes" && (

                    <Col md={8}>
                        <label>If yes, explain:</label>
                        <Field as="textarea" name="privateAgreementExplained" className={styles.textarea} disabled={!isEditing} />
                        <ErrorMessage name="privateAgreementExplained" component="div" className={styles.errorText} />
                    </Col>
                )}
            </Row>

            <Row className={styles.group}>
                <Col>
                    <div>
                        <label>Did CFS accurately explain the process that was to be followed to get your children home?  </label>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="cfsExplain" value="yes" checked={values.cfsExplain === "yes"} disabled={!isEditing} />
                            <label className="form-check-label">Yes</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="cfsExplain" value="no" checked={values.cfsExplain === "no"} disabled={!isEditing} />
                            <label className="form-check-label">No</label>
                        </div>
                        <ErrorMessage name="cfsExplain" component="div" className={styles.errorText} />
                    </div>
                </Col>
            </Row>

            <Row className={styles.group}>
                <Col md={4}>
                    <div>
                        <label>Have you had previous involvement with CFS? </label>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="previousInvolvement" value="yes" checked={values.previousInvolvement === "yes"} disabled={!isEditing} />
                            <label className="form-check-label">Yes</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="previousInvolvement" value="no" checked={values.previousInvolvement === "no"} disabled={!isEditing} />
                            <label className="form-check-label">No</label>
                        </div>
                        <ErrorMessage name="previousInvolvement" component="div" className={styles.errorText} />
                    </div>
                </Col>
                {values.previousInvolvement === "yes" && (

                    <Col md={8}>
                        <label>If yes, explain:</label>
                        <Field as="textarea" name="previousInvolvementExplain" className={styles.textarea} disabled={!isEditing} />
                        <ErrorMessage name="previousInvolvementExplain" component="div" className={styles.errorText} />
                    </Col>
                )}
            </Row>

            <Row className={styles.group}>
                <Col >
                    <label>What is your current visitation schedule with your children? </label>
                    <Field as="textarea" name="visitsChildFrequency" className={styles.textarea} disabled={!isEditing} />
                    <ErrorMessage name="visitsChildFrequency" component="div" className={styles.errorText} />
                </Col>
            </Row>

            <Row className={styles.group}>
                <Col md={4}>
                    <div>
                        <label>Have you had a Parental Capacity Assessment (PCA) done?</label>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="parentalCapacityDone" value="yes" checked={values.parentalCapacityDone === "yes"} disabled={!isEditing} />
                            <label className="form-check-label">Yes</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="parentalCapacityDone" value="no" checked={values.parentalCapacityDone === "no"} disabled={!isEditing} />
                            <label className="form-check-label">No</label>
                        </div>
                        <ErrorMessage name="parentalCapacityDone" component="div" className={styles.errorText} />
                    </div>
                </Col>
                {values.parentalCapacityDone === "yes" && (

                    <Col md={8}>
                        <label>If yes, explain:</label>
                        <Field as="textarea" name="parentalCapacity" className={styles.textarea} disabled={!isEditing} />
                        <ErrorMessage name="parentalCapacity" component="div" className={styles.errorText} />
                    </Col>
                )}
            </Row>
        </>
    );
};

export default ChildFamilyServicesPartition;
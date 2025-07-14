"use client";
import styles from "../../youth-intake/preIntake.module.css";
import { Field, ErrorMessage } from "formik";
import { Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import ValidNameInput from "@/components/ValidNameInput";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import StatusCFSFileSelect from "@/components/StatusCFSFileSelect";
import ManageCfsAgencies from "@/components/ManageCfsAgencies";

const YouthIntakeAgencyInfo = ( {values, errors} ) => {
    return(
        <>
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
        </>
    );
};

export default YouthIntakeAgencyInfo;
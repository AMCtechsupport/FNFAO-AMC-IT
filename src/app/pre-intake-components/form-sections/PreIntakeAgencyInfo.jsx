"use client";
import React from "react";
import styles from "../../pre-intake/preIntake.module.css";
import { Field, ErrorMessage } from "formik";
import { Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";
import StatusCFSFileSelect from "@/components/StatusCFSFileSelect";
import ManageCfsAgencies from "@/components/ManageCfsAgencies";

const PreIntakeAgencyInfo = ( { index, errors } ) => {
    return(
        <>
            <div className="bg-light border border-light p-3 rounded">
                <Row className="mt-2">
                    <h4 className="text-dark mb-4">Agency Information</h4>
                    <Col md={4}>
                    <Field
                        name={`children.${index}.childCfsAgency`}
                        component={ManageCfsAgencies}
                        label="CFS Agency"
                        placeholder="Agency Name"
                        error={errors.children?.[index]?.childCfsAgency}
                    />
                    </Col>
                    <Col md={4}>
                    <InputField
                        name={`children.${index}.childCfsAgentFullName`}
                        label="Agency Worker's Full Name:"
                        placeholder="First Name, Last Name"
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
                        placeholder="e.g., name@example.com"
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
        </>
    );
};

export default PreIntakeAgencyInfo;
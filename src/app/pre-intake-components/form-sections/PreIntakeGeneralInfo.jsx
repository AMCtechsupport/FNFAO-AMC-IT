"use client";
import React from "react";
import styles from "../../pre-intake/preIntake.module.css";
import { Field, ErrorMessage} from "formik";
import { Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";
import ReferredBySelect from "@/components/ReferredBySelect";
import ProvincesSelect from "@/components/ProvincesSelect";

const PreIntakeGeneralInfo = ( { errors } ) => {
    return(
        <>
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
                label="First Name:*"
                placeholder="Enter First Name"
                error={errors.firstName}
                />
            </Col>
            <Col md={3}>
                <InputField
                name="middleName"
                label="Middle Name:"
                placeholder="Enter Middle Name"
                error={errors.middleName}
                />
            </Col>
            <Col md={3}>
                <InputField
                name="lastName"
                label="Last Name:*"
                placeholder="Enter Last Name"
                error={errors.lastName}
                />
            </Col>
            <Col md={3}>
                <div>
                <label htmlFor="dateOfBirth">Date of Birth:*</label>
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
                    placeholder="e.g., 123 Main Street"
                    error={errors.address}
                    />
                </Col>
                <Col md={3}>
                    <InputField
                    name="city"
                    label="City:"
                    placeholder="e.g., Winnipeg"
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
                    placeholder="A1A 1A1"
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
                    <Field type="email" id="email" name="email" placeholder="e.g., name@example.com" />
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
                    placeholder="Enter First Name"
                    error={errors.emergencyContactFirstName}
                    />
                </Col>

                <Col>
                    <InputField
                    name="emergencyContactLastName"
                    label="Last Name:"
                    placeholder="Enter Last Name"
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
        </>
    );
};

export default PreIntakeGeneralInfo;
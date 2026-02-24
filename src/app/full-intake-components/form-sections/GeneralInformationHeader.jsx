"use client";
import styles from "../../full-intake/fullIntake.module.css"
import { Field, ErrorMessage } from "formik";
import { Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";
import ProvincesSelect from "@/components/ProvincesSelect";
import "react-tabs/style/react-tabs.css";

const GeneralInformationHeader = ({
    values,
    errors,
    isEditing,
    assignedAdvocateName,
}) => {
    return (
        <>
            <div >
                <Row>
                    <Col md={4}><label htmlFor="createdAt"> <strong> Created At: </strong> {values.createdAt}</label>

                    </Col>

                    <Col md={4}><label htmlFor="dateModified"> <strong> Last Updated: </strong> {values.dateModified}</label>

                    </Col>

                    <Col md={4}>
                        <label><strong>Assigned to:</strong> {assignedAdvocateName || ""}</label>
                    </Col>
                </Row>
            </div>
            <hr className="separator-line" />

            <div className="bg- p-2 rounded border border-light border-1">
                <Row className="mt-3">
                    <Col md={3}>
                        <InputField name="firstName" label="First Name:" placeholder="John" error={errors.firstName} disabled={!isEditing} />
                    </Col>

                    <Col md={3}>
                        <InputField name="middleName" label="Middle Name:" error={errors.middleName} disabled={!isEditing} />
                    </Col>
                    <Col md={3}>
                        <InputField name="lastName" label="Last Name:" placeholder="Connor" error={errors.lastName} disabled={!isEditing} />
                    </Col>

                    <Col md={3}>
                        <div>
                            <label htmlFor="dateOfBirth">Birth Date:</label>
                            <Field type="date" id="dateOfBirth" name="dateOfBirth" disabled={!isEditing} />
                            <ErrorMessage name="dateOfBirth" component={() => <p className={styles.errorText}>{errors.dateOfBirth}</p>} />
                        </div>
                    </Col>
                </Row>

                <Row >
                    <Col md={3}>
                        <InputField name="address" label="Address:" placeholder="161 Main St, Unit 230" error={errors.address} disabled={!isEditing} />
                    </Col>

                    <Col md={3}>
                        <InputField name="city" label="City:" placeholder="Winnipeg" error={errors.city} disabled={!isEditing} />
                    </Col>

                    <Col md={4}>

                        <ProvincesSelect name="province" label="Province:" error={errors.province} disabled={!isEditing} />
                    </Col>

                    <Col md={2}>
                        <InputField name="postalCode" label="Postal code:" placeholder="R3C 0V8" error={errors.postalCode} disabled={!isEditing} />
                    </Col>
                </Row>

                <Row className="mb-4">
                    <Col md={3}>
                        <div>
                            <label htmlFor="phoneNumber">Phone Number:</label>
                            <Field type="number" id="phoneNumber" name="phoneNumber" component={PhoneNumberInput} placeholder="(123) 456-7890" disabled={!isEditing} />
                            <ErrorMessage name="phoneNumber" component={() => <p className={styles.errorText}>{errors.phoneNumber}</p>} />
                        </div>
                    </Col>

                    <Col md={4}>
                        <div>
                            <label htmlFor="email">Email:</label>
                            <Field type="email" id="email" name="email" disabled={!isEditing} />
                            <ErrorMessage name="email" component={() => <p className={styles.errorText}>{errors.email}</p>} />
                        </div>
                    </Col>
                </Row>
            </div>
            {/* Emergency contact */}
            {/* <div className="p-2 rounded border border-light border-1 bg-transparent">

                <Row className={styles.emergencyContact}>
                    <Col md={3}><label><strong>Emergency Contact</strong></label></Col>
                    <Col md={3}>
                        <InputField
                            name="emergencyContactFirstName"
                            label="First Name:"
                            placeholder=""
                            error={errors.emergencyContactFirstName}
                            disabled={!isEditing}
                        />
                    </Col>

                    <Col md={3}>
                        <InputField
                            name="emergencyContactLastName"
                            label="Last Name:"
                            placeholder=""
                            error={errors.emergencyContactLastName}
                            disabled={!isEditing}
                        />
                    </Col>

                    <Col md={3}>
                        <div>
                            <label htmlFor="emergencyContactNumber">Phone Number:</label>
                            <Field
                            type="number"
                            id="emergencyContactNumber"
                            name="emergencyContactNumber"
                            component={PhoneNumberInput}
                            placeholder="(123) 456-7890"
                            disabled={!isEditing}
                            />
                        </div>
                    </Col>
                </Row>
            </div> */}
        </>
    );
};

export default GeneralInformationHeader;
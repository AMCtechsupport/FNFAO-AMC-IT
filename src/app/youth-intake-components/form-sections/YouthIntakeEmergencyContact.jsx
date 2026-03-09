"use client";
import styles from "../../youth-intake/youthIntake.module.css";
import { Field } from "formik";
import { Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";

const YouthIntakeEmergencyContact = ( { errors} ) => {
    return(
        <>
            <hr className="separator-line" />
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
                    <Field
                    name="emergencyContactNumber"
                    label="Emergency Contact Number:"
                    component={PhoneNumberInput}
                    placeholder="(123) 456-7890"
                    />
                </div>
                </Col>
            </Row>
        </>
    );
};

export default YouthIntakeEmergencyContact;
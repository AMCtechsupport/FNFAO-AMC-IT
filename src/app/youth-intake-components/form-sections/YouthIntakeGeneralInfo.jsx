"use client";
import styles from "../../youth-intake/youthIntake.module.css";
import { Field, ErrorMessage, useFormikContext } from "formik";
import { Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";
import ReferredBySelect from "@/components/ReferredBySelect";
import ProvincesSelect from "@/components/ProvincesSelect";
import PronounSelect from "@/components/Pronouns";
import FirstNationSelect from "@/components/FirstNationSelect";

const YouthIntakeGeneralInfo = ( { errors } ) => {
    const {setFieldValue} = useFormikContext();

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
                    label="First Name: *"
                    placeholder="John"
                    error={errors.firstName}
                />
                </Col>

                <Col md={3}>
                <InputField
                    name="middleName"
                    label="Middle Name:"
                    error={errors.middleName}
                />
                </Col>
                <Col md={3}>
                <InputField
                    name="lastName"
                    label="Last Name: *"
                    placeholder="Connor"
                    error={errors.lastName}
                />
                </Col>

                <Col md={3}>
                <PronounSelect
                    name="pronouns"
                    label="Preferred Pronouns:"
                    error={errors.pronouns}
                />
                </Col>

                <Col md={3}>
                <div>
                    <label htmlFor="dateOfBirth">Birth Date: *</label>
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
                    placeholder="161 Main St, Unit 230"
                    error={errors.address}
                />
                </Col>

                <Col md={3}>
                <InputField
                    name="city"
                    label="City:"
                    placeholder="Winnipeg"
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
                    placeholder="R3C 0V8"
                    error={errors.postalCode}
                />
                </Col>
            </Row>

            <Row>
                <Col md={3}>
                <Field
                    name="phoneNumber"
                    label="Phone Number:"
                    component={PhoneNumberInput}
                    placeholder="(123) 456-7890"
                />
                </Col>

                <Col md={3}>
                <div>
                    <label htmlFor="socialMedia">Social Media Contact:</label>
                    <Field type="text" id="socialMedia" name="socialMedia" />
                </div>
                </Col>

                <Col md={4}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <Field type="email" id="email" name="email" />
                    <ErrorMessage
                    name="email"
                    component={() => (
                        <p className={styles.errorText}>{errors.email}</p>
                    )}
                    />
                </div>
                </Col>
            </Row>

            <Row>
                <Col md={4}>
                <Field
                    name="firstNationMembership"
                    component={FirstNationSelect}
                    label="First Nation Membership"
                    error={errors.firstNationMembership}
                />
                </Col>

                <Col md={4}>
                <label>TreatyNumber (10-Digit):</label>
                    <Field
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={10}
                        id="treatyNumber"
                        placeholder="1234567890"
                        name="treatyNumber"
                        onChange={(e) => {
                            const digits = String(e.target.value || "").replace(/\D/g, "");
                            setFieldValue("treatyNumber", digits);
                        }}
                        onBlur={(e) => {
                            const raw = String(e.target.value || "");
                            const digits = raw.replace(/\D/g, "");
                            if (digits.length > 0) {
                                const padded = digits.padStart(10, "0");
                                setFieldValue("treatyNumber", padded);
                            } else {
                                setFieldValue("treatyNumber", "");
                            }
                        }}
                    />
                </Col>
                <Col md={4}>
                <Field
                    name="otherFirstNation"
                    component={FirstNationSelect}
                    label="Other First Nation Membership"
                    error={errors.otherFirstNation}
                />
                </Col>
            </Row>
        </>
    );
};

export default YouthIntakeGeneralInfo;
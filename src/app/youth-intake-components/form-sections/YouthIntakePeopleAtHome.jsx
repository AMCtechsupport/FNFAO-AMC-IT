"use client";
import styles from "../../youth-intake/youthIntake.module.css";
import { Field, FieldArray } from "formik";
import { Button, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import ValidNameInput from "@/components/ValidNameInput";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import EmailInput from "@/components/ValidEmailInput";

const YouthIntakePeopleAtHome = ( {values, errors} ) => {
    return(
        <>
            <Row>            
                <div className={styles.group}>
                <h3 className="text-dark">People at Home</h3>
                    <FieldArray name="homeMembers">
                        {({ push, remove }) => (
                        <div>
                            {values.homeMembers.map((homeMember, index) => (
                            <div
                                key={index}
                                className={`${styles.bglightgrey} border rounded p-2 mb-3`}
                            >
                                <Row className="align-items-center">
                                <Col md={3}>
                                    <div>
                                    <label htmlFor={`homeMembers.${index}.firstName`}>
                                        First Name:
                                    </label>
                                    <Field
                                        id={`homeMembers.${index}.firstName`}
                                        name={`homeMembers.${index}.firstName`}
                                        placeholder="Person's First Name"
                                        component={ValidNameInput}
                                    />
                                    </div>
                                </Col>

                                <Col md={3}>
                                    <div>
                                    <label
                                        htmlFor={`homeMembers.${index}.middleName`}
                                    >
                                        Middle Name:
                                    </label>
                                    <Field
                                        id={`homeMembers.${index}.middleName`}
                                        name={`homeMembers.${index}.middleName`}
                                        placeholder="Person's Middle Name"
                                        component={ValidNameInput}
                                    />
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div>
                                    <label htmlFor={`homeMembers.${index}.lastName`}>
                                        Last Name:
                                    </label>
                                    <Field
                                        id={`homeMembers.${index}.lastName`}
                                        name={`homeMembers.${index}.lastName`}
                                        placeholder="Person's Last Name"
                                        component={ValidNameInput}
                                    />
                                    </div>
                                </Col>
                                </Row>
                                <Row>
                                <Col md={4}>
                                    <div>
                                    <label
                                        htmlFor={`homeMembers.${index}.relationship`}
                                    >
                                        Relationship:
                                    </label>
                                    <Field
                                        id={`homeMembers.${index}.relationship`}
                                        name={`homeMembers.${index}.relationship`}
                                        placeholder="e.g., Sibling, Grandparent..."
                                        component={ValidNameInput}
                                    />
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <Field
                                    name={`homeMembers.${index}.phoneNumber`}
                                    label="Phone Number:"
                                    component={PhoneNumberInput}
                                    placeholder="(123) 456-7890"
                                    error={errors.homeMembers?.[index]?.phoneNumber}
                                    />
                                </Col>
                                <Col md={3}>
                                    <Field
                                    name={`homeMembers.${index}.email`}
                                    label="Email Address:"
                                    component={EmailInput}
                                    placeholder="e.g., name@example.com"
                                    />
                                </Col>
                                </Row>
                                <Row>
                                <Col md={9}></Col>
                                <Col md={3} className="d-flex align-items-end mt-2">
                                    <Button
                                    className="w-100 btn btn-danger opacity-70"
                                    type="button"
                                    onClick={() => remove(index)}
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
                            onClick={() =>
                                push({
                                firstName: "",
                                middleName: "",
                                lastName: "",
                                relationship: "",
                                phoneNumber: "",
                                email: "",
                                })
                            }
                            >
                            + Add Home Member
                            </Button>
                        </div>
                        )}
                    </FieldArray>
                </div>
          </Row>
        </>
    );
};

export default YouthIntakePeopleAtHome;
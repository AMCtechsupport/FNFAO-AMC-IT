"use client";
import React from "react";
import styles from "../../pre-intake/preIntake.module.css";
import { Field, ErrorMessage, useFormikContext } from "formik";
import { Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import RelationshipToChildrenSelect from "@/components/RelationshipToChildrenSelect";
import FirstNationSelect from "@/components/FirstNationSelect";

const PreIntakeAboutYou = ( {values, errors} ) => {
    const { setFieldValue } = useFormikContext();

    return (
        <>
            <Row>
                <h3 className="text-dark">About You</h3>
                <Col md={6}>
                    <RelationshipToChildrenSelect
                    name="relationshipToChildren"
                    label="What is your relationship to the child(ren)?"
                    error={errors.relationshipToChildren}
                    />
                </Col>
            </Row>
            <Row className={styles.group}>
                <Col md={6}>
                    <div>
                    <label>
                        Are there any other adults involved in your matter?
                    </label>
                    <div className="form-check form-check-inline">
                        <Field
                        className="form-check-input"
                        type="radio"
                        name="otherAdultsInvolved"
                        value="yes"
                        />
                        <label className="form-check-label">Yes</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <Field
                        className="form-check-input"
                        type="radio"
                        name="otherAdultsInvolved"
                        value="no"
                        />
                        <label className="form-check-label">No</label>
                    </div>
                    <ErrorMessage
                        name="otherAdultsInvolved"
                        component="div"
                        className={styles.errorText}
                    />
                    </div>
                </Col>
                    {values.otherAdultsInvolved === "yes" && (
                        <Col md={8}>
                        <label>Please specify:</label>
                        <Field
                            as="textarea"
                            name="otherAdultsInvolvedExplained"
                            className={styles.textarea}
                        />
                        <ErrorMessage
                            name="otherAdultsInvolvedExplained"
                            component="div"
                            className={styles.errorText}
                        />
                </Col>
            )}
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
                    <div>
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
                    <ErrorMessage
                        name="treatyNumber"
                        component={() => (
                        <p className={styles.errorText}>
                            {errors.treatyNumber}
                        </p>
                        )}
                    />
                    </div>
                </Col>
                <Col md={4}>
                    <Field
                    name="otherFirstNation"
                    component={FirstNationSelect}
                    label="Other First Nation"
                    error={errors.otherFirstNation}
                    />
                </Col>
            </Row>
            <Row className={styles.group}>
                <Col md={5}>
                    <div>
                    <label>Personal Health Identification Numbers (9-Digit):</label>
                    <Field
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={9}
                        id="ninePersonalHealthNumber"
                        placeholder="123456789"
                        name="ninePersonalHealthNumber"
                    />
                    <ErrorMessage
                        name="ninePersonalHealthNumber"
                        component={() => (
                        <p className={styles.errorText}>
                            {errors.ninePersonalHealthNumber}
                        </p>
                        )}
                    />
                    </div>
                </Col>
                <Col md={2}>
                    <label>(6-Digit):</label>
                    <Field
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={6}
                    id="sixPersonalHealthNumber"
                    placeholder="000000"
                    name="sixPersonalHealthNumber"
                    />
                    <ErrorMessage
                    name="sixPersonalHealthNumber"
                    component={() => (
                        <p className={styles.errorText}>
                        {errors.sixPersonalHealthNumber}
                        </p>
                    )}
                    />
                </Col>
            </Row>
            <Row>
            <Col md={4}>
                <div>
                <label>Are you living on or off reserve?  </label>
                <div className="form-check form-check-inline">
                    <Field
                    className="form-check-input"
                    type="radio"
                    name="onReserve"
                    value="yes"
                    />
                    <label className="form-check-label">On</label>
                </div>
                <div className="form-check form-check-inline">
                    <Field
                    className="form-check-input"
                    type="radio"
                    name="onReserve"
                    value="no"
                    />
                    <label className="form-check-label">Off</label>
                </div>
                <ErrorMessage
                    name="onReserve"
                    component="div"
                    className={styles.onReserve}
                />
                </div>
            </Col>
            <Col md={4}>
                <div>
                <label>
                    Have you transitioned from a reserve to the city recently?
                </label>
                <div className="form-check form-check-inline">
                    <Field
                    className="form-check-input"
                    type="radio"
                    name="transitionFromReserve"
                    value="yes"
                    />
                    <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                    <Field
                    className="form-check-input"
                    type="radio"
                    name="transitionFromReserve"
                    value="no"
                    />
                    <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                    name="transitionFromReserve"
                    component="div"
                    className={styles.transitionFromReserve}
                />
                </div>
            </Col>
            <Col md={4}>
                <div>
                <label>Are you a previous client of FNFAO?</label>
                <div className="form-check form-check-inline">
                    <Field
                    className="form-check-input"
                    type="radio"
                    name="previousFNFAOClient"
                    value="yes"
                    />
                    <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                    <Field
                    className="form-check-input"
                    type="radio"
                    name="previousFNFAOClient"
                    value="no"
                    />
                    <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                    name="previousFNFAOClient"
                    component="div"
                    className={styles.previousFNFAOClient}
                />
                </div>
            </Col>
            </Row>
            <Row className={styles.group}>
            <Col>
                <label>Why are you seeking advocacy today?</label>
                <Field
                as="textarea"
                name="seekingAdvocacy"
                className={styles.textarea}
                />
                <ErrorMessage
                name="seekingAdvocacy"
                component="div"
                className={styles.errorText}
                />
            </Col>
            </Row>
        </>
    );
};

export default PreIntakeAboutYou;
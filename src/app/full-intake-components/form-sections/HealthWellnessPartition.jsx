"use client";
import styles from "../../full-intake/fullIntake.module.css"
import { Field, ErrorMessage } from "formik";
import { Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-tabs/style/react-tabs.css";

const HealthWellnessPartition = ({
    values,
    isEditing,
    setFieldValue
}) => {
    return (
        <>
            <Row>
                <label>Have you ever been diagnosed with any of the following? (Please check all that apply)</label>
            </Row>
            <div className={styles.group}>
                {[
                    { name: "FASD", label: "FASD" },
                    { name: "ADHD", label: "ADHD" },
                    { name: "PTSD", label: "PTSD" },
                    { name: "depression", label: "Depression" },
                    { name: "cancerAutoimmuneCondition", label: "Cancer Autoimmune Condition" },
                    { name: "otherMentalCondition", label: "Other Mental Health Condition" }
                ].map(({ name, label }) => (
                    <Row key={name} className={styles.checkboxRow}>
                        <Col md={1}></Col>
                        <Col className={styles.checkboxWrapper} md={4}>
                            <label htmlFor={name}>
                                <span style={{ marginRight: "7px", fontSize: "1.2em" }}>•</span>
                                {label}
                            </label>
                        </Col>
                        <Col md={1}>
                            <Field
                                type="checkbox"
                                name={name}
                                checked={Boolean(values[name])}
                                onChange={(e) => setFieldValue(name, Boolean(e.target.checked))}
                                disabled={!isEditing}
                            />
                        </Col>
                    </Row>
                ))}
            </div>


            {values.otherMentalCondition && (
            <Row className={styles.group}>
                <Col>
                    <label> Explain Other Mental Health Condition:</label>
                    <Field
                        as="textarea"
                        name="otherMentalConditionExplained"
                        className={styles.textarea}
                        disabled={!isEditing}
                    />
                    <ErrorMessage
                        name="otherMentalConditionExplained"
                        component="div"
                        className={styles.errorText}
                    />
                </Col>
            </Row>
            )}

            <Row className={styles.group}>
                <Col>
                <label htmlFor="diagnosedFollowingExplain">If you have checked any of the above, please describe the supports you have received to address their effects. </label>
                <Field
                    as="textarea"
                    name="diagnosedFollowingExplain"
                    className={styles.textarea}
                    disabled={!isEditing}
                />
                <ErrorMessage
                    name="diagnosedFollowingExplain"
                    component="div"
                    className={styles.errorText}
                />
                </Col>
            </Row>

            <Row className={styles.group}>
                <Col md={4}>
                <div>
                    <label>Do you feel that you may struggle with using negative coping skills from to time?</label>
                    <div className="form-check form-check-inline">
                        <Field
                            className="form-check-input"
                            type="radio"
                            name="negativeCopingSkills"
                            value="yes"
                            disabled={!isEditing}
                        />
                        <label className="form-check-label">Yes</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <Field
                            className="form-check-input"
                            type="radio"
                            name="negativeCopingSkills"
                            value="no"
                            disabled={!isEditing}
                        />
                        <label className="form-check-label">No</label>
                    </div>
                    <ErrorMessage
                        name="negativeCopingSkills"
                        component="div"
                        className={styles.errorText}
                    />
                </div>
                </Col>
                {values.negativeCopingSkills === "yes" && (
                <Col md={8}>
                    <label> If yes, please explain:</label>
                    <Field
                        as="textarea"
                        name="negativeCopingSkillsExplain"
                        className={styles.textarea}
                        disabled={!isEditing}
                    />
                    <ErrorMessage
                        name="negativeCopingSkillsExplain"
                        component="div"
                        className={styles.errorText}
                    />
                </Col>
                )}
            </Row>

            <Row className={styles.group}>
                <Col>
                <label>How has Drugs and/or Alcohol impacted your life? </label>
                <Field
                    as="textarea"
                    name="drugsImpact"
                    className={styles.textarea}
                    disabled={!isEditing}
                />
                <ErrorMessage
                    name="drugsImpact"
                    component="div"
                    className={styles.errorText}
                />
                </Col>
            </Row>

            <Row className={styles.group}>
                <Col>
                <label>When was the last time you used Drugs and/or Alcohol? </label>
                <Field
                    as="textarea"
                    name="lastTimeUsed"
                    className={styles.textarea}
                    disabled={!isEditing}
                />
                <ErrorMessage
                    name="lastTimeUsed"
                    component="div"
                    className={styles.errorText}
                />
                </Col>
            </Row>

            <Row className={styles.group}>
                <Col md={4}>
                <div>
                    <label>Do you have any educational goals we can support you to achieve?</label>
                    <div className="form-check form-check-inline">
                        <Field
                            className="form-check-input"
                            type="radio"
                            name="educationalGoals"
                            value="yes"
                            disabled={!isEditing}
                        />
                        <label className="form-check-label">Yes</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <Field
                            className="form-check-input"
                            type="radio"
                            name="educationalGoals"
                            value="no"
                            disabled={!isEditing}
                        />
                        <label className="form-check-label">No</label>
                    </div>
                    <ErrorMessage
                    name="educationalGoals"
                    component="div"
                    className={styles.errorText}
                    />
                </div>
                </Col>
                {values.educationalGoals === "yes" && (
                <Col md={8}>
                    <label> If yes, please explain:</label>
                    <Field
                        as="textarea"
                        name="educationalGoalsExplained"
                        className={styles.textarea}
                        disabled={!isEditing}
                    />
                    <ErrorMessage
                    name="educationalGoalsExplained"
                    component="div"
                    className={styles.errorText}
                    />
                </Col>
                )}
            </Row>
            <Row className={styles.group}>
                <Col md={4}>
                    <div>
                        <label>Do you have access to an Elder or counsellor?</label>
                        <div className="form-check form-check-inline">
                            <Field
                                className="form-check-input"
                                type="radio"
                                name="accessElder"
                                value="yes"
                                disabled={!isEditing}
                            />
                            <label className="form-check-label">Yes</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <Field
                                className="form-check-input"
                                type="radio"
                                name="accessElder"
                                value="no"
                                disabled={!isEditing}
                            />
                            <label className="form-check-label">No</label>
                        </div>
                        <ErrorMessage
                        name="accessElder"
                        component="div"
                        className={styles.errorText}
                        />
                    </div>
                </Col>
                {values.accessElder === "yes" && (
                <Col md={8}>
                    <label> If yes, please describe:</label>
                    <Field
                        as="textarea"
                        name="accessElderExplained"
                        className={styles.textarea}
                        disabled={!isEditing}
                    />
                    <ErrorMessage
                    name="accessElderExplained"
                    component="div"
                    className={styles.errorText}
                    />
                </Col>
                )}
            </Row>

        </>
    );
};

export default HealthWellnessPartition;
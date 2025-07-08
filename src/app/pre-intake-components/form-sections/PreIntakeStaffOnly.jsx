"use client";
import styles from "../../pre-intake/preIntake.module.css";
import {  Field, ErrorMessage } from "formik";
import { Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const PreIntakeStaffOnly = ( {  } ) => {
    return(
        <>
            <Row>
                <h3 className="text-dark">Staff Only</h3>
                <Col>
                    <label>
                        If we are unable to assist, please list why (Example: they do
                        not fit FNFAO's mandate, etc.):
                    </label>
                    <Field
                        as="textarea"
                        name="unableToAssistExplained"
                        className={styles.textarea}
                    />
                    <ErrorMessage
                        name="unableToAssistExplained"
                        component="div"
                        className={styles.errorText}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                <label>
                    If we are unable to assist, please identify where you are
                    referring them to for support:
                </label>
                <Field
                    as="textarea"
                    name="referForSupport"
                    className={styles.textarea}
                />
                <ErrorMessage
                    name="referForSupport"
                    component="div"
                    className={styles.errorText}
                />
                </Col>
            </Row>
        </>
    );
};

export default PreIntakeStaffOnly;
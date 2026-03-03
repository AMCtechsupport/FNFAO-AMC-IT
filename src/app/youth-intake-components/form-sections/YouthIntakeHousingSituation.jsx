"use client";
import styles from "../../youth-intake/youthIntake.module.css";
import { Field, ErrorMessage } from "formik";
import { Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const YouthIntakeHousingSituation = ( {} ) => {
    return(
        <>
          <Row>
            <h3 className="text-dark">Housing Situation: </h3>
          </Row>
            <Row className={styles.group}>
                <Col md={4}>
                <div>
                    <label>Are you living on or off reserve?  </label>
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
                    <label>Were you apprehended on or off reserve?</label>
                    <div className="form-check form-check-inline">
                    <Field
                        className="form-check-input"
                        type="radio"
                        name="apprehendedOnReserve"
                        value="yes"
                    />
                    <label className="form-check-label">Yes</label>
                    </div>
                    <div className="form-check form-check-inline">
                    <Field
                        className="form-check-input"
                        type="radio"
                        name="apprehendedOnReserve"
                        value="no"
                    />
                    <label className="form-check-label">No</label>
                    </div>
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
            </Row>

            <Row>
                <Col>
                    <label>Where are you currently staying?</label>
                <Field
                    as="textarea"
                    name="currentlyStaying"
                    className={styles.textarea}
                />
                </Col>
                <Col>
                    <label>How long have you been staying there?</label>
                <Field
                    as="textarea"
                    name="currentlyStayingDuration"
                    className={styles.textarea}
                />
                </Col>
                <Row>
                    <Col md={2}>
                        <label>Number of People who live at home:</label>
                        <Field as="textarea" name="peopleHome" />
                        <ErrorMessage name="peopleHome">
                        {(msg) => <div style={{ color: "red" }}>{msg}</div>}
                        </ErrorMessage>
                    </Col>
                </Row>
            </Row>
        </>
    );
};

export default YouthIntakeHousingSituation;
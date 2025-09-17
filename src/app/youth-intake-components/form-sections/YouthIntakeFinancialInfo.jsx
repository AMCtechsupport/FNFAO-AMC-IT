"use client";
import styles from "../../youth-intake/youthIntake.module.css";
import { Field, ErrorMessage } from "formik";
import { Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import ValidNameInput from "@/components/ValidNameInput";
import PhoneNumberInput from "@/components/ValidPhoneNumber";

const YouthIntakeFinancialInfo = ( { errors } ) => {
    return(
        <>
            <div className={styles.group}>
                <h3 className="text-dark">Financial Information:</h3>
                <Row className={styles.group}>
                    <Col md={4}>
                        <div>
                        <label>Do you have a Bank Account?</label>
                        <div className="form-check form-check-inline">
                            <Field
                            className="form-check-input"
                            type="radio"
                            name="bankAccount"
                            value="yes"
                            />
                            <label className="form-check-label">Yes</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <Field
                            className="form-check-input"
                            type="radio"
                            name="bankAccount"
                            value="no"
                            />
                            <label className="form-check-label">No</label>
                        </div>
                        </div>
                    </Col>

                    <Col md={5}>
                        <div>
                        <label>Are you on Employment and Income Assistance?</label>
                        <div className="form-check form-check-inline">
                            <Field
                            className="form-check-input"
                            type="radio"
                            name="incomeAssistance"
                            value="yes"
                            />
                            <label className="form-check-label">Yes</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <Field
                            className="form-check-input"
                            type="radio"
                            name="incomeAssistance"
                            value="no"
                            />
                            <label className="form-check-label">No</label>
                        </div>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col md={4}>
                        <div>
                        <label htmlFor="caseWorkerFullName">
                            Case Worker's Full Name:
                        </label>
                        <Field
                            id="caseWorkerFullName"
                            name="caseWorkerFullName"
                            component={ValidNameInput}
                            placeholder="Jimmy"
                        />
                        </div>
                    </Col>

                    <Col md={4}>
                        <div>
                        <Field
                            name="caseWorkerPhoneNumber"
                            label="Case Worker Phone Number:"
                            component={PhoneNumberInput}
                            placeholder="(123) 456-7890"
                        />
                        </div>
                    </Col>
                    <Col md={4}>
                        <div>
                        <label htmlFor="caseWorkerEmail">Case Worker Email:</label>
                        <Field
                            type="email"
                            id="caseWorkerEmail"
                            name="caseWorkerEmail"
                        />
                        <ErrorMessage
                            name="caseWorkerEmail"
                            component={() => (
                            <p className={styles.errorText}>
                                {errors.caseWorkerEmail}
                            </p>
                            )}
                        />
                        </div>
                    </Col>
                </Row>
          </div>
        </>
    );
};

export default YouthIntakeFinancialInfo;
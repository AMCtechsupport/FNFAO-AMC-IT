"use client";
import styles from "../../pre-intake/preIntake.module.css";
import { Field, ErrorMessage } from "formik";
import { Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const PreIntakeOtherQuestions = ( { values, validateRadio, errors } ) => {
    return(
        <>
          <Row>
            <h3 className="text-dark">Other Questions</h3>
          </Row>
          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>Need prenatal support?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="prenatalSupport"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="prenatalSupport"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="prenatalSupport"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.prenatalSupport === "yes" && (
              <Col md={8}>
                <label>
                  If yes, specify (e.g. help avoiding birth apprehension, access
                  to prenatal care, breastfeeding information, preparing for
                  baby, etc.):
                </label>
                <Field
                  as="textarea"
                  name="prenatalSupportSpecified"
                  placeholder="Needs prenatal support because..."
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="prenatalSupportSpecified"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>
          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>Need housing support?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="housingSupport"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="housingSupport"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="housingSupport"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.housingSupport === "yes" && (
              <Col md={8}>
                <label>
                  If yes, specify (e.g. urgent housing, preventing eviction,
                  dealing with the Residential Tenancies Branch, etc):
                </label>
                <Field
                  as="textarea"
                  name="housingSupportSpecified"
                  placeholder="Needs housing support because..."
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="housingSupportSpecified"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>
          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>Need addictions support?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="addictionsSupport"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="addictionsSupport"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="addictionsSupport"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.addictionsSupport === "yes" && (
              <Col md={8}>
                <label>
                  If yes, specify (e.g. access to detox, treatment, relapse
                  prevention programming, etc.):
                </label>
                <Field
                  as="textarea"
                  name="addictionsSupportSpecified"
                  placeholder="Needs addiction support because..."
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="addictionsSupportSpecified"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>

          <Row className={styles.group}>
            <Col md={6}>
              <div>
                <label>Need youth support for you/your children?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="youthSupport"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="youthSupport"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="youthSupport"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.youthSupport === "yes" && (
              <Col md={8}>
                <label>
                  If yes, specify (e.g. help avoiding birth apprehension, access
                  to prenatal care, breastfeeding information, preparing for
                  baby, etc.):
                </label>
                <Field
                  as="textarea"
                  name="youthSupportSpecified"
                  placeholder="Needs youth support because..."
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="youthSupportSpecified"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>Need custody-related support?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="custodySupport"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="custodySupport"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="custodySupport"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.custodySupport === "yes" && (
              <Col md={8}>
                <label>
                  If yes, specify (e.g. ex-spouse not honouring custody
                  arrangement for access/visitation, grandparent access, child
                  support, etc:)
                </label>
                <Field
                  as="textarea"
                  name="custodySupportSpecified"
                  placeholder="Needs custody support because..."
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="custodySupportSpecified"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>

          <Row className={styles.group}>
            <Col md={8}>
              <div>
                <label>Do you have any criminal charges (past, active or pending)? *</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="criminalCharges"
                    value="yes"
                    validate={validateRadio}
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="criminalCharges"
                    value="no"
                    validate={validateRadio}
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="criminalCharges"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.criminalCharges === "yes" && (
              <Col md={8}>
                <label>If yes, please specify why: </label>
                <Field
                  as="textarea"
                  name="criminalChargesSpecified"
                  placeholder="e.g., Past criminal charge of..."
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="criminalChargesSpecified"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>
          <Row className={styles.group}>
            <Col md={6}>
              <div>
                <label>Do you currently have an active arrest warrant? *</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="activeWarrant"
                    value="yes"
                    validate={validateRadio}
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="activeWarrant"
                    value="no"
                    validate={validateRadio}
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="activeWarrant"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.activeWarrant === "yes" && (
              <Col md={8}>
                <label>If yes, please specify why: </label>
                <Field
                  as="textarea"
                  name="activeWarrantSpecified"
                  placeholder="Warrent because of..."
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="activeWarrantSpecified"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>
          <Row className={styles.group}>
            <Col md={6}>
              <div>
                <label>
                  Are you currently under child abuse investigation? *
                </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="activeInvestigation"
                    value="yes"
                    validate={validateRadio}
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="activeInvestigation"
                    value="no"
                    validate={validateRadio}
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="activeInvestigation"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.activeInvestigation === "yes" && (
              <Col md={3}>
                <label>If yes, start date: </label>
                <Field
                  type="date"
                  id="activeInvestigationExplained"
                  name="activeInvestigationExplained"
                  max={new Date().toISOString().split("T")[0]}
                />
                <ErrorMessage
                  name="activeInvestigationExplained"
                  component={() => (
                    <p className={styles.errorText}>
                      {errors.activeInvestigationExplained}
                    </p>
                  )}
                />
              </Col>
            )}
          </Row>
          <Row className={styles.group}>
            <Col md={6}>
              <div>
                <label>
                  Any active No Contact Orders or Protection Orders? *
                </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="activeOrders"
                    value="yes"
                    validate={validateRadio}
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="activeOrders"
                    value="no"
                    validate={validateRadio}
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="activeOrders"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.activeOrders === "yes" && (
              <Col md={8}>
                <label>If yes, against who or against you?</label>
                <Field
                  as="textarea"
                  name="activeOrdersExplained"
                  placeholder="e.g., Client has No Contact Orders against them by..."
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="activeOrdersExplained"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>
          <Row className={styles.group}>
            <Col md={3}>
              <div>
                <label>Do you have a lawyer?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="currentLawyer"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="currentLawyer"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="currentLawyer"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.currentLawyer === "no" && (
              <>
                <Col md={3}>
                  <div>
                    <label>If no, need legal assistance?</label>
                    <div className="form-check form-check-inline">
                      <Field
                        className="form-check-input"
                        type="radio"
                        name="legalAssistance"
                        value="yes"
                      />
                      <label className="form-check-label">Yes</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <Field
                        className="form-check-input"
                        type="radio"
                        name="legalAssistance"
                        value="no"
                      />
                      <label className="form-check-label">No</label>
                    </div>
                    <ErrorMessage
                      name="legalAssistance"
                      component="div"
                      className={styles.errorText}
                    />
                  </div>
                </Col>
                {values.legalAssistance === "yes" && (
                  <Col md={6}>
                    <label>If yes, specify:</label>
                    <Field
                      as="textarea"
                      name="legalAssistanceSpecified"
                      placeholder="Needs legal assistance because..."
                      className={styles.textarea}
                    />
                    <ErrorMessage
                      name="legalAssistanceSpecified"
                      component="div"
                      className={styles.errorText}
                    />
                  </Col>
                )}
              </>
            )}
          </Row>
        </>
    );
};

export default PreIntakeOtherQuestions;
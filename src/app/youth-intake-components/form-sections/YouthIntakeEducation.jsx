"use client";
import styles from "../../youth-intake/youthIntake.module.css";
import { Field, FieldArray } from "formik";
import { Button, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import ValidNameInput from "@/components/ValidNameInput";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import EmailInput from "@/components/ValidEmailInput";

const YouthIntakeEducation = ( { values, setFieldValue, errors } ) => {
    return(
        <>
          <Row>
            <h3 className="text-dark">Education:</h3>
          </Row>
          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>
                  Are you currently in school? Or any other program?
                </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="inSchool"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="inSchool"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>
            </Col>

            {values.inSchool === "yes" && (
              <Col md={8}>
                <label>What school or program are you attending?</label>
                <Field
                  as="textarea"
                  name="schoolAttending"
                  className={styles.textarea}
                />
                <label>What grade are you currently in?</label>
                <Field
                  as="textarea"
                  name="currentGrade"
                  className={styles.textarea}
                />

                <div>
                  <label>
                    Are you a full-time student or a part-time student?
                  </label>
                  <div className="form-check form-check-inline">
                    <Field
                      className="form-check-input"
                      type="radio"
                      name="fullStudent"
                      value="yes"
                    />
                    <label className="form-check-label">F/T</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <Field
                      className="form-check-input"
                      type="radio"
                      name="fullStudent"
                      value="no"
                    />
                    <label className="form-check-label">P/T</label>
                  </div>
                </div>

                {values.fullStudent === "no" && (
                  <div>
                    <label>
                      What days of the week, and/or number of hours do you
                      attend school?
                    </label>
                    <Field
                      as="textarea"
                      name="schoolSchedule"
                      className={styles.textarea}
                    />
                  </div>
                )}
              </Col>
            )}
          </Row>

          <Row className={styles.group}>
            <Col md={6}>
              <div>
                <label className="text-xl font-bold">
                  What Personal Identification do you have? (Check all that
                  apply)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ margin: 0, whiteSpace: 'nowrap', width: '200px' }}>Birth Certificate</label>
                    <Field
                      type="checkbox"
                      name="birthCertificate"
                      onChange={({ target: { checked } }) => {
                        setFieldValue("birthCertificate", checked);
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ margin: 0, whiteSpace: 'nowrap', width: '200px' }}>Driver's License</label>
                    <Field
                      type="checkbox"
                      name="driversLicense"
                      onChange={({ target: { checked } }) => {
                        setFieldValue("driversLicense", checked);
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ margin: 0, whiteSpace: 'nowrap', width: '200px' }}>Manitoba Health Card</label>
                    <Field
                      type="checkbox"
                      name="healthCard"
                      onChange={({ target: { checked } }) => {
                        setFieldValue("healthCard", checked);
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ margin: 0, whiteSpace: 'nowrap', width: '200px' }}>Status Card</label>
                    <Field
                      type="checkbox"
                      name="statusCard"
                      onChange={({ target: { checked } }) => {
                        setFieldValue("statusCard", checked);
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ margin: 0, whiteSpace: 'nowrap', width: '200px' }}>Enhanced I.D.</label>
                    <Field
                      type="checkbox"
                      name="enhancedID"
                      onChange={({ target: { checked } }) => {
                        setFieldValue("enhancedID", checked);
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ margin: 0, whiteSpace: 'nowrap', width: '200px' }}>Student I.D.</label>
                    <Field
                      type="checkbox"
                      name="studentID"
                      onChange={({ target: { checked } }) => {
                        setFieldValue("studentID", checked);
                      }}
                    />
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>Do you have access to an elder or Counsellor?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="accessElder"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="accessElder"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>
            </Col>
            {values.accessElder === "no" && (
              <Col md={8}>
                <label>
                  Are you interested in getting access to an Elder or
                  Counsellor?
                </label>
                <Field
                  as="textarea"
                  name="accessElderExplained"
                  className={styles.textarea}
                />
              </Col>
            )}
          </Row>

          <Row className={styles.group}>
            <label>Is there an educational support person you contact?</label>
            <FieldArray name="educationalPersons">
              {({ push, remove }) => (
                <div>
                  {values.educationalPersons.map((educationalPerson, index) => (
                    <div
                      key={index}
                      className={`${styles.bglightgrey} border rounded p-2 mb-3`}
                    >
                      <Row className="align-items-center">
                        <Col md={4}>
                          <div>
                            <label
                              htmlFor={`educationalPersons.${index}.firstName`}
                            >
                              First Name:
                            </label>
                            <Field
                              id={`educationalPersons.${index}.firstName`}
                              name={`educationalPersons.${index}.firstName`}
                              component={ValidNameInput}
                            />
                          </div>
                        </Col>

                        <Col md={4}>
                          <div>
                            <label
                              htmlFor={`educationalPersons.${index}.middleName`}
                            >
                              Middle Name:
                            </label>
                            <Field
                              id={`educationalPersons.${index}.middleName`}
                              name={`educationalPersons.${index}.middleName`}
                              component={ValidNameInput}
                            />
                          </div>
                        </Col>
                        <Col md={4}>
                          <div>
                            <label
                              htmlFor={`educationalPersons.${index}.lastName`}
                            >
                              Last Name:
                            </label>
                            <Field
                              id={`educationalPersons.${index}.lastName`}
                              name={`educationalPersons.${index}.lastName`}
                              component={ValidNameInput}
                            />
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={4}>
                          <div>
                            <label
                              htmlFor={`educationalPersons.${index}.relationship`}
                            >
                              Relationship:
                            </label>
                            <Field
                              id={`educationalPersons.${index}.relationship`}
                              name={`educationalPersons.${index}.relationship`}
                              component={ValidNameInput}
                            />
                          </div>
                        </Col>
                        <Col md={4}>
                          <Field
                            name={`educationalPersons.${index}.phoneNumber`}
                            label="Phone Number:"
                            component={PhoneNumberInput}
                            placeholder="(123) 456-7890"
                            error={
                              errors.educationalPersons?.[index]?.phoneNumber
                            }
                          />
                        </Col>
                        <Col md={4}>
                          <Field
                            name={`educationalPersons.${index}.email`}
                            label="Email Address:"
                            component={EmailInput}
                            placeholder="youremail@example.com"
                          />
                        </Col>
                      </Row>
                      <Row>
                        <Col md={9}></Col>
                        <Col md={3} className="d-flex align-items-end mt-2">
                          <Button
                            className="w-100 btn btn-danger"
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
                    + Add Educational Support Person
                  </Button>
                </div>
              )}
            </FieldArray>
          </Row>
        </>
    );
};

export default YouthIntakeEducation;
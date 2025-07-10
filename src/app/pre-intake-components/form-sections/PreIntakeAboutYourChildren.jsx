"use client";
import React from "react";
import styles from "../../pre-intake/preIntake.module.css";
import { Field, ErrorMessage, FieldArray } from "formik";
import { Button, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import ValidNameInput from "@/components/ValidNameInput";
import InputField from "@/components/InputField";
import FirstNationSelect from "@/components/FirstNationSelect";
import PreIntakeAgencyInfo from "./PreIntakeAgencyInfo";

const PreIntakeAboutYourChildren = ( { values, errors } ) => {
    return(
        <>
            <Row>
            <h3 className="text-dark">About Your Children</h3>
            <FieldArray name="children">
              {({ push, remove }) => (
                <div>
                  {/* Debug: Show current children count */}
                  <div style={{display: 'none'}}>
                    Debug: {values.children.length} children in form
                  </div>
                  
                  {values.children.map((child, index) => (
                    <div
                      key={index}
                      className={`${styles.bglightgrey} border rounded p-2 mb-3`}
                    >
                      <Row className="align-items-center">
                        <Col md={3}>
                          <div>
                            <label htmlFor={`children.${index}.firstName`}>
                              First Name:
                            </label>
                            <Field
                              id={`children.${index}.firstName`}
                              name={`children.${index}.firstName`}
                              component={ValidNameInput}
                            />
                          </div>
                        </Col>

                        <Col md={3}>
                          <div>
                            <label htmlFor={`children.${index}.middleName`}>
                              Middle Name:
                            </label>
                            <Field
                              id={`children.${index}.middleName`}
                              name={`children.${index}.middleName`}
                              component={ValidNameInput}
                            />
                          </div>
                        </Col>
                        <Col md={5}>
                          <div>
                            <label htmlFor={`children.${index}.lastName`}>
                              Last Name:
                            </label>
                            <Field
                              id={`children.${index}.lastName`}
                              name={`children.${index}.lastName`}
                              component={ValidNameInput}
                            />
                          </div>
                        </Col>
                      </Row>
                      <Row className="mb-4">
                        <Col md={3}>
                          <div>
                            <label htmlFor={`children.${index}.birthDate`}>
                              Date of Birth:
                            </label>
                            <Field
                              type="date"
                              id={`children.${index}.birthDate`}
                              name={`children.${index}.birthDate`}
                            />
                            <ErrorMessage
                              name={`children.${index}.birthDate`}
                              component={() => (
                                <p className={styles.errorText}>
                                  {errors.children?.[index]?.birthDate}
                                </p>
                              )}
                            />
                          </div>
                        </Col>
                        <Col md={6}>
                          <Field
                            name={`children.${index}.childNation`}
                            component={FirstNationSelect}
                            label="First Nation Membership"
                            error={errors.childNation}
                          />
                        </Col>
                        <Col md={3}>
                          <InputField
                            name={`children.${index}.childPlaced`}
                            label="Place of Stay:"
                          />
                        </Col>
                      </Row>

                      {/* Agency information */}
                      <PreIntakeAgencyInfo
                        index={index}
                        errors={errors}
                      />
                      
                      {/* END Agency information */}

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
                    onClick={() => {
                      console.log("🔍 Adding child, current count:", values.children.length);
                      push({
                        firstName: "",
                        middleName: "",
                        lastName: "",
                        birthDate: "",
                        childNation: "",
                        childPlaced: "",
                        childCfsAgency: "",
                        childCfsAgentFullName: "",
                        childCfsAgentNumber: "",
                        childCfsAgentEmail: "",
                        childStatusCfsFile: "",
                      });
                      console.log("🔍 Child added, new count:", values.children.length + 1);
                    }}
                  >
                    + Add Child
                  </Button>
                </div>
              )}
            </FieldArray>
          </Row>

          <Row className={styles.group}>
            <Col md={6}>
              <div>
                <label>Do you currently have visits with your children?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="visitsChild"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="visitsChild"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="visitsChild"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.visitsChild === "yes" && (
              <Col md={8}>
                <label>If yes, how often?</label>
                <Field
                  as="textarea"
                  name="visitsChildFrequency"
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="visitsChildFrequency"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>
          <Row className={styles.group}>
            <Col md={6}>
              <div>
                <label>Do you have a copy of your case plan(s)?</label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="casePlanCopy"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="casePlanCopy"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
                <ErrorMessage
                  name="casePlanCopy"
                  component="div"
                  className={styles.errorText}
                />
              </div>
            </Col>
            {values.casePlanCopy === "no" && (
              <Col md={8}>
                <label>
                  If no, describe the last requests the agency asked you to
                  complete to get your children home:
                </label>
                <Field
                  as="textarea"
                  name="casePlanCopyDescribe"
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="casePlanCopyDescribe"
                  component="div"
                  className={styles.errorText}
                />
              </Col>
            )}
          </Row>
          <Row className={styles.group}>
            <Col>
              <label>Reason for CFS involvement with your family:</label>
              <Field
                as="textarea"
                name="involvedCFSReason"
                className={styles.textarea}
              />
              <ErrorMessage
                name="involvedCFSReason"
                component="div"
                className={styles.errorText}
              />
            </Col>
          </Row>
        </>
    );
};

export default PreIntakeAboutYourChildren;
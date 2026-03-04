"use client";
import styles from "../../full-intake/fullIntake.module.css"
import { Field, ErrorMessage, FieldArray } from "formik";
import { Button, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";
import FirstNationSelect from "@/components/FirstNationSelect";
import MartialStatusSelect from "@/components/MartialStatusSelect";
import YesNoSelect from "@/components/yesNoSelect";
import "react-tabs/style/react-tabs.css";

const GeneralInformationPartition = ({
    errors,
    isEditing,
    values,
    validateRadio,
    setFieldValue,
}) => {
    return (
        <>
            <Row className="mt-2">
                <Col md={5}>
                    <Field
                        name="firstNationMembership"
                        component={FirstNationSelect}
                        label="First Nation Membership"
                        error={errors.firstNationMembership}
                        disabled={!isEditing}
                    />
                </Col>
                <Col md={3}>
                    {/* <InputField 
                        name="treatyNumber" 
                        label="Treaty Number:" 
                        placeholder="" 
                        error={errors.treatyNumber} 
                        disabled={!isEditing} 
                    /> */}
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
                            disabled={!isEditing}
                            onChange={(e) => {
                                const digits = String(e.target.value || "").replace(/\D/g, "");
                                setFieldValue("treatyNumber", digits);
                            }}
                            onBlur={(e) => {
                                const raw = String(e.target.value || "");
                                const digits = raw.replace(/\D/g, "");
                                if (digits.length > 0) {
                                    const digitpad = digits.padStart(10, "0");
                                    setFieldValue("treatyNumber", digitpad);
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
                        disabled={!isEditing}
                    />
                </Col>
            </Row>

            <Row className="mt-3">
                <Col md={5}>
                    {/* <label>Personal Health Identification Numbers (9-Digit):</label> */}
                    {/* <Field 
                        type="number" 
                        id="ninePersonalHealthNumber" 
                        placeholder="000000000" 
                        name="ninePersonalHealthNumber" 
                        disabled={!isEditing} 
                    />
                    <ErrorMessage 
                        name="ninePersonalHealthNumber" 
                        component={() => 
                            <p 
                                className={styles.errorText}>{errors.ninePersonalHealthNumber}
                            </p>
                        } 
                    /> */}

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
                            disabled={!isEditing}
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
                <Col md={3}>
                {/* <label>(6-Digit):</label>
                    <Field 
                        type="number" 
                        id="sixPersonalHealthNumber" 
                        placeholder="000000" 
                        name="sixPersonalHealthNumber" 
                        disabled={!isEditing} 
                    />
                    <ErrorMessage 
                        name="sixPersonalHealthNumber" 
                        component={() => 
                            <p className={styles.errorText}>
                                {errors.sixPersonalHealthNumber}
                            </p>
                        } 
                    /> */}
                    <label>(6-Digit):</label>
                    <Field
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={6}
                        id="sixPersonalHealthNumber"
                        placeholder="000000"
                        name="sixPersonalHealthNumber"
                        disabled={!isEditing} 
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
                <Col md={4}>
                    <MartialStatusSelect name="martialStatus" label="Marital Status" error={errors.martialStatus} disabled={!isEditing} />
                </Col>
            </Row>

            <hr className="separator-line" />
            <Row className={styles.group}>
                <Col md={4}>
                    <div>
                        <label>Are you living on or off reserve?  </label>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="onReserve" value="yes" checked={values.onReserve === "yes"} disabled={!isEditing} />
                            <label className="form-check-label">Yes</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="onReserve" value="no" checked={values.onReserve === "no"} disabled={!isEditing} />
                            <label className="form-check-label">No</label>
                        </div>
                        <ErrorMessage name="onReserve" component="div" className={styles.onReserve} />
                    </div>
                </Col>
                <Col md={4}>
                    <div>
                        <label>Have you transitioned from a reserve to the city recently?</label>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="transitionFromReserve" value="yes" checked={values.transitionFromReserve === "yes"} disabled={!isEditing} />
                            <label className="form-check-label">Yes</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="transitionFromReserve" value="no" checked={values.transitionFromReserve === "no"} disabled={!isEditing} />
                            <label className="form-check-label">No</label>
                        </div>
                        <ErrorMessage name="transitionFromReserve" component="div" className={styles.transitionFromReserve} />
                    </div>
                </Col>
                <Col md={4}>
                    <div>
                        <label>Are you a previous client of FNFAO?</label>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="previousFNFAOClient" value="yes" checked={values.previousFNFAOClient === "yes"} disabled={!isEditing} />
                            <label className="form-check-label">Yes</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="previousFNFAOClient" value="no" checked={values.previousFNFAOClient === "no"} disabled={!isEditing}/>
                            <label className="form-check-label">No</label>
                        </div>
                        <ErrorMessage name="previousFNFAOClient" component="div" className={styles.previousFNFAOClient} />
                    </div>
                </Col>
            </Row>

            <Row className={styles.group}>
                <Col md={4}>
                    <div>
                        <label>Need prenatal support?</label>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="prenatalSupport" value="yes"  checked={values.prenatalSupport === "yes"} disabled={!isEditing} />
                            <label className="form-check-label">Yes</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="prenatalSupport" value="no" checked={values.prenatalSupport === "no"} disabled={!isEditing} />
                            <label className="form-check-label">No</label>
                        </div>
                        <ErrorMessage name="prenatalSupport" component="div" className={styles.errorText} />
                    </div>
                </Col>
                {values.prenatalSupport === "yes" && (

                    <Col md={8}>
                        <label>If yes, specify (e.g. help avoiding birth apprehension, access to prenatal care, breastfeeding information, preparing for baby, etc.):</label>
                        <Field as="textarea" name="prenatalSupportSpecified" className={styles.textarea} disabled={!isEditing} />
                        <ErrorMessage name="prenatalSupportSpecified" component="div" className={styles.errorText} />
                    </Col>
                )}
            </Row>

            <Row className={styles.group}>
                <Col md={4}>
                    <div>
                        <label>Need housing support?</label>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="housingSupport" value="yes" checked={values.housingSupport === "yes"} disabled={!isEditing} />
                            <label className="form-check-label">Yes</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="housingSupport" value="no" checked={values.housingSupport === "no"} disabled={!isEditing} />
                            <label className="form-check-label">No</label>
                        </div>
                        <ErrorMessage name="housingSupport" component="div" className={styles.errorText} />
                    </div>
                </Col>
                {values.housingSupport === "yes" && (

                    <Col md={8}>
                        <label>If yes, specify (e.g. urgent housing, preventing eviction, dealing with the Residential Tenancies Branch, etc):</label>
                        <Field as="textarea" name="housingSupportSpecified" className={styles.textarea} disabled={!isEditing} />
                        <ErrorMessage name="housingSupportSpecified" component="div" className={styles.errorText} />
                    </Col>
                )}
            </Row>

            <Row className={styles.group}>
                <Col md={4}>
                    <div>
                        <label>Need addictions support?</label>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="addictionsSupport" value="yes" checked={values.addictionsSupport === "yes"} disabled={!isEditing} />
                            <label className="form-check-label">Yes</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <Field  className="form-check-input" type="radio" name="addictionsSupport" value="no" checked={values.addictionsSupport === "no"} disabled={!isEditing} />
                            <label className="form-check-label">No</label>
                        </div>
                        <ErrorMessage name="addictionsSupport" component="div" className={styles.errorText} />
                    </div>
                </Col>
                {values.addictionsSupport === "yes" && (

                    <Col md={8}>
                        <label>If yes, specify (e.g. access to detox, treatment, relapse prevention programming, etc.):</label>
                        <Field as="textarea" name="addictionsSupportSpecified" className={styles.textarea} disabled={!isEditing} />
                        <ErrorMessage name="addictionsSupportSpecified" component="div" className={styles.errorText} />
                    </Col>
                )}
            </Row>

            {/* Home members */}
            <Row className="mt-3">
                <div className={styles.group}>
                    <h5>Important Family Members and Friends</h5>

                    <FieldArray name="homeMembers">
                    {({ push, remove }) => (
                        <div  className="bg-gray-100 p-2 rounded border border-light border-2">
                        {values.homeMembers.map((member, index) => (
                            <div key={`${member.home_members_id}-${index}`} className={`${styles.bglightgrey} border rounded p-2 mb-3`}>
                            <Row className="align-items-center">
                                <Col md={4}>
                                <InputField
                                    name={`homeMembers.${index}.firstName`}
                                    label="First Name:"
                                    disabled={!isEditing}
                                />
                                </Col>

                                <Col md={4}>
                                <InputField
                                    name={`homeMembers.${index}.lastName`}
                                    label="Last Name:"
                                    disabled={!isEditing}
                                />
                                </Col>

                                <Col md={4}>
                                <InputField
                                    name={`homeMembers.${index}.relationship`}
                                    label="Relationship:"
                                    disabled={!isEditing}
                                />
                                </Col>
                            </Row>

                            <Row>
                                <Col md={4}>
                                    <div>
                                    <label
                                        htmlFor={`homeMembers.${index}.phoneNumber`}
                                    >
                                        Phone Number:
                                    </label>
                                    <Field
                                        type="number"
                                        id={`homeMembers.${index}.phoneNumber`}
                                        name={`homeMembers.${index}.phoneNumber`}
                                        component={PhoneNumberInput}
                                        placeholder="(123) 456-7890"
                                        disabled={!isEditing}
                                    />
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div>
                                        <label htmlFor={`homeMembers.${index}.email`}>Email:</label>
                                        <Field type="email" id={`homeMembers.${index}.email`} name={`homeMembers.${index}.email`} disabled={!isEditing} />
                                        <ErrorMessage
                                            name={`homeMembers.${index}.email`}
                                            component={() => <p className={styles.errorText}>{errors.homeMembers?.[index]?.email}</p>} />
                                    </div>
                                </Col>
                                <Col  md={4}>
                                    <YesNoSelect
                                        name={`homeMembers.${index}.livingTogether`}
                                        label="Living Together?"
                                        error={errors.homeMembers?.[index]?.livingTogether}
                                        disabled={!isEditing}
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
                                    disabled={!isEditing}
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
                            disabled={!isEditing}
                            onClick={() =>
                            push({
                                firstName: "",
                                lastName: "",
                                relationship: "",
                                phoneNumber: "",
                                email:"",
                                livingTogether: null
                            })}>
                            + Add Member
                        </Button>
                        </div>
                    )}
                    </FieldArray>
                </div>
            </Row>

            {/* Checkboxes */}

            <div className={styles.group}>
                <label>Have you or a family member ever experienced any of the following? (Please check all that apply)</label>
                {[
                    { name: "residentialSchool", label: "Attended Residential School?" },
                    { name: "cfsCare", label: "Been in CFS Care?" },
                    { name: "adoptedScoop", label: "Adopted in the 60's Scoop?" },
                    { name: "experiencedSuicide", label: "Experienced Suicide in your family?" },
                    { name: "MMIWG2S", label: "Connect with the MMIWG2S+ experience?" },
                    { name: "familyViolence", label: "Impacted by Family Violence?" }
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

            <Row className={styles.group}>
                <h5>Lawyer Information</h5>
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
                                    disabled={!isEditing}
                                />
                                <label className="form-check-label">Yes</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <Field
                                    className="form-check-input"
                                    type="radio"
                                    name="currentLawyer"
                                    value="no"
                                    disabled={!isEditing}
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
                </Row>

                {values.currentLawyer === "yes" && (
                    <Row className={styles.group}>
                        <Col md={4}>
                            <InputField name="lawyerFullName" label="Lawyer's Full Name:" placeholder="John" error={errors.lawyerFullName} disabled={!isEditing} />
                        </Col>
                        <Col md={4}>
                            <div>
                                <label htmlFor="lawyerPhoneNumber">Lawyer's Phone Number:</label>
                                <Field type="number" id="lawyerPhoneNumber" name="lawyerPhoneNumber" component={PhoneNumberInput} placeholder="(123) 456-7890" disabled={!isEditing} />
                                <ErrorMessage name="lawyerPhoneNumber" component={() => <p className={styles.errorText}>{errors.lawyerPhoneNumber}</p>} />
                            </div>
                        </Col>
                        <Col md={4}>
                            <div>
                                <label htmlFor="lawyerEmail">Lawyer's Email:</label>
                                <Field type="email" id="lawyerEmail" name="lawyerEmail" disabled={!isEditing} />
                                <ErrorMessage name="lawyerEmail" component={() => <p className={styles.errorText}>{errors.lawyerEmail}</p>} />
                            </div>
                        </Col>
                    </Row>
                )}

                {values.currentLawyer === "no" && (
                    <Row className={styles.group}>
                        <Col md={3}>
                            <div>
                                <label>If no, need legal assistance?</label>
                                <div className="form-check form-check-inline">
                                    <Field
                                        className="form-check-input"
                                        type="radio"
                                        name="legalAssistance"
                                        value="yes"
                                        disabled={!isEditing}
                                    />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <Field
                                        className="form-check-input"
                                        type="radio"
                                        name="legalAssistance"
                                        value="no"
                                        disabled={!isEditing}
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
                            <Col md={9}>
                                <label>If yes, specify:</label>
                                <Field
                                    as="textarea"
                                    name="legalAssistanceSpecified"
                                    className={styles.textarea}
                                    disabled={!isEditing}
                                />
                                <ErrorMessage
                                    name="legalAssistanceSpecified"
                                    component="div"
                                    className={styles.errorText}
                                />
                            </Col>
                        )}
                    </Row>
                )}
            </Row>

            <Row className={styles.group}>
                <Col className="mt-1">
                    <label>Source of Income: </label>
                    <Field as="textarea" name="sourceIncome" className={styles.textarea} disabled={!isEditing} />
                    <ErrorMessage name="sourceIncome" component="div" className={styles.errorText} />
                </Col>
            </Row>

            <Row className={styles.group}>
                <h5>(EIA) Contact Information </h5>
                <label htmlFor="">If on Employment and Income Assistance (EIA), provide Contact Information:</label>
                <FieldArray name="EIA">
                    {({ push, remove }) => (
                        <div  className="bg-gray-100 p-2 rounded border border-light border-2">
                        {values.EIA.map((member, index) => (
                            <div key={`${member.EIA_worker_id}-${index}`} className={`${styles.bglightgrey} border rounded p-2 mb-3`}>
                            <Row className="align-items-center">
                                <Col md={3}>
                                    <InputField
                                        name={`EIA.${index}.firstName`}
                                        label="First Name:"
                                        disabled={!isEditing}
                                    />
                                </Col>

                                <Col md={3}>
                                    <InputField
                                        name={`EIA.${index}.lastName`}
                                        label="Last Name:"
                                        disabled={!isEditing}
                                    />
                                </Col>

                                <Col md={3}>
                                    <div>
                                    <label
                                        htmlFor={`EIA.${index}.phoneNumber`}
                                    >
                                        Phone Number:
                                    </label>
                                    <Field
                                        type="number"
                                        id={`EIA.${index}.phoneNumber`}
                                        name={`EIA.${index}.phoneNumber`}
                                        component={PhoneNumberInput}
                                        placeholder="(123) 456-7890"
                                        disabled={!isEditing}
                                    />
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <InputField
                                        name={`EIA.${index}.EIACaseNumber`}
                                        label="Case Number:"
                                        disabled={!isEditing}
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
                                    disabled={!isEditing}
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
                            disabled={!isEditing}
                            onClick={() =>
                            push({
                                firstName: "",
                                lastName: "",
                                phoneNumber: "",
                                EIACaseNumber: "",
                            })
                            }
                        >
                            + Add EIA Worker
                        </Button>
                        </div>
                    )}
                </FieldArray>
            </Row>

            <Row className={styles.group}>
                <Col md={4}>
                <div>
                    <label>Do you or do any of your children require youth support?</label>
                    <div className="form-check form-check-inline">
                    <Field
                        className="form-check-input"
                        type="radio"
                        name="youthSupport"
                        value="yes"
                        disabled={!isEditing}
                    />
                    <label className="form-check-label">Yes</label>
                    </div>
                    <div className="form-check form-check-inline">
                    <Field
                        className="form-check-input"
                        type="radio"
                        name="youthSupport"
                        value="no"
                        disabled={!isEditing}
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
                        className={styles.textarea}
                        disabled={!isEditing}
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
                    <label>Are you seeking support for custody related issues? </label>
                    <div className="form-check form-check-inline">
                    <Field
                        className="form-check-input"
                        type="radio"
                        name="custodySupport"
                        value="yes"
                        disabled={!isEditing}
                    />
                    <label className="form-check-label">Yes</label>
                    </div>
                    <div className="form-check form-check-inline">
                    <Field
                        className="form-check-input"
                        type="radio"
                        name="custodySupport"
                        value="no"
                        disabled={!isEditing}
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
                        If yes, please specify what kind of custody-related issues
                        (Example: ex-spouse not honouring custody arrangement for
                        access/visitation, grandparent access, child support, etc.):
                    </label>
                    <Field
                        as="textarea"
                        name="custodySupportSpecified"
                        className={styles.textarea}
                        disabled={!isEditing}
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
                <Col md={4}>
                <div>
                    <label> Do you have any criminal charges (past, active or pending)?</label>
                    <div className="form-check form-check-inline">
                    <Field
                        className="form-check-input"
                        type="radio"
                        name="criminalCharges"
                        value="yes"
                        validate={validateRadio}
                        disabled={!isEditing}
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
                        disabled={!isEditing}
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
                        className={styles.textarea}
                        disabled={!isEditing}
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
                <Col md={4}>
                <div>
                    <label>Do you currently have an active arrest warrant?</label>
                    <div className="form-check form-check-inline">
                    <Field
                        className="form-check-input"
                        type="radio"
                        name="activeWarrant"
                        value="yes"
                        validate={validateRadio}
                        disabled={!isEditing}
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
                        disabled={!isEditing}
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
                        className={styles.textarea}
                        disabled={!isEditing}
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
                <Col md={4}>
                <div>
                    <label>
                    Are you currently under child abuse investigation?
                    </label>
                    <div className="form-check form-check-inline">
                    <Field
                        className="form-check-input"
                        type="radio"
                        name="activeInvestigation"
                        value="yes"
                        validate={validateRadio}
                        disabled={!isEditing}
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
                        disabled={!isEditing}
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
                        disabled={!isEditing}
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
                <Col md={4}>
                <div>
                    <label>
                    Any active No Contact Orders or Protection Orders?
                    </label>
                    <div className="form-check form-check-inline">
                    <Field
                        className="form-check-input"
                        type="radio"
                        name="activeOrders"
                        value="yes"
                        validate={validateRadio}
                        disabled={!isEditing}
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
                        disabled={!isEditing}
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
                        className={styles.textarea}
                        disabled={!isEditing}
                    />
                    <ErrorMessage
                        name="activeOrdersExplained"
                        component="div"
                        className={styles.errorText}
                    />
                </Col>
                )}
            </Row>
        </>
    );
};

export default GeneralInformationPartition;
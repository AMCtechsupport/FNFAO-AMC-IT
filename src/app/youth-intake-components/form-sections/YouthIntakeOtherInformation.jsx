"use client";
import styles from "../../youth-intake/youthIntake.module.css";
import { Field, ErrorMessage } from "formik";
import { Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const YouthIntakeOtherInformation = ( { values } ) => {
    return(
        <>
          <Row>
            <h3 className="text-dark">Other Information:</h3>
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>
                  Do you have any involvement with the Youth Justice System?
                </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="youthJustice"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="youthJustice"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>
            </Col>
            {values.youthJustice === "yes" && (
              <Col md={8}>
                <label>
                  Please share the details: (examples, any pending/active
                  charges, conditions or how it may affect you)
                </label>
                <Field
                  as="textarea"
                  name="custodySupportSpecified"
                  placeholder="Involvement with Youth Justice System include..."
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
            <Col md={4}>
              <div>
                <label>
                  Would you be interested in speaking to someone at the office?
                </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="speakingOffice"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="speakingOffice"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>
            </Col>
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>
                  Are you interested in attending any youth workshops?
                </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="youthWorkshops"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="youthWorkshops"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>
            </Col>
          </Row>

          <Row className={styles.group}>
            <Col md={4}>
              <div>
                <label>
                  Are you connected to any other community or organization?
                </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="connectedCommunity"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="connectedCommunity"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>
            </Col>
            {values.connectedCommunity === "yes" && (
              <Col md={8}>
                <label>Please share the details:</label>
                <Field
                  as="textarea"
                  name="connectedCommunityExplained"
                  placeholder="e.g., Client is involved with 'Community' by 'Reason'..."
                  className={styles.textarea}
                />
                <ErrorMessage
                  name="connectedCommunityExplained"
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
                  Do you have any disabilities (physical, intellectual, etc.)?
                </label>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="disabilities"
                    value="yes"
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    className="form-check-input"
                    type="radio"
                    name="disabilities"
                    value="no"
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>
            </Col>
            {values.disabilities === "yes" && (
              <Col md={8}>
                <label>Please Explain:</label>
                <Field
                  as="textarea"
                  name="disabilitiesExplained"
                  placeholder="e.g., Client has a physical/cognative/intellectual disability where they..."
                  className={styles.textarea}
                />
              </Col>
            )}
          </Row>

          <Row>
            <Col>
              <label>
                If comfortable, please tell us about your experience in care:
              </label>
              <Field
                as="textarea"
                name="careExperience"
                placeholder="Experience in care include..."
                className={styles.textarea}
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <label>
                Please tell us what kind of support and/or advocacy you hope to
                receive from the First Nations Family Advocate Office (FNFAO)
                Rites of Passage Team:
              </label>
              <Field
                as="textarea"
                name="kindSupport"
                placeholder="Hopes to receive support/advocacy in regards to..."
                className={styles.textarea}
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <label>Please tell us about some of your personal goals:</label>
              <Field
                as="textarea"
                name="personalGoals"
                placeholder="e.g., Client wants to acheive X by this time..."
                className={styles.textarea}
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <label>
                Please tell us about any additional information that you would
                like to share or attach any documents you feel may be important
                to your journey at this time:
              </label>
              <Field
                as="textarea"
                name="additionalInformation"
                placeholder="Additional client information includes..."
                className={styles.textarea}
              />
            </Col>
          </Row>

        </>
    );
};

export default YouthIntakeOtherInformation;
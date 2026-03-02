"use client";
import styles from "../../youth-intake/youthIntake.module.css";
import { Field } from "formik";
import { Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import ValidNameInput from "@/components/ValidNameInput";
import FirstNationSelect from "@/components/FirstNationSelect";

const YouthIntakeBiologicalParentInfo = ( {errors} ) => {
    return(
        <>
            <div className={styles.group}>
            <h3 className="text-dark">Biological Parent's Information: </h3>
            <Row>
              <Col md={4}>
                <div>
                  <label htmlFor="motherFirstName">Mother's First Name:</label>
                  <Field
                    id="motherFirstName"
                    name="motherFirstName"
                    component={ValidNameInput}
                    placeholder="Mother's First Name"
                  />
                </div>
              </Col>

              <Col md={4}>
                <div>
                  <label htmlFor="motherMiddleName">
                    Mother's Middle Name:
                  </label>
                  <Field
                    id="motherMiddleName"
                    name="motherMiddleName"
                    placeholder="Mother's Middle Name"
                    component={ValidNameInput}
                  />
                </div>
              </Col>

              <Col md={4}>
                <div>
                  <label htmlFor="motherLastName">Mother's Last Name:</label>
                  <Field
                    id="motherLastName"
                    name="motherLastName"
                    placeholder="Mother's Last Name"
                    component={ValidNameInput}
                  />
                </div>
              </Col>
              <Col md={4}>
                <Field
                  name="motherNation"
                  component={FirstNationSelect}
                  label="Mother's First Nation Membership"
                  error={errors.motherNation}
                />
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <div>
                  <label htmlFor="fatherFirstName">Father's First Name:</label>
                  <Field
                    id="fatherFirstName"
                    name="fatherFirstName"
                    component={ValidNameInput}
                    placeholder="Father's Middle Name"
                  />
                </div>
              </Col>

              <Col md={4}>
                <div>
                  <label htmlFor="fatherMiddleName">
                    Father's Middle Name:
                  </label>
                  <Field
                    id="fatherMiddleName"
                    name="fatherMiddleName"
                    placeholder="Father's Middle Name"
                    component={ValidNameInput}
                  />
                </div>
              </Col>

              <Col md={4}>
                <div>
                  <label htmlFor="fatherLastName">Father's Last Name:</label>
                  <Field
                    id="fatherLastName"
                    name="fatherLastName"
                    placeholder="Father's Last Name"
                    component={ValidNameInput}
                  />
                </div>
              </Col>
              <Col md={4}>
                <Field
                  name="fatherNation"
                  component={FirstNationSelect}
                  label="Father's First Nation Membership"
                  error={errors.fatherNation}
                />
              </Col>
            </Row>
          </div>
        </>
    );
};

export default YouthIntakeBiologicalParentInfo;
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../full-intake/fullIntake.module.css";
import { Formik, Form } from "formik";
import { Button, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

// Form sections
import HealthWellnessPartition from "./form-sections/HealthWellnessPartition";
import CaseNotesPartition from "./form-sections/CaseNotesPartition";
import LegalNotesPartition from "./form-sections/LegalNotesPartition";
import ChildrenPartition from "./form-sections/ChildrenPartition";
import ChildFamilyServicesPartition from "./form-sections/ChildFamilyServices";
import GeneralInformationPartition from "./form-sections/GeneralInformationPartition";
import GeneralInformationHeader from "./form-sections/GeneralInformationHeader";

// Utils
import fetchFullIntakeValues from "./utils/fetchFullIntakeValues";
import fullIntakeInputValidation from "./utils/fullIntakeInputValidation";
import { fetchClientData } from "./utils/fetchClientData";
import FullIntakeFormSubmit from "./utils/FullIntakeFormSubmit";

export default function FullIntakeForm({
  client_id,
  userId,
  getToken,
  isEditMode = false,
  isViewOnly = false,
}) {
  const router = useRouter();
  const [originalData, setOriginalData] = useState(null);
  const [childrenData, setChildrenData] = useState([]);
  const [familyData, setFamilyData] = useState([]);
  const [homeMembersData, setHomeMembersData] = useState([]);
  const [EIAData, setEIAData] = useState([]);

  const [notesData, setNotesData] = useState([]);
  const [caseNotes, setCaseNotes] = useState([]);
  const [legalNotes, setLegalNotes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(isEditMode && !isViewOnly);
  const [formSent, setFormSent] = useState(false);

  const [selectedNote, setSelectedNote] = useState(null);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);

  useEffect(() => {
    if (isViewOnly) setIsEditing(false);
  }, [isViewOnly]);

  // ✅ View-only patch (same behavior as Youth Intake)
  useEffect(() => {
    if (!isViewOnly) return;

    const runPatch = () => {
      const form = document.querySelector("form");
      if (!form) return;

      const forceWhiteBlockedLook = (el) => {
        el.style.setProperty("background-color", "#ffffff", "important");
        el.style.setProperty("opacity", "1", "important");
        el.style.setProperty("cursor", "not-allowed", "important");
        el.style.setProperty("color", "#111827", "important");
        el.style.setProperty("-webkit-text-fill-color", "#111827", "important");
      };

      const applyToElement = (el) => {
        const tag = el.tagName.toLowerCase();

        // remove placeholders if empty
        if ((tag === "input" || tag === "textarea") && !el.value) {
          el.setAttribute("placeholder", "");
        }

        // prevent caret focus
        if (!el.dataset.viewonlyBound) {
          const onFocus = () => el.blur();
          el.addEventListener("focus", onFocus);
          el.dataset.viewonlyBound = "true";
        }

        forceWhiteBlockedLook(el);

        if (tag === "textarea") {
          el.readOnly = true;
          el.disabled = false;
          el.tabIndex = -1;
          return;
        }

        if (tag === "input") {
          const type = (el.getAttribute("type") || "text").toLowerCase();

          if (["checkbox", "radio", "file", "date", "time"].includes(type)) {
            el.disabled = true;
            el.readOnly = false;
            el.tabIndex = -1;
            forceWhiteBlockedLook(el);
            return;
          }

          el.disabled = false;
          el.readOnly = true;
          el.tabIndex = -1;
          forceWhiteBlockedLook(el);
          return;
        }

        if (tag === "select") {
          el.disabled = true;
          el.tabIndex = -1;
          forceWhiteBlockedLook(el);

          const selectedOption = el.options?.[el.selectedIndex];
          const selectedText = (selectedOption?.textContent || "").trim();
          const selectedValue = (el.value || "").trim();

          const isEmptySelect =
            selectedValue === "" ||
            selectedValue === "0" ||
            /^select\b/i.test(selectedText);

          if (isEmptySelect) {
            el.style.setProperty("color", "transparent", "important");
            el.style.setProperty("-webkit-text-fill-color", "transparent", "important");
            el.style.setProperty("text-shadow", "0 0 0 transparent", "important");
          } else {
            el.style.setProperty("color", "#111827", "important");
            el.style.setProperty("-webkit-text-fill-color", "#111827", "important");
            el.style.setProperty("text-shadow", "none", "important");
          }
          return;
        }

        if (tag === "button") {
          el.disabled = true;
          el.tabIndex = -1;
        }
      };

      const elements = form.querySelectorAll("input, textarea, select, button");
      elements.forEach(applyToElement);
    };

    runPatch();
    const timers = [
      setTimeout(runPatch, 50),
      setTimeout(runPatch, 150),
      setTimeout(runPatch, 300),
      setTimeout(runPatch, 600),
      setTimeout(runPatch, 1000),
    ];

    const onClick = () => runPatch();
    document.addEventListener("click", onClick);

    return () => {
      timers.forEach(clearTimeout);
      document.removeEventListener("click", onClick);
    };
  }, [isViewOnly]);

  const handleShowNoteDetails = (note) => setSelectedNote(note);
  const handleCloseNoteDetails = () => setSelectedNote(null);

  const handleAddNoteClick = (values, push, noteType) => {
    const newNote = {
      client_id: client_id,
      type: values.type || "General",
      subType: values.subType || "Uncategorized",
      description: values.description?.trim() || "No description provided",
      actionPlan: values.actionPlan?.trim() || "No action plan provided",
      advocate_id: "19",
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      noteType: noteType,
    };

    push(newNote);
    setShowNewNoteForm(true);
  };

  const validateRadio = () => undefined;

  useEffect(() => {
    fetchClientData({
      client_id,
      setLoading,
      setOriginalData,
      setChildrenData,
      setFamilyData,
      setHomeMembersData,
      setEIAData,
      setNotesData,
      setCaseNotes,
      setLegalNotes,
    });
  }, [client_id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="form-container">
      <Formik
        initialValues={fetchFullIntakeValues({
          originalData,
          childrenData,
          notesData,
          caseNotes,
          legalNotes,
          familyData,
          EIAData,
          homeMembersData,
        })}
        enableReinitialize
        validate={fullIntakeInputValidation}
        onSubmit={(values, { resetForm }) => {
          if (isViewOnly) return;
          return FullIntakeFormSubmit(
            values,
            { resetForm },
            userId,
            getToken,
            router,
            setFormSent,
            client_id,
            originalData,
            childrenData,
            familyData,
            homeMembersData,
            EIAData,
            notesData,
            setChildrenData,
            setFamilyData,
            setHomeMembersData,
            setEIAData,
            setNotesData,
            setOriginalData,
            setShowNewNoteForm,
            setIsEditing
          );
        }}
      >
        {({ values, errors, resetForm }) => (
          <Form className={styles.form}>
            <div className={styles.titleContainer}>
              <h2 className={styles.centeredTitle}>FULL-INTAKE FORM</h2>
            </div>

            <hr className="separator-line" />

            <GeneralInformationHeader values={values} isEditing={isEditing} errors={errors} />

            <Row className={styles.tabsContainer}>
              <div className={styles.tabContainer}>
                <Tabs>
                  <TabList>
                    <Tab>General</Tab>
                    <Tab>Children</Tab>
                    <Tab>Health & Wellness</Tab>
                    <Tab>Child & Family Services</Tab>
                    <Tab>Case Notes</Tab>
                    <Tab>Legal Notes</Tab>
                  </TabList>

                  <TabPanel>
                    <GeneralInformationPartition
                      values={values}
                      isEditing={isEditing}
                      errors={errors}
                      validateRadio={validateRadio}
                    />
                  </TabPanel>

                  {/* ✅ FIX: pass childrenData */}
                  <TabPanel>
                    <ChildrenPartition
                      childrenData={childrenData}
                      values={values}
                      isEditing={isEditing}
                      errors={errors}
                    />
                  </TabPanel>

                  <TabPanel>
                    <HealthWellnessPartition
                      values={values}
                      isEditing={isEditing}
                      errors={errors}
                      validateRadio={validateRadio}
                    />
                  </TabPanel>

                  {/* ✅ FIX: pass childrenData */}
                  <TabPanel>
                    <ChildFamilyServicesPartition
                      childrenData={childrenData}
                      values={values}
                      isEditing={isEditing}
                      errors={errors}
                      validateRadio={validateRadio}
                    />
                  </TabPanel>

                  <TabPanel>
                    <CaseNotesPartition
                      notesData={notesData}
                      selectedNote={selectedNote}
                      handleShowNoteDetails={handleShowNoteDetails}
                      handleCloseNoteDetails={handleCloseNoteDetails}
                      showNewNoteForm={showNewNoteForm}
                      handleAddNoteClick={handleAddNoteClick}
                      values={values}
                      isEditing={isEditing}
                      errors={errors}
                    />
                  </TabPanel>

                  <TabPanel>
                    <LegalNotesPartition
                      notesData={notesData}
                      selectedNote={selectedNote}
                      handleShowNoteDetails={handleShowNoteDetails}
                      handleCloseNoteDetails={handleCloseNoteDetails}
                      showNewNoteForm={showNewNoteForm}
                      handleAddNoteClick={handleAddNoteClick}
                      values={values}
                      isEditing={isEditing}
                      errors={errors}
                    />
                  </TabPanel>
                </Tabs>
              </div>
            </Row>

            {!isViewOnly && (
              <>
                <Row className="mt-3">
                  {!isEditing ? (
                    <Col md={4}>
                      <Button className={styles.cancelButton} onClick={() => setIsEditing(true)}>
                        Edit
                      </Button>
                    </Col>
                  ) : (
                    <>
                      <Col md={4}>
                        <Button
                          className={styles.cancelButton}
                          onClick={() => {
                            resetForm();
                            setIsEditing(false);
                            setShowNewNoteForm(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </Col>
                      <Col md={4}>
                        <Button className={styles.submitButton} type="submit">
                          Save
                        </Button>
                      </Col>
                    </>
                  )}
                </Row>

                {formSent && <div className={styles.successfulText}>Form saved successfully!</div>}
              </>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
}

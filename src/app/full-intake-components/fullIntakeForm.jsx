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
  const [editingNote, setEditingNote] = useState(null);
  const [isAssignedAdvocate, setIsAssignedAdvocate] = useState(false);
  const [assignedAdvocateName, setAssignedAdvocateName] = useState("—");
  const [currentAdvocateId, setCurrentAdvocateId] = useState(null);

  useEffect(() => {
    if (!client_id) return;
    const checkAssignment = async () => {
      const params = new URLSearchParams({ client_id });
      if (userId) params.set("userId", userId);
      const res = await fetch(`/api/assigned-advocate?${params.toString()}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.advocateName) {
        setAssignedAdvocateName(json.advocateName);
        setIsAssignedAdvocate(json.isAssignedAdvocate ?? false);
      }
      if (json.currentAdvocateId) {
        setCurrentAdvocateId(json.currentAdvocateId);
      }
    };
    checkAssignment();
  }, [userId, client_id]);

  useEffect(() => {
    if (isViewOnly) setIsEditing(false);
  }, [isViewOnly]);

  // View-only patch (same behavior as Youth Intake)
  useEffect(() => {
    if (!isViewOnly) return;

    const runPatch = () => {
      const form = document.querySelector("form");
      if (!form) return;

      const forceWhiteBlockedLook = (el) => {
        el.style.setProperty("background-color", "#ffffff", "important");
        el.style.setProperty("opacity", "1", "important");
        el.style.setProperty("color", "#111827", "important");
        el.style.setProperty("-webkit-text-fill-color", "#111827", "important");
        el.style.setProperty("cursor", "default", "important");
      };

      const applyToElement = (el) => {
        const tag = el.tagName.toLowerCase();

        // Skip buttons that are explicitly allowed in view-only mode
        if (tag === "button" && el.dataset.viewAllow) return;

        // remove placeholders if empty
        if ((tag === "input" || tag === "textarea") && !el.value) {
          el.setAttribute("placeholder", "");
        }

        // Preserve native checkbox appearance (blue when checked) — skip white look
        if (tag === "input" && (el.getAttribute("type") || "text").toLowerCase() === "checkbox") {
          el.disabled = false;
          el.style.setProperty("pointer-events", "none", "important");
          el.tabIndex = -1;
          return;
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

          if (["radio", "file", "date", "time"].includes(type)) {
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
          el.style.setProperty("display", "none", "important");
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

  const buttonRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: "1000px",
    margin: "20px auto 10px auto",
  };

  const saveBtnStyle = {
    backgroundColor: "#7C3AED", // purple
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  };

  const cancelBtnStyle = {
    backgroundColor: "#111827", // keep black
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
  };

  const handleShowNoteDetails = (note) => setSelectedNote(note);
  const handleCloseNoteDetails = () => setSelectedNote(null);

  const handleAddNoteClick = (values, push, noteType) => {
    const newNote = {
      client_id: client_id,
      type: values.type || "General",
      subType: values.subType || "Uncategorized",
      description: values.description?.trim() || "No description provided",
      actionPlan: values.actionPlan?.trim() || "No action plan provided",
      advocate_id: currentAdvocateId,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      noteType: noteType,
    };

    push(newNote);
    setShowNewNoteForm(true);
  };

  const handleSaveNoteEdit = async (note_id, updatedFields, file = null) => {
    const originalNote = notesData.find((n) => n.note_id === note_id);

    const formData = new FormData();
    formData.append("note_id", note_id);
    formData.append("type", updatedFields.type || "");
    formData.append("subType", updatedFields.subType || "");
    formData.append("description", updatedFields.description || "");
    formData.append("actionPlan", updatedFields.actionPlan || "");
    formData.append("client_id", client_id || "");
    if (currentAdvocateId) formData.append("owner_id", String(currentAdvocateId));
    if (file) formData.append("file", file);

    const res = await fetch("/api/notes", { method: "PATCH", body: formData });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (res.status === 403) {
        alert(errData.error || "This note can no longer be edited (24-hour window has passed).");
        setEditingNote(null);
      } else {
        console.error("[handleSaveNoteEdit] PATCH failed:", errData);
      }
      return;
    }

    // Log the note edit
    const formatVal = (v) => (v === null || v === undefined || v === "") ? "N/A" : String(v);
    const noteChanges = [];
    for (const field of ["type", "subType", "description", "actionPlan"]) {
      const prevVal = formatVal(originalNote?.[field]);
      const currVal = formatVal(updatedFields[field]);
      if (prevVal !== currVal) {
        noteChanges.push(`${field}: ${prevVal} → ${currVal}`);
      }
    }
    const noteType = originalNote?.noteType || "Note";
    const logDescription = noteChanges.length
      ? `${noteType} note updated. Changed fields:\n${noteChanges.join("\n")}`
      : `${noteType} note updated (note_id: ${note_id})`;
    await fetch("/api/user-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: logDescription,
        logType: "UPDATE",
        client_id,
        clerkUserId: userId || null,
      }),
    });

    // Refresh notes from server to reflect updated data (including new file info)
    const notesRes = await fetch(`/api/notes?client_id=${client_id}`);
    if (notesRes.ok) {
      const notesJson = await notesRes.json();
      const safeNotes = notesJson.notes || [];
      setNotesData(safeNotes);
    }

    setEditingNote(null);
  };

  const handleSaveNewNote = async (noteData, setFieldValue, currentNotes) => {
    const formData = new FormData();
    formData.append("type", noteData.type || "");
    formData.append("subType", noteData.subType || "");
    formData.append("description", noteData.description || "");
    formData.append("actionPlan", noteData.actionPlan || "");
    formData.append("noteType", noteData.noteType || "Case");
    formData.append("client_id", client_id || "");
    if (currentAdvocateId) formData.append("advocate_id", String(currentAdvocateId));
    if (currentAdvocateId) formData.append("owner_id", String(currentAdvocateId));
    if (noteData.file instanceof File) formData.append("file", noteData.file);

    const res = await fetch("/api/notes", { method: "POST", body: formData });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("[handleSaveNewNote] POST failed:", errData);
      return;
    }

    await fetch("/api/user-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: `${noteData.noteType || "Case"} note added (type: ${noteData.type || "N/A"})`,
        logType: "CREATE",
        client_id,
        clerkUserId: userId || null,
      }),
    });

    setFieldValue("notes", currentNotes.slice(0, -1));
    setShowNewNoteForm(false);

    const notesRes = await fetch(`/api/notes?client_id=${client_id}`);
    if (notesRes.ok) {
      const notesJson = await notesRes.json();
      setNotesData(notesJson.notes || []);
    }
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
        {({ values, errors, resetForm, setFieldValue }) => (
          <Form className={styles.form}>
            <div className={styles.titleContainer}>
              <h2 className={styles.centeredTitle}>FULL-INTAKE FORM</h2>
            </div>

            <hr className="separator-line" />

            <GeneralInformationHeader values={values} isEditing={isEditing} errors={errors} assignedAdvocateName={assignedAdvocateName} />

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
                      setFieldValue={setFieldValue}
                    />
                  </TabPanel>

                  {/* FIX: pass childrenData */}
                  <TabPanel>
                    <ChildrenPartition
                      childrenData={childrenData}
                      values={values}
                      isEditing={isEditing}
                      errors={errors}
                      setFieldValue={setFieldValue}
                    />
                  </TabPanel>

                  <TabPanel>
                    <HealthWellnessPartition
                      values={values}
                      isEditing={isEditing}
                      errors={errors}
                      validateRadio={validateRadio}
                      setFieldValue={setFieldValue}
                    />
                  </TabPanel>

                  {/* FIX: pass childrenData */}
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
                      setShowNewNoteForm={setShowNewNoteForm}
                      handleAddNoteClick={handleAddNoteClick}
                      handleSaveNewNote={handleSaveNewNote}
                      editingNote={editingNote}
                      setEditingNote={setEditingNote}
                      handleSaveNoteEdit={handleSaveNoteEdit}
                      values={values}
                      setFieldValue={setFieldValue}
                      isEditing={isEditing}
                      isAssignedAdvocate={isAssignedAdvocate}
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
                      setShowNewNoteForm={setShowNewNoteForm}
                      handleAddNoteClick={handleAddNoteClick}
                      handleSaveNewNote={handleSaveNewNote}
                      editingNote={editingNote}
                      setEditingNote={setEditingNote}
                      handleSaveNoteEdit={handleSaveNoteEdit}
                      values={values}
                      setFieldValue={setFieldValue}
                      isEditing={isEditing}
                      isAssignedAdvocate={isAssignedAdvocate}
                      errors={errors}
                    />
                  </TabPanel>
                </Tabs>
              </div>
            </Row>

            {!isViewOnly && (
              <>
                <div style={buttonRowStyle}>
                  <>
                    <button
                      style={cancelBtnStyle}
                      onClick={() => {
                        resetForm();
                        setIsEditing(false);
                        setShowNewNoteForm(false);
                      }}
                    >
                      Cancel
                    </button>

                    <button style={saveBtnStyle} type="submit">
                      Save
                    </button>
                  </>

                </div>

                {formSent && <div className={styles.successfulText}>Form saved successfully!</div>}
              </>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
}

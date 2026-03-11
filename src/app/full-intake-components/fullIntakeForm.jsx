"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Formik, Form } from "formik";

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

const TABS = ["General", "Children", "Health & Wellness", "Child & Family Services", "Case Notes", "Legal Notes"];

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
  const [activeTab, setActiveTab] = useState(0);

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

  // View-only patch - block fields without styling changes
  useEffect(() => {
    if (!isViewOnly) return;

    // Inject CSS to restore text cursor on readonly text inputs
    const styleId = "view-only-style";
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.textContent = `
        form input:not([type="checkbox"]):not([type="radio"]):not([type="date"]):not([type="time"]):not([type="file"]) {
          cursor: text !important;
        }
        form input[type="radio"] {
          accent-color: #3b82f6 !important;
        }
      `;
      document.head.appendChild(styleEl);
    }

    const runPatch = () => {
      const form = document.querySelector("form");
      if (!form) return;

      const applyToElement = (el) => {
        const tag = el.tagName.toLowerCase();

        // Skip buttons that are explicitly allowed in view-only mode (tabs)
        if (tag === "button" && el.getAttribute("data-view-allow") !== null) return;

        // Handle checkboxes
        if (tag === "input" && (el.getAttribute("type") || "text").toLowerCase() === "checkbox") {
          el.removeAttribute("disabled");
          el.style.setProperty("pointer-events", "none", "important");
          return;
        }

        // Handle textareas
        if (tag === "textarea") {
          el.removeAttribute("disabled");
          el.readOnly = true;
          return;
        }

        // Handle text inputs
        if (tag === "input") {
          const type = (el.getAttribute("type") || "text").toLowerCase();

          if (["radio", "file", "date", "time"].includes(type)) {
            el.removeAttribute("disabled");
            el.style.setProperty("pointer-events", "none", "important");
          } else {
            el.removeAttribute("disabled");
            el.readOnly = true;
          }
          return;
        }

        // Handle selects
        if (tag === "select") {
          el.removeAttribute("disabled");
          el.style.setProperty("pointer-events", "none", "important");
          return;
        }

        // Hide buttons
        if (tag === "button") {
          el.style.setProperty("display", "none", "important");
        }
      };

      const elements = form.querySelectorAll("input, textarea, select, button");
      elements.forEach(applyToElement);

      // Block label clicks (prevents triggering radio/checkbox via their labels)
      form.querySelectorAll("label").forEach((label) => {
        label.style.setProperty("pointer-events", "none", "important");
      });
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
      document.getElementById("view-only-style")?.remove();
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
    <div>
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
          <Form>
            <GeneralInformationHeader values={values} isEditing={isEditing} errors={errors} assignedAdvocateName={assignedAdvocateName} />

            {/* Tab bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="flex border-b border-gray-200 overflow-x-auto">
                {TABS.map((tab, i) => (
                  <button
                    key={tab}
                    type="button"
                    data-view-allow="true"
                    onClick={() => setActiveTab(i)}
                    className="px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors"
                    style={
                      activeTab === i
                        ? { backgroundColor: "#6100D7", color: "#fff", borderBottom: "2px solid #6100D7" }
                        : { color: "#6b7280", borderBottom: "2px solid transparent" }
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 0 && (
                  <GeneralInformationPartition
                    values={values}
                    isEditing={isEditing}
                    errors={errors}
                    validateRadio={validateRadio}
                    setFieldValue={setFieldValue}
                  />
                )}
                {activeTab === 1 && (
                  <ChildrenPartition
                    childrenData={childrenData}
                    values={values}
                    isEditing={isEditing}
                    errors={errors}
                    setFieldValue={setFieldValue}
                  />
                )}
                {activeTab === 2 && (
                  <HealthWellnessPartition
                    values={values}
                    isEditing={isEditing}
                    errors={errors}
                    validateRadio={validateRadio}
                    setFieldValue={setFieldValue}
                  />
                )}
                {activeTab === 3 && (
                  <ChildFamilyServicesPartition
                    childrenData={childrenData}
                    values={values}
                    isEditing={isEditing}
                    errors={errors}
                    validateRadio={validateRadio}
                  />
                )}
                {activeTab === 4 && (
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
                )}
                {activeTab === 5 && (
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
                )}
              </div>
            </div>

            {!isViewOnly && (
              <div className="flex justify-between items-center mb-6">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors"
                  style={{ backgroundColor: "#6b7280" }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#4b5563")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#6b7280")}
                  onClick={() => {
                    resetForm();
                    setShowNewNoteForm(false);
                    router.push(`/clients/${client_id}/view`); //go back to viewing page
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors"
                  style={{ backgroundColor: "#6100D7" }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#3a2649")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#6100D7")}
                >
                  Save
                </button>
              </div>
            )}

            {formSent && (
              <div className="text-center text-sm text-green-600 font-medium mb-4">
                Form saved successfully!
              </div>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
}

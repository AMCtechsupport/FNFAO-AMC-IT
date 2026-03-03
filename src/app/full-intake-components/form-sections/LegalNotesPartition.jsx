"use client";
import { useState, useEffect } from "react";
import { Field, ErrorMessage, FieldArray } from "formik";
import { Button, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import TypeNoteSelect from "@/components/TypeNoteSelect";
import SubTypeNoteSelect from "@/components/SubTypeNoteSelect"
import FormattedDate from "@/components/FormattedDate";
import "react-tabs/style/react-tabs.css";

const isWithin24Hours = (createdAt) => {
    return new Date() - new Date(createdAt) < 24 * 60 * 60 * 1000;
};

const cardStyle = {
    backgroundColor: "#fff",
    border: "1px solid #e2e2e2",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "rgba(0, 0, 0, 0.08) 0px 2px 8px",
    marginBottom: "16px",
};

const sectionHeaderStyle = {
    backgroundColor: "#212529",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: "6px",
    marginBottom: "16px",
    fontSize: "1rem",
    fontWeight: 600,
    letterSpacing: "0.02em",
};

const metaBarStyle = {
    backgroundColor: "#f8f9fa",
    borderTop: "1px solid #dee2e6",
    borderRadius: "0 0 6px 6px",
    padding: "12px",
    marginTop: "16px",
};

const fieldLabelStyle = {
    fontWeight: 600,
    fontSize: "14px",
    marginBottom: "4px",
    display: "block",
    color: "#374151",
};

const attachmentBoxStyle = {
    backgroundColor: "#f8f9fa",
    border: "1px dashed #ced4da",
    borderRadius: "6px",
    padding: "12px",
    marginTop: "8px",
};

const LegalNotesPartition = ({
    notesData,
    selectedNote,
    handleShowNoteDetails,
    handleCloseNoteDetails,
    showNewNoteForm,
    setShowNewNoteForm,
    handleAddNoteClick,
    editingNote,
    setEditingNote,
    handleSaveNoteEdit,
    values,
    setFieldValue,
    isEditing,
    isAssignedAdvocate,
    errors,
}) => {
    const [editValues, setEditValues] = useState(null);
    const [editFile, setEditFile] = useState(null);

    useEffect(() => {
        if (editingNote) {
            setEditValues({
                type: editingNote.type || "",
                subType: editingNote.subType || "",
                description: editingNote.description || "",
                actionPlan: editingNote.actionPlan || "",
            });
            setEditFile(null);
        } else {
            setEditValues(null);
            setEditFile(null);
        }
    }, [editingNote]);

    const handleDownloadFile = async (filePath, fileName) => {
        const params = new URLSearchParams({ file_path: filePath });
        if (fileName) params.set("file_name", fileName);
        const res = await fetch(`/api/notes/download?${params.toString()}`);
        if (!res.ok) return;
        const { signedUrl } = await res.json();
        if (signedUrl) window.open(signedUrl, "_blank");
    };

    return (
        <>
            {notesData.length === 0 ? (
                <p style={{ color: "#6b7280", fontStyle: "italic", marginTop: "8px" }}>No notes found for this client.</p>
            ) : (
                <>
                    {/* Notes table */}
                    {!selectedNote && !editingNote && (
                        <table className="table table-striped table-bordered table-hover" style={{ fontSize: "0.95rem" }}>
                            <thead style={{ backgroundColor: "#212529", color: "#fff" }}>
                                <tr>
                                    <th style={{ width: "30%" }}>Created At</th>
                                    <th style={{ width: "30%" }}>Type</th>
                                    <th style={{ width: "20%", textAlign: "center" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...notesData]
                                    .filter(note => note.noteType?.toLowerCase() === "legal")
                                    .sort((a, b) => a.note_id - b.note_id)
                                    .map((note) => (
                                    <tr key={note.note_id}>
                                        <td className="align-middle"><FormattedDate dateString={note.createdAt}/></td>
                                        <td className="align-middle">
                                            <span style={{ backgroundColor: "#e9ecef", padding: "3px 10px", borderRadius: "20px", fontSize: "0.85em", fontWeight: 500 }}>
                                                {note.type}
                                            </span>
                                        </td>
                                        <td className="align-middle text-center">
                                            <div className="d-flex gap-2 justify-content-center">
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() => handleShowNoteDetails(note)}
                                                    data-view-allow="true"
                                                >
                                                    View
                                                </Button>
                                                {isEditing && isAssignedAdvocate && isWithin24Hours(note.createdAt) && (
                                                    <Button
                                                        size="sm"
                                                        variant="warning"
                                                        onClick={() => {
                                                            handleCloseNoteDetails();
                                                            setEditingNote(note);
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Note detail view */}
                    {selectedNote && !editingNote && (
                        <div style={cardStyle}>
                            {/* Header bar */}
                            <div style={{ backgroundColor: "#212529", color: "#fff", borderRadius: "6px", padding: "10px 16px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: 600, fontSize: "1rem" }}>Legal Note</span>
                                <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>{new Date(selectedNote.createdAt).toLocaleString()}</span>
                            </div>

                            {/* Type / Subtype badges */}
                            <Row className="mb-3">
                                <Col md="auto">
                                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</span>
                                    <div style={{ backgroundColor: "#e9ecef", display: "inline-block", padding: "4px 12px", borderRadius: "20px", marginLeft: "8px", fontSize: "0.9rem", fontWeight: 500 }}>
                                        {selectedNote.type || "—"}
                                    </div>
                                </Col>
                                <Col md="auto" className="ms-3">
                                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Subtype</span>
                                    <div style={{ backgroundColor: "#e9ecef", display: "inline-block", padding: "4px 12px", borderRadius: "20px", marginLeft: "8px", fontSize: "0.9rem", fontWeight: 500 }}>
                                        {selectedNote.subType || "—"}
                                    </div>
                                </Col>
                            </Row>

                            {/* Description + Action Plan */}
                            <Row className="g-3">
                                <Col md={6}>
                                    <label style={fieldLabelStyle}>Legal Note</label>
                                    <Field
                                        as="textarea"
                                        name="description"
                                        className="form-control"
                                        value={selectedNote.description}
                                        rows={10}
                                        disabled
                                        style={{ resize: "none", backgroundColor: "#f9fafb", border: "1px solid #e2e2e2" }}
                                    />
                                </Col>
                                <Col md={6}>
                                    <label style={fieldLabelStyle}>Action Plan</label>
                                    <Field
                                        as="textarea"
                                        name="actionPlan"
                                        className="form-control"
                                        value={selectedNote.actionPlan}
                                        rows={10}
                                        disabled
                                        style={{ resize: "none", backgroundColor: "#f9fafb", border: "1px solid #e2e2e2" }}
                                    />
                                </Col>
                            </Row>

                            {/* Attachment */}
                            {selectedNote.fileName && (
                                <div style={{ ...attachmentBoxStyle, marginTop: "16px" }}>
                                    <span style={fieldLabelStyle}>Attachment</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                                        <span style={{ backgroundColor: "#dee2e6", padding: "4px 12px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 500 }}>
                                            {selectedNote.fileName}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => handleDownloadFile(selectedNote.filePath, selectedNote.fileName)}
                                            data-view-allow="true"
                                        >
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Footer metadata */}
                            <div style={metaBarStyle}>
                                <Row className="align-items-center">
                                    <Col>
                                        <span style={{ fontSize: "0.83rem", color: "#6b7280" }}>
                                            <strong>Author:</strong> {selectedNote.authorName || "—"}
                                            {"  ·  "}
                                            <strong>Last updated:</strong> {selectedNote.modifiedAt}
                                        </span>
                                    </Col>
                                    <Col xs="auto">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleCloseNoteDetails}
                                            data-view-allow="true"
                                        >
                                            Close
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Edit note form */}
            {editingNote && editValues && (
                <div style={cardStyle}>
                    <div style={sectionHeaderStyle}>Edit Legal Note</div>

                    <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                        <div style={{ flex: 1 }}>
                            <label style={fieldLabelStyle}>Type</label>
                            <select
                                className="form-select"
                                value={editValues.type}
                                onChange={(e) => setEditValues({ ...editValues, type: e.target.value })}
                                style={{ border: "2px solid #e2e2e2", width: "100%" }}
                            >
                                <option value="">Select an option</option>
                                <option value="general">General</option>
                                <option value="initialMeeting">Initial Meeting</option>
                                <option value="agencyMeeting">Agency Meeting</option>
                                <option value="networkMeeting">Network Meeting</option>
                                <option value="court">Court</option>
                                <option value="otherType">Other</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={fieldLabelStyle}>Subtype</label>
                            <select
                                className="form-select"
                                value={editValues.subType}
                                onChange={(e) => setEditValues({ ...editValues, subType: e.target.value })}
                                style={{ border: "2px solid #e2e2e2", width: "100%" }}
                            >
                                <option value="">Select an option</option>
                                <option value="inOffice">In Office</option>
                                <option value="outOffice">Out of Office</option>
                                <option value="onLineMeeting">On-Line Meeting</option>
                                <option value="otherSubType">Other</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                        <div style={{ flex: 1 }}>
                            <label style={fieldLabelStyle}>Description</label>
                            <textarea
                                className="form-control"
                                rows={5}
                                value={editValues.description}
                                onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                                style={{ border: "2px solid #e2e2e2", resize: "vertical", width: "100%" }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={fieldLabelStyle}>Action Plan</label>
                            <textarea
                                className="form-control"
                                rows={5}
                                value={editValues.actionPlan}
                                onChange={(e) => setEditValues({ ...editValues, actionPlan: e.target.value })}
                                style={{ border: "2px solid #e2e2e2", resize: "vertical", width: "100%" }}
                            />
                        </div>
                    </div>

                    <div style={attachmentBoxStyle}>
                        <label style={fieldLabelStyle}>Attachment</label>
                        {editingNote.fileName && !editFile && (
                            <div style={{ marginBottom: "8px" }}>
                                <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Current file: </span>
                                <span style={{ backgroundColor: "#dee2e6", padding: "3px 10px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 500 }}>
                                    {editingNote.fileName}
                                </span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*,.pdf,.doc,.docx"
                            className="form-control"
                            onChange={(e) => setEditFile(e.target.files[0] || null)}
                            style={{ border: "1px solid #ced4da" }}
                        />
                        {editFile && (
                            <div style={{ marginTop: "6px", fontSize: "0.85rem", color: "#374151" }}>
                                New file: <strong>{editFile.name}</strong>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 d-flex gap-2">
                        <Button
                            variant="dark"
                            onClick={() => handleSaveNoteEdit(editingNote.note_id, editValues, editFile)}
                        >
                            Save Changes
                        </Button>
                        <Button
                            variant="outline-secondary"
                            onClick={() => setEditingNote(null)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Add note button */}
            {!showNewNoteForm && !editingNote && (
                <FieldArray name="notes">
                    {({ push }) => (
                        <Button
                            variant="dark"
                            onClick={() => handleAddNoteClick(values, push, "legal")}
                            disabled={!isEditing || !isAssignedAdvocate}
                            style={{ marginTop: "4px" }}
                        >
                            + Add Legal Note
                        </Button>
                    )}
                </FieldArray>
            )}

            {/* New note form */}
            {showNewNoteForm && !editingNote && (
                <div style={cardStyle}>
                    <div style={sectionHeaderStyle}>New Legal Note</div>

                    <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                        <div style={{ flex: 1 }}>
                            <TypeNoteSelect name={`notes.${values.notes.length - 1}.type`} label="Type" placeholder="" error={errors.type} disabled={!isEditing}/>
                        </div>
                        <div style={{ flex: 1 }}>
                            <SubTypeNoteSelect name={`notes.${values.notes.length - 1}.subType`} label="Subtype" placeholder="" error={errors.subType} disabled={!isEditing}/>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                        <div style={{ flex: 1 }}>
                            <label style={fieldLabelStyle}>Description</label>
                            <Field
                                name={`notes.${values.notes.length - 1}.description`}
                                as="textarea"
                                className="form-control"
                                rows={5}
                                style={{ border: "2px solid #e2e2e2", resize: "vertical", width: "100%" }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={fieldLabelStyle}>Action Plan</label>
                            <Field
                                name={`notes.${values.notes.length - 1}.actionPlan`}
                                as="textarea"
                                className="form-control"
                                rows={5}
                                style={{ border: "2px solid #e2e2e2", resize: "vertical", width: "100%" }}
                            />
                        </div>
                    </div>

                    <div style={attachmentBoxStyle}>
                        <label style={fieldLabelStyle}>Attach File</label>
                        <input
                            type="file"
                            accept="image/*,.pdf,.doc,.docx"
                            className="form-control"
                            onChange={(event) => {
                                const file = event.currentTarget.files[0];
                                setFieldValue(`notes.${values.notes.length - 1}.file`, file);
                            }}
                            style={{ border: "1px solid #ced4da" }}
                        />
                    </div>

                    <div className="mt-4">
                        <Button
                            variant="outline-secondary"
                            onClick={() => {
                                setFieldValue("notes", values.notes.slice(0, -1));
                                setShowNewNoteForm(false);
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default LegalNotesPartition;

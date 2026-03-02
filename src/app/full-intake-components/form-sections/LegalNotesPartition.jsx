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

    useEffect(() => {
        if (editingNote) {
            setEditValues({
                type: editingNote.type || "",
                subType: editingNote.subType || "",
                description: editingNote.description || "",
                actionPlan: editingNote.actionPlan || "",
            });
        } else {
            setEditValues(null);
        }
    }, [editingNote]);

    return (
        <>
            {notesData.length === 0 ? (
                <p>No notes found for this client.</p>
            ) : (
                <>
                    {/* Displays the notes table */}
                    {!selectedNote && !editingNote && (
                        <table className="table table-striped table-bordered">
                            <thead className="table-dark">
                                <tr>
                                    <th>Legal Note ID</th>
                                    <th>Created At</th>
                                    <th>Type</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...notesData]
                                    .filter(note => note.noteType?.toLowerCase() === "legal")
                                    .sort((a, b) => a.note_id - b.note_id)
                                    .map((note) => (
                                    <tr key={note.note_id}>
                                        <td>{note.note_id}</td>
                                        <td><FormattedDate dateString={note.createdAt}/></td>
                                        <td>{note.type}</td>
                                        <td>
                                            <Button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleShowNoteDetails(note)}
                                                data-view-allow="true"
                                            >
                                                See Note
                                            </Button>
                                            {isEditing && isAssignedAdvocate && isWithin24Hours(note.createdAt) && (
                                                <Button
                                                    className="btn btn-warning btn-sm ms-1"
                                                    onClick={() => {
                                                        handleCloseNoteDetails();
                                                        setEditingNote(note);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Show details of the selected note */}
                    {selectedNote && !editingNote && (
                        <div className="note-details">
                            <Row className="mb-2">
                                <Col md={4}>
                                    <div>
                                        <label><strong>Created At: </strong>{new Date(selectedNote.createdAt).toLocaleString()}</label>
                                    </div>
                                </Col>
                            </Row>

                            <Row className="align-items-center">
                                <Col md={4}>
                                    <div>
                                    <label><strong>Type:</strong> {selectedNote.type} </label>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div>
                                        <label><strong>Subtype:</strong> {selectedNote.subType}</label>
                                    </div>
                                </Col>

                            </Row>

                            <Row className="mt-3">
                                <Col md={6}>
                                    <div>
                                        <label><strong>Case Note:</strong></label>
                                        <Field
                                            as="textarea"
                                            name="description"
                                            className="form-control"
                                            value={selectedNote.description}
                                            rows={10}
                                            disabled
                                        />
                                        {/* Error handling */}
                                        <ErrorMessage
                                            name="description"
                                            component="div"
                                            className="text-danger"
                                        />
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div>
                                        <label><strong>Action Plan:</strong></label>
                                        <Field
                                            as="textarea"
                                            name="actionPlan"
                                            className="form-control"
                                            value={selectedNote.actionPlan}
                                            rows={10}
                                            disabled
                                        />
                                        {/* Error handling */}
                                        <ErrorMessage
                                            name="actionPlan"
                                            component="div"
                                            className="text-danger"
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mt-3">
                                <Col md={4}>
                                    <div>
                                        <label><strong>Last Updated:</strong> {selectedNote.modifiedAt}</label>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div>
                                        <label><strong>Author:</strong> {selectedNote.authorName || "—"}</label>
                                    </div>
                                </Col>
                                <Col md={2}></Col>
                                <Col md={2}>
                                    <Button
                                        variant="secondary"
                                        className="mb-3"
                                        onClick={handleCloseNoteDetails}
                                        data-view-allow="true"
                                    >
                                        Close Note
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    )}
                </>
            )}

            {/* Edit existing note form (only within 24hrs) */}
            {editingNote && editValues && (
                <div style={{ backgroundColor: "#dbdbdb", padding: "15px", borderRadius: "8px", border: "0.5px solid #ccc" }}>
                    <h4>Edit Legal Note</h4>
                    <Row>
                        <Col>
                            <label>Type:</label>
                            <select
                                className="form-select"
                                value={editValues.type}
                                onChange={(e) => setEditValues({ ...editValues, type: e.target.value })}
                            >
                                <option value="">Select an option</option>
                                <option value="general">General</option>
                                <option value="initialMeeting">Initial Meeting</option>
                                <option value="agencyMeeting">Agency Meeting</option>
                                <option value="networkMeeting">Network Meeting</option>
                                <option value="court">Court</option>
                                <option value="otherType">Other</option>
                            </select>
                        </Col>
                        <Col>
                            <label>Subtype:</label>
                            <select
                                className="form-select"
                                value={editValues.subType}
                                onChange={(e) => setEditValues({ ...editValues, subType: e.target.value })}
                            >
                                <option value="">Select an option</option>
                                <option value="inOffice">In Office</option>
                                <option value="outOffice">Out of Office</option>
                                <option value="onLineMeeting">On-Line Meeting</option>
                                <option value="otherSubType">Other</option>
                            </select>
                        </Col>
                    </Row>

                    <label className="mt-2">Description:</label>
                    <textarea
                        className="form-control"
                        rows={4}
                        value={editValues.description}
                        onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                    />

                    <label className="mt-2">Action Plan:</label>
                    <textarea
                        className="form-control"
                        rows={4}
                        value={editValues.actionPlan}
                        onChange={(e) => setEditValues({ ...editValues, actionPlan: e.target.value })}
                    />

                    <div className="mt-3">
                        <Button
                            variant="primary"
                            className="me-2"
                            onClick={() => handleSaveNoteEdit(editingNote.note_id, editValues)}
                        >
                            Save
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setEditingNote(null)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Show add new note button */}
            {!showNewNoteForm && !editingNote && (
                <FieldArray name="notes">
                    {({ push }) => (
                        <Button
                            onClick={() =>
                                handleAddNoteClick(values, push, "legal")}
                            disabled={!isEditing || !isAssignedAdvocate}>
                            Add Legal Note
                        </Button>
                    )}
                </FieldArray>
            )}

            {showNewNoteForm && !editingNote && (
                <div style={{ backgroundColor: "#dbdbdb", padding: "15px", borderRadius: "8px", border: "0.5px solid #ccc" }} >

                    <h4>New Legal Note</h4>
                    <Row>
                        <Col>
                            <TypeNoteSelect name={`notes.${values.notes.length - 1}.type`} label="Type" placeholder="" error={errors.type} disabled={!isEditing}/>
                        </Col>
                        <Col>
                            <SubTypeNoteSelect name={`notes.${values.notes.length - 1}.subType`} label="Subtype" placeholder="" error={errors.subType} disabled={!isEditing}/>
                        </Col>
                    </Row>

                    <label>Description:</label>
                    <Field

                        name={`notes.${values.notes.length - 1}.description`}
                        as="textarea"
                        rows={4}
                    />
                    <label>Action Plan:</label>
                    <Field

                        name={`notes.${values.notes.length - 1}.actionPlan`}
                        as="textarea"
                        rows={4}
                    />

                    {/* Input to upload file */}
                    <label>Attach File:</label>
                    <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={(event) => {
                            const file = event.currentTarget.files[0];
                            setFieldValue(`notes.${values.notes.length - 1}.file`, file);
                        }}
                    />
                    <div className="mt-3">
                        <Button
                            variant="secondary"
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

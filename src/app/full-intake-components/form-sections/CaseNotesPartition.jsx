"use client";
import { Field, ErrorMessage, FieldArray } from "formik";
import { Button, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import TypeNoteSelect from "@/components/TypeNoteSelect";
import SubTypeNoteSelect from "@/components/SubTypeNoteSelect"
import FormattedDate from "@/components/FormattedDate";
import "react-tabs/style/react-tabs.css";

const CaseNotesPartition = ({
    notesData,
    selectedNote,
    handleShowNoteDetails,
    handleCloseNoteDetails,
    showNewNoteForm,
    handleAddNoteClick,
    values,
    setFieldValue,
    isEditing,
    isAssignedAdvocate,
    errors,
}) => {
    return (
        <>
            {notesData.length === 0 ? (
                <p>No notes found for this client.</p>
            ) : (
                <>
                    {/* Displays the notes table */}
                    {!selectedNote && (
                        <table className="table table-striped table-bordered">
                            <thead className="table-dark">
                                <tr>
                                    <th>Case Note ID</th>
                                    <th>Created At</th>
                                    <th>Type</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...notesData]
                                .filter(note => note.noteType?.toLowerCase() === "case")
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Show details of the selected note */}
                    {selectedNote && (
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
                                        <label><strong>Author:</strong> </label>
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

            {/* Show add new note details */}
            {!showNewNoteForm && (
                // <Button onClick={() => handleAddNoteClick(values, setFieldValue)} disabled={!isEditing} >Add Note</Button>
                <FieldArray name="notes">
                    {({ push }) => (
                        <Button onClick={() => handleAddNoteClick(values, push, "case")} disabled={!isEditing || !isAssignedAdvocate}>
                            Add Case Note
                        </Button>
                    )}
                </FieldArray>

            )}
            {showNewNoteForm && (
                <div style={{ backgroundColor: "#dbdbdb", padding: "15px", borderRadius: "8px", border: "0.5px solid #ccc" }} >

                    <h4>New Case Note</h4>
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
                        // label="Description"
                        name={`notes.${values.notes.length - 1}.description`}
                        as="textarea"
                        rows={4}
                    />
                    <label>Action Plan:</label>
                    <Field
                        // label="Action Plan"
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
                </div>
            )}

        </>
    );
};

export default CaseNotesPartition;
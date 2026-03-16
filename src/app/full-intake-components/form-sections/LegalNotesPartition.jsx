"use client";
import { useState, useEffect } from "react";
import { Field, ErrorMessage, FieldArray } from "formik";
import TypeNoteSelect from "@/components/TypeNoteSelect";
import SubTypeNoteSelect from "@/components/SubTypeNoteSelect";
import FormattedDate from "@/components/FormattedDate";

const isWithin24Hours = (createdAt) => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    if (isNaN(created.getTime())) return false;
    const nowWinnipeg = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Winnipeg" }));
    const createdWinnipeg = new Date(created.toLocaleString("en-US", { timeZone: "America/Winnipeg" }));
    return nowWinnipeg - createdWinnipeg < 24 * 60 * 60 * 1000;
};

const LegalNotesPartition = ({
    notesData,
    selectedNote,
    handleShowNoteDetails,
    handleCloseNoteDetails,
    showNewNoteForm,
    setShowNewNoteForm,
    handleAddNoteClick,
    handleSaveNewNote,
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
                <p className="text-gray-500 italic mt-2">No notes found for this client.</p>
            ) : (
                <>
                    {/* Notes table */}
                    {!selectedNote && !editingNote && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="text-white text-xs uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
                                        <th className="px-4 py-2 text-left" style={{ width: "30%" }}>Created At</th>
                                        <th className="px-4 py-2 text-left" style={{ width: "30%" }}>Type</th>
                                        <th className="px-4 py-2 text-left text-center" style={{ width: "20%" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...notesData]
                                        .filter(note => note.noteType?.toLowerCase() === "legal")
                                        .sort((a, b) => b.note_id - a.note_id)
                                        .map((note) => (
                                        <tr key={note.note_id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-700"><FormattedDate dateString={note.createdAt}/></td>
                                            <td className="px-4 py-3 text-gray-700">
                                                <span className="bg-gray-100 px-3 py-0.5 rounded-full text-xs font-medium text-gray-700">
                                                    {note.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        className="px-3 py-1 text-xs font-semibold rounded-lg text-white transition-colors"
                                                        style={{ backgroundColor: "#3b82f6" }}
                                                        onClick={() => handleShowNoteDetails(note)}
                                                        data-view-allow="true"
                                                    >
                                                        View
                                                    </button>
                                                    {isEditing && isAssignedAdvocate && isWithin24Hours(note.createdAt) && (
                                                        <button
                                                            className="px-3 py-1 text-xs font-semibold rounded-lg text-white transition-colors"
                                                            style={{ backgroundColor: "#f59e0b" }}
                                                            onClick={() => {
                                                                handleCloseNoteDetails();
                                                                setEditingNote(note);
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Note detail view */}
                    {selectedNote && !editingNote && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
                            {/* Header bar */}
                            <div className="px-5 py-3 text-white flex items-center justify-between" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
                                <span className="font-semibold text-sm">Legal Note</span>
                                <span className="text-xs opacity-80"><FormattedDate dateString={selectedNote.createdAt} /></span>
                            </div>

                            {/* Type / Subtype badges */}
                            <div className="px-5 pt-4 pb-2 flex gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</span>
                                    <span className="bg-gray-100 px-3 py-0.5 rounded-full text-xs font-medium text-gray-700">
                                        {selectedNote.type || "—"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtype</span>
                                    <span className="bg-gray-100 px-3 py-0.5 rounded-full text-xs font-medium text-gray-700">
                                        {selectedNote.subType || "—"}
                                    </span>
                                </div>
                            </div>

                            {/* Description + Action Plan */}
                            <div className="grid grid-cols-2 gap-4 p-5">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Legal Note</label>
                                    <Field
                                        as="textarea"
                                        name="description"
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 resize-none focus:outline-none"
                                        value={selectedNote.description ?? ""}
                                        rows={10}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Action Plan</label>
                                    <Field
                                        as="textarea"
                                        name="actionPlan"
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 resize-none focus:outline-none"
                                        value={selectedNote.actionPlan ?? ""}
                                        rows={10}
                                        disabled
                                    />
                                </div>
                            </div>

                            {/* Attachment */}
                            {selectedNote.fileName && (
                                <div className="mx-5 mb-5 bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Attachment</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="bg-gray-200 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                                            {selectedNote.fileName}
                                        </span>
                                        <button
                                            className="px-3 py-1 text-xs font-semibold rounded-lg transition-colors border border-blue-300 text-blue-600 bg-white hover:bg-blue-50"
                                            onClick={() => handleDownloadFile(selectedNote.filePath, selectedNote.fileName)}
                                            data-view-allow="true"
                                        >
                                            Download
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Footer metadata */}
                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                                <span>
                                    <strong>Author:</strong> {selectedNote.authorName || "—"}
                                    {"  ·  "}
                                    <strong>Last updated:</strong> <FormattedDate dateString={selectedNote.modifiedAt} />
                                </span>
                                <button
                                    className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors"
                                    style={{ backgroundColor: "#6b7280" }}
                                    onClick={handleCloseNoteDetails}
                                    data-view-allow="true"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Edit note form */}
            {editingNote && editValues && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>Edit Legal Note</div>
                    <div className="p-5">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                                <select
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white"
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
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Subtype</label>
                                <select
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white"
                                    value={editValues.subType}
                                    onChange={(e) => setEditValues({ ...editValues, subType: e.target.value })}
                                >
                                    <option value="">Select an option</option>
                                    <option value="inOffice">In Office</option>
                                    <option value="outOffice">Out of Office</option>
                                    <option value="onLineMeeting">On-Line Meeting</option>
                                    <option value="otherSubType">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-vertical"
                                    rows={5}
                                    value={editValues.description}
                                    onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Action Plan</label>
                                <textarea
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-vertical"
                                    rows={5}
                                    value={editValues.actionPlan}
                                    onChange={(e) => setEditValues({ ...editValues, actionPlan: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 mb-4">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Attachment</label>
                            {editingNote.fileName && !editFile && (
                                <div className="mb-2">
                                    <span className="text-xs text-gray-500">Current file: </span>
                                    <span className="bg-gray-200 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                                        {editingNote.fileName}
                                    </span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*,.pdf,.doc,.docx"
                                className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-50/80 file:text-purple-700/80"
                                onChange={(e) => setEditFile(e.target.files[0] || null)}
                            />
                            {editFile && (
                                <div className="mt-1.5 text-xs text-gray-700">
                                    New file: <strong>{editFile.name}</strong>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors"
                                style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}
                                onClick={() => handleSaveNoteEdit(editingNote.note_id, editValues, editFile)}
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors"
                                style={{ backgroundColor: "#6b7280" }}
                                onClick={() => setEditingNote(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add note button */}
            {!showNewNoteForm && !editingNote && (
                <FieldArray name="notes">
                    {({ push }) => (
                        <button
                            className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}
                            onClick={() => handleAddNoteClick(values, push, "legal")}
                            disabled={!isEditing || !isAssignedAdvocate}
                        >
                            + Add Legal Note
                        </button>
                    )}
                </FieldArray>
            )}

            {/* New note form */}
            {showNewNoteForm && !editingNote && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>New Legal Note</div>
                    <div className="p-5">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <TypeNoteSelect name={`notes.${values.notes.length - 1}.type`} label="Type" placeholder="" error={errors.type} disabled={!isEditing}/>
                            </div>
                            <div>
                                <SubTypeNoteSelect name={`notes.${values.notes.length - 1}.subType`} label="Subtype" placeholder="" error={errors.subType} disabled={!isEditing}/>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                                <Field
                                    name={`notes.${values.notes.length - 1}.description`}
                                    as="textarea"
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-vertical"
                                    rows={5}
                                    placeholder="Enter legal note description..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Action Plan</label>
                                <Field
                                    name={`notes.${values.notes.length - 1}.actionPlan`}
                                    as="textarea"
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400/80 bg-white resize-vertical"
                                    rows={5}
                                    placeholder="Enter action plan..."
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 mb-4">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Attach File</label>
                            <input
                                type="file"
                                accept="image/*,.pdf,.doc,.docx"
                                className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-50/80 file:text-purple-700/80"
                                onChange={(event) => {
                                    const file = event.currentTarget.files[0];
                                    setFieldValue(`notes.${values.notes.length - 1}.file`, file);
                                }}
                            />
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors"
                                style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}
                                onClick={() => {
                                    const note = values.notes[values.notes.length - 1];
                                    const isEmpty = !note.type && !note.subType && !note.description?.trim() && !note.actionPlan?.trim() && !note.file;
                                    if (isEmpty) {
                                        setFieldValue("notes", values.notes.slice(0, -1));
                                        setShowNewNoteForm(false);
                                        return;
                                    }
                                    handleSaveNewNote(note, setFieldValue, values.notes);
                                }}
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors"
                                style={{ backgroundColor: "#6b7280" }}
                                onClick={() => {
                                    setFieldValue("notes", values.notes.slice(0, -1));
                                    setShowNewNoteForm(false);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LegalNotesPartition;

"use client";
import { Field, ErrorMessage, FieldArray } from "formik";
import { Button, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import TypeNoteSelect from "@/components/TypeNoteSelect";
import SubTypeNoteSelect from "@/components/SubTypeNoteSelect"
import FormattedDate from "@/components/FormattedDate";
import "react-tabs/style/react-tabs.css";
import { useState, useEffect } from "react";

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
    errors,
}) => {
    const [noteFiles, setNoteFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [fileError, setFileError] = useState(null);
    const [deletingFiles, setDeletingFiles] = useState(new Set());
    const [notification, setNotification] = useState(null);

    // Fetch files for the selected note
    useEffect(() => {
        if (selectedNote) {
            fetchNoteFiles(selectedNote.note_id);
        }
    }, [selectedNote]);

    // Auto-hide notification after 3 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const fetchNoteFiles = async (noteId) => {
        if (!noteId) return;
        
        setLoadingFiles(true);
        setFileError(null);
        try {
            // Get client_id from the selected note
            const clientId = selectedNote.client_id;
            
            const response = await fetch(`/api/client-files?clientId=${clientId}&noteId=${noteId}&noteSpecificOnly=true`);
            const result = await response.json();
            
            if (result.success) {
                setNoteFiles(result.files || []);
            } else {
                console.error("Error fetching files:", result.error);
                setFileError("Failed to load files. Please try again.");
                setNoteFiles([]);
            }
        } catch (error) {
            console.error("Error fetching note files:", error);
            setFileError("Network error. Please check your connection and try again.");
            setNoteFiles([]);
        } finally {
            setLoadingFiles(false);
        }
    };

    const handleDownloadFile = async (filePath, fileName) => {
        try {
            const response = await fetch(`/api/download-file?path=${encodeURIComponent(filePath)}&name=${encodeURIComponent(fileName)}`);
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                console.error("Download failed:", response.statusText);
                alert("Failed to download file. Please try again.");
            }
        } catch (error) {
            console.error("Error downloading file:", error);
            alert("Error downloading file. Please try again.");
        }
    };

    const handleViewFile = async (filePath, fileName) => {
        try {
            const response = await fetch(`/api/download-file?path=${encodeURIComponent(filePath)}&name=${encodeURIComponent(fileName)}`);
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                
                // Check if it's an image or PDF that can be viewed in browser
                const fileExtension = fileName.split('.').pop().toLowerCase();
                const viewableTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'pdf'];
                
                if (viewableTypes.includes(fileExtension)) {
                    // Open in new tab for viewable files
                    window.open(url, '_blank');
                } else {
                    // For non-viewable files, trigger download
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                
                // Clean up URL after a delay
                setTimeout(() => window.URL.revokeObjectURL(url), 1000);
            } else {
                console.error("View failed:", response.statusText);
                alert("Failed to view file. Please try again.");
            }
        } catch (error) {
            console.error("Error viewing file:", error);
            alert("Error viewing file. Please try again.");
        }
    };

    const handleDeleteFile = async (filePath, fileName) => {
        if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
            return;
        }

        // Add file to deleting set
        setDeletingFiles(prev => new Set(prev).add(filePath));

        try {
            const response = await fetch(`/api/client-files?filePath=${encodeURIComponent(filePath)}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Remove the file from the local state
                setNoteFiles(prevFiles => prevFiles.filter(file => file.path !== filePath));
                setNotification({ type: 'success', message: `File "${fileName}" has been deleted successfully.` });
            } else {
                console.error("Delete failed:", result.error);
                setNotification({ type: 'error', message: 'Failed to delete file. Please try again.' });
            }
        } catch (error) {
            console.error("Error deleting file:", error);
            setNotification({ type: 'error', message: 'Error deleting file. Please try again.' });
        } finally {
            // Remove file from deleting set
            setDeletingFiles(prev => {
                const newSet = new Set(prev);
                newSet.delete(filePath);
                return newSet;
            });
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf':
                return '📄';
            case 'doc':
            case 'docx':
                return '📝';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'bmp':
            case 'webp':
                return '🖼️';
            default:
                return '📎';
        }
    };

    return (
        <>
            {/* Notification Toast */}
            {notification && (
                <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`} 
                     style={{ top: '20px', right: '20px', zIndex: 1050, minWidth: '300px' }}>
                    {notification.message}
                    <button type="button" className="btn-close" onClick={() => setNotification(null)}></button>
                </div>
            )}
            
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

                            {/* File Attachments Section */}
                            <Row className="mt-3">
                                <Col md={12}>
                                    <div>
                                        <label><strong>Attached Files:</strong></label>
                                        {loadingFiles ? (
                                            <p className="text-muted">Loading files...</p>
                                        ) : fileError ? (
                                            <div className="alert alert-danger">
                                                <strong>Error:</strong> {fileError}
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm" 
                                                    className="ms-2"
                                                    onClick={() => fetchNoteFiles(selectedNote.note_id)}
                                                >
                                                    Retry
                                                </Button>
                                            </div>
                                        ) : noteFiles.length > 0 ? (
                                            <div className="mt-2">
                                                <table className="table table-sm table-bordered">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>File Name</th>
                                                            <th>Size</th>
                                                            <th>Uploaded</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {noteFiles.map((file, index) => (
                                                            <tr key={index}>
                                                                <td>
                                                                    <span className="me-2">{getFileIcon(file.name)}</span>
                                                                    {file.name}
                                                                </td>
                                                                <td>{formatFileSize(file.size)}</td>
                                                                <td>{new Date(file.created_at).toLocaleDateString()}</td>
                                                                                                                                 <td>
                                                                     <div className="d-flex gap-1">
                                                                         <Button
                                                                             variant="outline-primary"
                                                                             size="sm"
                                                                             onClick={() => handleDownloadFile(file.path, file.name)}
                                                                         >
                                                                             Download
                                                                         </Button>
                                                                         <Button
                                                                             variant="outline-secondary"
                                                                             size="sm"
                                                                             onClick={() => handleViewFile(file.path, file.name)}
                                                                         >
                                                                             View
                                                                         </Button>
                                                                         <Button
                                                                             variant="outline-danger"
                                                                             size="sm"
                                                                             onClick={() => handleDeleteFile(file.path, file.name)}
                                                                             disabled={deletingFiles.has(file.path)}
                                                                         >
                                                                             {deletingFiles.has(file.path) ? 'Deleting...' : 'Delete'}
                                                                         </Button>
                                                                     </div>
                                                                 </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-muted">No files attached to this note.</p>
                                        )}
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
                        <Button onClick={() => handleAddNoteClick(values, push, "case")} disabled={!isEditing}>
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
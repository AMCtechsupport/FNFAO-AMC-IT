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
import HealthWellnessPartition from "./form-sections/HealthWellnessPartition"
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

export default function FullIntakeForm({client_id, userId, getToken, isEditMode = false} ){
    const router = useRouter();
    const [originalData, setOriginalData] = useState(null);
    const [childrenData, setChildrenData] = useState([]); // State for children
    const [familyData, setFamilyData] = useState([]);
    const [homeMembersData, setHomeMembersData] = useState([]);
    const [EIAData, setEIAData] = useState([]);

    // const [emergencyContactData, setEmergencyContactData] = useState([]);

    const [notesData, setNotesData] = useState([]); // State for case notes
    const [caseNotes, setCaseNotes] = useState([]);
    const [legalNotes, setLegalNotes] = useState([]);

    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(isEditMode); // state to enable/disable fields - start in edit mode if isEditMode is true
    const [formSent, setFormSent] = useState(false);

    const [selectedNote, setSelectedNote] = useState(null);
    const [showNewNoteForm, setShowNewNoteForm] = useState(false);

    // const { userId, getToken } = useAuth();

    // const { getToken } = useAuth();

    const handleShowNoteDetails = (note) => {
        setSelectedNote(note); // Save the selected note
    };

    const handleCloseNoteDetails = () => {
        setSelectedNote(null); // Close the note details
    };

    const handleAddNoteClick = (values, push, noteType) => {
        const newNote = {
            client_id: client_id,
            type: values.type || "General",  // Default value
            subType: values.subType || "Uncategorized",
            description: values.description?.trim() || "No description provided",
            actionPlan: values.actionPlan?.trim() || "No action plan provided", // Avoid empty values
            advocate_id: "19",
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            noteType: noteType,
        };

        // setFieldValue("notes", [...values.notes, newNote]); // Add the new note to the Formik array
        push(newNote);
        setShowNewNoteForm(true);
        console.log("New note added:", newNote);
    };

    const validateRadio = (value) => {
        // Radio buttons are now optional - no validation required
        // Users can submit the form without selecting radio options
        return undefined;
    };

    // Load client and children data when opening the form
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

    if (loading) {
        return <div>Loading...</div>;
    }

    return(
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
                onSubmit={(values, {resetForm}) => 
                    FullIntakeFormSubmit(
                        values, { resetForm }, userId, 
                        getToken, router, setFormSent, 
                        client_id, originalData, childrenData, 
                        familyData, homeMembersData, EIAData, 
                        notesData, setChildrenData, setFamilyData, 
                        setHomeMembersData, setEIAData, setNotesData, 
                        setOriginalData, setShowNewNoteForm, setIsEditing
                )} 
            >
                {({ values, errors, resetForm, setFieldValue }) => (
                
                    <Form className={styles.form}>
                        <div className={styles.titleContainer}>
                            {/* <img src="/full-intake logo.png" alt="Logo" className={styles.logo} /> */}
                            <h2 className={styles.centeredTitle}>FULL-INTAKE FORM</h2>
                        </div>
                            <hr className="separator-line" />
                                {/* General Info Section */}
                                <GeneralInformationHeader
                                    values={values}
                                    errors={errors}
                                    isEditing={isEditing}
                                />
                            <Row>
                                {/* Tab Sections */}
                                <div className={styles.tabsContainer}>
                                    <Tabs >
                                        <TabList >
                                            <Tab href="/generalInfo" onClick={() => console.log("Tab 1 clicked!")}>General Information</Tab>
                                            <Tab href="/cfs" onClick={() => console.log("Tab 2 clicked!")}>CFS</Tab>
                                            <Tab href="/childrenInfo" onClick={() => console.log("Tab 3 clicked!")}>Children Information</Tab>
                                            <Tab href="/community" onClick={() => console.log("Tab 4 clicked!")}>Health and Wellness</Tab>
                                            <Tab href="/caseNotes" onClick={() => console.log("Tab 6 clicked!")}>Case Notes</Tab>
                                            <Tab href="/legalNotes" onClick={() => console.log("Tab 7 clicked!")}>Legal Notes</Tab>
                                        </TabList>
                                        <TabPanel>
                                            {/* General Information Tab */}
                                            <GeneralInformationPartition
                                                errors={errors}
                                                isEditing={isEditMode}
                                                values={values}
                                                setFieldValue={setFieldValue}
                                                validateRadio={validateRadio}
                                            />
                                        </TabPanel>
                                        <TabPanel>
                                            {/* CFS Tab */}
                                            <ChildFamilyServicesPartition
                                                childrenData={childrenData}
                                                isEditing={isEditing}
                                                values={values}
                                            />                              
                                        </TabPanel>
                                        <TabPanel>
                                            {/* Children Information Tab */}
                                            <ChildrenPartition
                                                childrenData={childrenData}
                                                values={values} 
                                                isEditing={isEditing}
                                                errors={errors}
                                            />
                                        </TabPanel>
                                        <TabPanel>
                                            {/* Health and Wellness Tab */}
                                            <HealthWellnessPartition
                                                values={values}
                                                isEditing={isEditing}
                                                setFieldValue={setFieldValue}
                                            />   
                                        </TabPanel>
                                        <TabPanel>
                                            {/* Case Notes Tab */}
                                            <CaseNotesPartition
                                                notesData={notesData}
                                                selectedNote={selectedNote}
                                                handleShowNoteDetails={handleShowNoteDetails}
                                                handleCloseNoteDetails={handleCloseNoteDetails}
                                                showNewNoteForm={showNewNoteForm}
                                                handleAddNoteClick={handleAddNoteClick}
                                                values={values}
                                                setFieldValue={setFieldValue}
                                                isEditing={isEditing}
                                                errors={errors}
                                            />
                                        </TabPanel>
                                        <TabPanel>
                                            {/* Legal Notes Tab */}
                                            <LegalNotesPartition
                                                notesData={notesData}
                                                selectedNote={selectedNote}
                                                handleShowNoteDetails={handleShowNoteDetails}
                                                handleCloseNoteDetails={handleCloseNoteDetails}
                                                showNewNoteForm={showNewNoteForm}
                                                handleAddNoteClick={handleAddNoteClick}
                                                values={values}
                                                setFieldValue={setFieldValue}
                                                isEditing={isEditing}
                                                errors={errors}
                                            />
                                        </TabPanel>
                                    </Tabs>
                                </div>
                            </Row>
                            {/* Action buttons */}
                            <Row className="mt-3 justify-content-end">
                                {!isEditing ? (
                                    <Col md="2" className="d-flex gap-2"> <Button className={styles.cancelButton} onClick={() => setIsEditing(true)}>Edit</Button> </Col>
                                ) : (
                                    <>
                                        <Col md="2" className="d-flex gap-2"><Button className={styles.cancelButton} onClick={() => { resetForm(); setIsEditing(false); setShowNewNoteForm(false) }}>Cancel</Button> </Col>
                                        <Col md="2" className="d-flex gap-2"><Button className={styles.submitButton} type="submit">Save</Button> </Col>
                                    </>
                                )}
                            </Row>
                            {formSent && <div className={styles.successfulText}>Form saved successfully!</div>}
                    </Form>
                )}
            </Formik>
    );
}
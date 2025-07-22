"use client";
import { useEffect, useState } from "react";
import styles from "../full-intake/fullIntake.module.css";
import { Formik, Form } from "formik";
import { Button, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import supabase from "../lib/supabase";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { getFormInitialValues } from "./InitialValues";

import HealthWellnessPartition from "./form-sections/HealthWellnessPartition"
import CaseNotesPartition from "./form-sections/CaseNotesPartition";
import LegalNotesPartition from "./form-sections/LegalNotesPartition";
import ChildrenPartition from "./form-sections/ChildrenPartition";
import ChildFamilyServicesPartition from "./form-sections/ChildFamilyServices";
import GeneralInformationPartition from "./form-sections/GeneralInformationPartition";
import GeneralInformationHeader from "./form-sections/GeneralInformationHeader";


import fullIntakeInputValidation from "./utils/fullIntakeInputValidation";
import FullIntakeFormSubmit from "./utils/FullIntakeFormSubmit";

export default function FullIntakeForm({client_id, userId, getToken, isEditMode = false} ){
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

        async function fetchClientData() {
            setLoading(true);

            // Gets data from the client
            const { data: clientData, error: clientError } = await supabase
                .from("Clients")
                .select("*")
                .eq("client_id", client_id)
                .maybeSingle();

            if (clientError) {
                console.error("Error fetching client data:", clientError.message || clientError);
            } else {
                setOriginalData(clientData);
                                console.log("🔍 RAW DATABASE DATA (originalData):");
                console.log(JSON.stringify(clientData, null, 2));
                console.log("🔍 SPECIFIC FIELD CHECK - relationshipToChildren:", clientData?.relationshipToChildren);
            }

            // Gets the children associated with the client
            const { data: children, error: childrenError } = await supabase
                .from("Childs")
                .select("*")
                .eq("client_id", client_id);

            if (childrenError) {
                console.error("Error fetching children data:", childrenError.message || childrenError);
            } else {
                // console.log("Children Data:", children);
                setChildrenData(children || []);
            }

            // Gets the family members associated with the client
            const { data: familyData, error: familyError } = await supabase
                .from("Important Family and Friends")
                .select("*")
                .eq("client_id", client_id);

            if (familyError) {
                console.error("Error fetching family data:", familyError.message || familyError);
            } else {
                // console.log("Family Data:", familyData);
                setFamilyData(familyData || []);
            }

            // Gets the home members associated with the client
            const { data: homeMembersData, error: homeMembersError } = await supabase
                .from("Home Members")
                .select("*")
                .eq("client_id", client_id);

            if (homeMembersError) {
                console.error("Error fetching home members data:", homeMembersError.message || homeMembersError);
            } else {
                // console.log("Home members Data:", homeMembersData);
                setHomeMembersData(homeMembersData || []);
            }

            // Gets the EIA workers associated with the client
            const { data: EIAData, error: EIAError } = await supabase
                .from("EIA Workers")
                .select("*")
                .eq("client_id", client_id);

            if (EIAError) {
                console.error("Error fetching EIA data:", EIAError.message || EIAError);
            } else {
                // console.log("EIA Data:", EIAData);
                setEIAData(EIAData || []);
            }

            // Gets the case notes associated with the client
            const {data: notes, error: notesError} = await supabase
                .from("Notes")
                .select("*")
                .eq("client_id", client_id );

            if (notesError){
                console.error("Error fetching notes data:", notesError.message || notesError);
            }else {
                // console.log("Notes Data:", notes);
                setNotesData(notes || []);
            }

            // Separate notes by type
            if (notes) {
                setCaseNotes(notes.filter(note => note.noteType === "Case"));
                setLegalNotes(notes.filter(note => note.noteType === "Legal"));
            }

            setLoading(false);
        }

        fetchClientData();
    }, [client_id]);


    if (loading) {
        return <div>Loading...</div>;
    }

    return(
        <div className="form-container">
            <Formik
                initialValues={(() => {
                    const formInitialValues = getFormInitialValues({
                        originalData,
                        childrenData,
                        notesData,
                        caseNotes,
                        legalNotes,
                        familyData,
                        EIAData,
                        homeMembersData,
                    });
                    
                    console.log("📊 FORM INITIAL VALUES (after conversion):");
                    console.log(JSON.stringify(formInitialValues, null, 2));
                    
                    console.log("🔍 RADIO BUTTON FIELD COMPARISON:");
                    console.log("Field Name | Database Value | Form Value");
                    console.log("----------------------------------------");
                    
                    // Radio button fields comparison
                    const radioFields = [
                        'onReserve', 'transitionFromReserve', 'previousFNFAOClient', 'casePlanCopy',
                        'prenatalSupport', 'housingSupport', 'addictionsSupport', 'youthSupport',
                        'custodySupport', 'criminalCharges', 'activeWarrant',
                        'activeInvestigation', 'activeOrders', 'currentLawyer', 'legalAssistance',
                        'residentialSchool', 'negativeCopingSkills', 'educationalGoals', 'accessElder',
                        'kinship', 'prentativeSupport', 'privateAgreement', 'previousInvolvement',
                        'parentalCapacityDone', 'cfsExplain', 'turnToKinshipCare'
                    ];
                    
                    radioFields.forEach(field => {
                        const dbValue = originalData?.[field];
                        const formValue = formInitialValues[field];
                        console.log(`${field} | ${dbValue} | ${formValue}`);
                    });
                    
                    console.log("\n🔍 TEXT FIELD COMPARISON:");
                    console.log("Field Name | Database Value | Form Value");
                    console.log("----------------------------------------");
                    
                    // Text field comparison
                    const textFields = [
                        'firstName', 'middleName', 'lastName', 'dateOfBirth', 'phoneNumber',
                        'address', 'city', 'province', 'postalCode', 'email', 'firstNationMembership',
                        'treatyNumber', 'otherFirstNation', 'ninePersonalHealthNumber', 'sixPersonalHealthNumber',
                        'martialStatus', 'sourceIncome', 'lawyerFullName', 'lawyerPhoneNumber', 'lawyerEmail'
                    ];
                    
                    textFields.forEach(field => {
                        const dbValue = originalData?.[field];
                        const formValue = formInitialValues[field];
                        console.log(`${field} | "${dbValue}" | "${formValue}"`);
                    });
                    
                    return formInitialValues;
                })()}
                enableReinitialize
                validate={fullIntakeInputValidation}
                onSubmit={FullIntakeFormSubmit(values, resetForm, userId, getToken, setFormSent)}
            >
            {({ values, errors, resetForm, setFieldValue }) => (
                <>
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
                            <div className="{styles.tabsContainer}">
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
                        <Row className="mt-3">
                            {!isEditing ? (
                                <Col md={4}> <Button className={styles.cancelButton} onClick={() => setIsEditing(true)}>Edit</Button> </Col>
                            ) : (
                                <>
                                    <Col md={4}><Button className={styles.cancelButton} onClick={() => { resetForm(); setIsEditing(false); setShowNewNoteForm(false) }}>Cancel</Button> </Col>
                                    <Col md={4}><Button className={styles.submitButton} type="submit">Save</Button> </Col>
                                </>
                            )}
                        </Row>
                        {formSent && <div className={styles.successfulText}>Form saved successfully!</div>}
                    </Form>
                </>
            )}
            </Formik>
        </div>
    );
}
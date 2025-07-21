"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../full-intake/fullIntake.module.css";
import { Formik, Form } from "formik";
import { Button, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { handleNotesUpdate } from "../utils/notesUpdates"; // handles updates to the Notes table
import { handleFamilyUpdate }  from "../utils/familyUpdates";
import { handleHomeMembersUpdate } from "../utils/homeMebersUpdate";
import { handleEIAUpdate } from "../utils/EIAUpdates";

import supabase from "../lib/supabase";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { getFormInitialValues } from "./InitialValues";
import handleChildrenUpdate from "./childrenUpdate";

import HealthWellnessPartition from "./form-sections/HealthWellnessPartition"
import CaseNotesPartition from "./form-sections/CaseNotesPartition";
import LegalNotesPartition from "./form-sections/LegalNotesPartition";
import ChildrenPartition from "./form-sections/ChildrenPartition";
import ChildFamilyServicesPartition from "./form-sections/ChildFamilyServices";
import GeneralInformationPartition from "./form-sections/GeneralInformationPartition";
import GeneralInformationHeader from "./GeneralInformationHeader";

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
                validate={(values) => {
                    let errors = {};
                // Validations - Only require essential fields
                if (!values.firstName) {
                    errors.firstName = "Please enter a name";
                } else if (!/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.firstName)) {
                    errors.firstName = "The name can only contain letters and spaces";
                }

                if (
                    values.middleName &&
                    !/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.middleName)
                ) {
                    errors.middleName =
                    "The middle name can only contain letters and spaces";
                }

                if (!values.lastName) {
                    errors.lastName = "Please enter a last name";
                } else if (!/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.lastName)) {
                    errors.lastName =
                    "The last name can only contain letters and spaces";
                }

                // Optional field validations - only validate format if provided
                if (values.dateOfBirth) {
                    const birthDate = new Date(values.dateOfBirth);
                    const currentYear = new Date().getFullYear();
                    const birthYear = birthDate.getFullYear();

                    // Year validation
                    if (birthYear > currentYear) {
                    errors.dateOfBirth = "Birth year cannot be in the future";
                    }

                    // Month validation
                    const birthMonth = birthDate.getMonth() + 1;
                    if (birthMonth < 1 || birthMonth > 12) {
                    errors.dateOfBirth = "Birth month must be between 01 and 12";
                    }

                    // Day validation
                    const birthDay = birthDate.getDate();
                    if (birthDay < 1 || birthDay > 31) {
                    errors.dateOfBirth = "Birth day must be between 01 and 31";
                    }
                }

                // Phone number - optional, but validate format if provided
                // Note: Remove the required validation

                // Address - optional, but validate format if provided
                const addressRegex = /^[a-zA-Z0-9\s,.-]*$/;
                if (values.address && !addressRegex.test(values.address)) {
                    errors.address = "The address contains invalid characters";
                }

                // City - optional, but validate format if provided
                if (values.city && !/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.city)) {
                    errors.city = "The city can only contain letters and spaces";
                }

                // Province - optional, no validation needed

                // Postal code - optional, but validate format if provided
                if (
                    values.postalCode &&
                    !/^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(values.postalCode)
                ) {
                    errors.postalCode = "Invalid postal code format (e.g., A1A 1A1)";
                }

                // Email - optional, but validate format if provided
                if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
                    errors.email = "Invalid email format";
                }

                    return errors;
                }}
                onSubmit={async (values, { resetForm }) => {
                    try {
                        // const { getToken } = useAuth();
                        const token = await getToken({ template: "supabase" });

                        // console.log("Token", token);

                        // console.log("Form submitted with values:", values);
                        // console.log("onSubmit values.notes:", values);
                        // Validate that client_id is valid
                        if (!client_id) {
                            console.error("Error: client_id is not valid:", client_id);
                            return;
                        }

                        // Validate that values are not empty
                        if (!values || Object.keys(values).length === 0) {
                            console.error("Error: No values to update.");
                            return;
                        }

                        // Check if values are different from the original data
                        const isClientUnchanged = JSON.stringify(values) === JSON.stringify(originalData);
                        const isChildrenUnchanged = JSON.stringify(values.children) === JSON.stringify(childrenData);
                        const isFamilyUnchanged = JSON.stringify(values.family) === JSON.stringify(familyData);
                        const isHomeMembersUnchanged = JSON.stringify(values.homeMembers) === JSON.stringify(homeMembersData);
                        const isEIAUnchanged = JSON.stringify(values.EIA) === JSON.stringify(EIAData);
                        const isNotesUnchanged = JSON.stringify(values.notes) === JSON.stringify(notesData);

                        if (isClientUnchanged && isChildrenUnchanged && isFamilyUnchanged && isHomeMembersUnchanged && isEIAUnchanged && isNotesUnchanged) {
                            console.warn("Warning: No changes detected, skipping update.");
                            setIsEditing(false);
                            return;
                        }

                        // console.log("Updating Clients with values:", values);
                        const { children, notes, actionPlan, description, type, subType, advocate_id, family, homeMembers, EIA, caseNotes, legalNotes, childMedicalNeeds, childMedicalNeedsExplained,  ...clientValues } = values; // Extract 'children', 'notes', etc  and leave only the 'Clients' values

                        // console.log("Values before updating Clients:", JSON.stringify(clientValues, null, 2)); //quitar
                        // console.log("Updating client_id:", client_id);//quitar
                        // console.log("Children data before update:", JSON.stringify(values.children, null, 2)); //quitar
                        // console.log("Notes data before update:", JSON.stringify(values.notes, null, 2)); //quitar

                        // Add dateModified field with the current date and time
                        clientValues.dateModified = new Date().toISOString();

                        // Sanitize boolean fields - convert empty strings and "yes"/"no" strings to proper boolean values
                        const booleanFields = [
                            'onReserve', 'transitionFromReserve', 'previousFNFAOClient', 'casePlanCopy', 
                            'prenatalSupport', 'housingSupport', 'addictionsSupport', 'youthSupport', 
                            'custodySupport', 'criminalCharges', 'activeWarrant', 
                            'activeInvestigation', 'activeOrders', 'currentLawyer', 'legalAssistance',
                            'residentialSchool', 'cfsCare', 'adoptedScoop', 'experiencedSuicide', 
                            'MMIWG2S', 'familyViolence', 'FASD', 'ADHD', 'PTSD', 'depression', 
                            'cancerAutoimmuneCondition', 'otherMentalCondition', 'negativeCopingSkills',
                            'educationalGoals', 'accessElder', 'kinship', 'prentativeSupport', 
                            'privateAgreement', 'previousInvolvement', 'parentalCapacityDone', 
                            'cfsExplain', 'turnToKinshipCare'
                        ];

                        booleanFields.forEach(field => {
                            const value = clientValues[field];
                            if (value === "yes" || value === true) {
                                clientValues[field] = true;
                            } else if (value === "no" || value === false) {
                                clientValues[field] = false;
                            } else if (value === "" || value === null || value === undefined) {
                                clientValues[field] = null;
                            }
                        });

                        // Updates data in Supabase
                        const { data, error} = await supabase
                            .from("Clients")
                            .update(clientValues)
                            .eq("client_id", client_id)
                            .select(); // This retrieves the updated data

                        // console.log("Supabase response:", response);

                        // If there's an error, print it and exit
                        if (error) {
                            // console.error("Error updating data:", error);
                            console.error("Error updating Clients data:", JSON.stringify(error, null, 2));

                            return;
                        }

                        // Confirm that the update was successful
                        if (data && data.length > 0) {
                            // console.log("Update successful. Updated data:", data);

                            // console.log("Updating Children with values:", values.children);

                            // Call `handle Children Update` to update the children in the database
                            const childrenUpdateSuccess = await handleChildrenUpdate(values.children, client_id, setChildrenData);
                            // console.log("Children update result:", childrenUpdateSuccess);
                            if (!childrenUpdateSuccess) {
                                console.error("Error updating children data.");
                            }

                            // Call `handle family Update` to update the family and friend members in the database
                            const familyUpdateSuccess = await handleFamilyUpdate(values.family, client_id, setFamilyData);
                            // console.log("Family update result:", familyUpdateSuccess);
                            if (!familyUpdateSuccess){
                                console.error("Error update family data.");
                            }

                            // Call `handleHomeMembersUpdate` to update the home members in the database
                            const homeMemberUpdateSuccess = await handleHomeMembersUpdate(values.homeMembers, client_id, setHomeMembersData);
                            // console.log("Home members update result:", homeMemberUpdateSuccess);
                            if (!homeMemberUpdateSuccess){
                                console.error("Error update home members data.");
                            }

                            // Call `handle EIA Update` to update the EIA workers in the database
                            const EIAUpdateSuccess = await handleEIAUpdate(values.EIA, client_id, setEIAData);
                            // console.log("EIA update result:", EIAUpdateSuccess);
                            if (!EIAUpdateSuccess){
                                console.error("Error update EIA data.");
                            }

                            const token = await getToken({ template: "supabase" });
                            // console.log("userId antes de handleNotesUpdate:", userId);

                            // Call `handle Notes Update` to update the notes in the database
                            const notesUpdateSuccess = await handleNotesUpdate(values.notes, client_id, setNotesData, supabase, userId);
                            // console.log("Notes update result:", notesUpdateSuccess);
                            if (!notesUpdateSuccess){
                                console.error("Error update notes data.");
                            }

                            // UPDATE originalData with the new values
                            setOriginalData(data[0]);  // Use the data returned by Supabase

                            setShowNewNoteForm(false);
                            setIsEditing(false);
                            setFormSent(true);
                            resetForm({ values });
                            
                            // Redirect to client list after successful update (like youth-intake form)
                            setTimeout(() => {
                                router.push('/clients');
                            }, 1500);
                        } else {
                            console.warn("Warning: The update did not modify any data.");
                        }

                    } catch (err) {
                        console.error("Unexpected error:", err);
                    }
                }}

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
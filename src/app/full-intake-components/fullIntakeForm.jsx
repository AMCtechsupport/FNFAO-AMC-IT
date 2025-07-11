"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserHome from "../user-home/page";
import styles from "../full-intake/fullIntake.module.css";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import { Button, Container, Row, Col, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import PhoneNumberInput from "@/components/ValidPhoneNumber";
import InputField from "@/components/InputField";
import ReferredBySelect from "@/components/ReferredBySelect";
import ProvincesSelect from "@/components/ProvincesSelect";
import RelationshipToChildrenSelect from "@/components/RelationshipToChildrenSelect";
import StatusCFSFileSelect from "@/components/StatusCFSFileSelect";
import FirstNationSelect from "@/components/FirstNationSelect";
import MartialStatusSelect from "@/components/MartialStatusSelect";
import TypeNoteSelect from "@/components/TypeNoteSelect";
import SubTypeNoteSelect from "@/components/SubTypeNoteSelect"
import GenderSelect from "@/components/GenderSelect";
import YesNoSelect from "../../components/yesNoSelect";
import FormattedDate from "@/components/FormattedDate";
import ManageCfsAgencies from "@/components/ManageCfsAgencies";

import { handleNotesUpdate } from "../utils/notesUpdates"; // handles updates to the Notes table
import { handleFamilyUpdate }  from "../utils/familyUpdates";
import { handleHomeMembersUpdate } from "../utils/homeMebersUpdate";
import { handleEIAUpdate } from "../utils/EIAUpdates";

import supabase from "../lib/supabase";
import { useAuth } from "@clerk/nextjs";
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { isValidUUID } from '../utils/isValidUUID';
import { useUser } from '@clerk/clerk-react';

import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { FormInitialValue, getFormInitialValues } from "./InitialValues";
import handleChildrenUpdate from "./childrenUpdate";

import CaseNotesPartition from "./CaseNotesPartition";
import LegalNotesPartition from "./LegalNotesPartition"

export default function FullIntakeForm({client_id, userId, getToken, isEditMode = false} ){
    const router = useRouter();
    const [originalData, setOriginalData] = useState(null);
    const [childrenData, setChildrenData] = useState([]); // State for children
    const [familyData, setFamilyData] = useState([]);
    const [homeMembersData, setHomeMembersData] = useState([]);
    const [EIAData, setEIAData] = useState([]);

    const [emergencyContactData, setEmergencyContactData] = useState([]);

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
                        <div >

                            <Row>
                                <Col md={4}><label htmlFor="createdAt"> <strong> Created At: </strong> {values.createdAt}</label>

                                </Col>

                                <Col md={4}><label htmlFor="dateModified"> <strong> Last Updated: </strong> {values.dateModified}</label>

                                </Col>

                                <Col md={4}>
                                    <label><strong>Updated by:</strong></label>
                                    <div>{values.modifiedBy}</div>
                                </Col>
                            </Row>
                        </div>
                        <hr className="separator-line" />

                        <div className="bg- p-2 rounded border border-light border-1">
                            <Row className="mt-3">
                                <Col md={3}>
                                    <InputField name="firstName" label="First Name:" placeholder="John" error={errors.firstName} disabled={!isEditing} />
                                </Col>

                                <Col md={3}>
                                    <InputField name="middleName" label="Middle Name:" error={errors.middleName} disabled={!isEditing} />
                                </Col>
                                <Col md={3}>
                                    <InputField name="lastName" label="Last Name:" placeholder="Connor" error={errors.lastName} disabled={!isEditing} />
                                </Col>

                                <Col md={3}>
                                    <div>
                                        <label htmlFor="dateOfBirth">Birth Date:</label>
                                        <Field type="date" id="dateOfBirth" name="dateOfBirth" disabled={!isEditing} />
                                        <ErrorMessage name="dateOfBirth" component={() => <p className={styles.errorText}>{errors.dateOfBirth}</p>} />
                                    </div>
                                </Col>
                            </Row>

                            <Row >
                                <Col md={3}>
                                    <InputField name="address" label="Address:" placeholder="161 Main St, Unit 230" error={errors.address} disabled={!isEditing} />
                                </Col>

                                <Col md={3}>
                                    <InputField name="city" label="City:" placeholder="Winnipeg" error={errors.city} disabled={!isEditing} />
                                </Col>

                                <Col md={4}>

                                    <ProvincesSelect name="province" label="Province:" error={errors.province} disabled={!isEditing} />
                                </Col>

                                <Col md={2}>
                                    <InputField name="postalCode" label="Postal code:" placeholder="R3C 0V8" error={errors.postalCode} disabled={!isEditing} />
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col md={3}>
                                    <div>
                                        <label htmlFor="phoneNumber">Phone Number:</label>
                                        <Field type="number" id="phoneNumber" name="phoneNumber" component={PhoneNumberInput} placeholder="(123) 456-7890" disabled={!isEditing} />
                                        <ErrorMessage name="phoneNumber" component={() => <p className={styles.errorText}>{errors.phoneNumber}</p>} />
                                    </div>
                                </Col>

                                <Col md={4}>
                                    <div>
                                        <label htmlFor="email">Email:</label>
                                        <Field type="email" id="email" name="email" disabled={!isEditing} />
                                        <ErrorMessage name="email" component={() => <p className={styles.errorText}>{errors.email}</p>} />
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        {/* Emrgency contact */}
                        {/* <div className="p-2 rounded border border-light border-1 bg-transparent">

                            <Row className={styles.emergencyContact}>
                                <Col md={3}><label><strong>Emergency Contact</strong></label></Col>
                                <Col md={3}>
                                    <InputField
                                        name="emergencyContactFirstName"
                                        label="First Name:"
                                        placeholder=""
                                        error={errors.emergencyContactFirstName}
                                        disabled={!isEditing}
                                    />
                                </Col>

                                <Col md={3}>
                                    <InputField
                                        name="emergencyContactLastName"
                                        label="Last Name:"
                                        placeholder=""
                                        error={errors.emergencyContactLastName}
                                        disabled={!isEditing}
                                    />
                                </Col>

                                <Col md={3}>
                                    <div>
                                        <label htmlFor="emergencyContactNumber">Phone Number:</label>
                                        <Field
                                        type="number"
                                        id="emergencyContactNumber"
                                        name="emergencyContactNumber"
                                        component={PhoneNumberInput}
                                        placeholder="(123) 456-7890"
                                        disabled={!isEditing}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </div> */}
                        <Row>
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

                                        <Row className="mt-2">
                                            <Col md={5}>
                                                <Field
                                                    name="firstNationMembership"
                                                    component={FirstNationSelect}
                                                    label="First Nation Membership"
                                                    error={errors.firstNationMembership}
                                                    disabled={!isEditing}
                                                />
                                            </Col>
                                            <Col md={3}>
                                                <InputField name="treatyNumber" label="Treaty Number:" placeholder="" error={errors.treatyNumber} disabled={!isEditing} />
                                            </Col>
                                            <Col md={4}>

                                                <Field
                                                    name="otherFirstNation"
                                                    component={FirstNationSelect}
                                                    label="Other First Nation"
                                                    error={errors.otherFirstNation}
                                                    disabled={!isEditing}
                                                />
                                            </Col>
                                        </Row>

                                        <Row className="mt-3">
                                            <Col md={5}>
                                                <label>Personal Health Identification Numbers (9-Digit):</label>
                                                <Field type="number" id="ninePersonalHealthNumber" placeholder="000000000" name="ninePersonalHealthNumber" disabled={!isEditing} />
                                                <ErrorMessage name="ninePersonalHealthNumber" component={() => <p className={styles.errorText}>{errors.ninePersonalHealthNumber}</p>} />
                                            </Col>
                                            <Col md={3}>
                                                <label>(6-Digit):</label>
                                                <Field type="number" id="sixPersonalHealthNumber" placeholder="000000" name="sixPersonalHealthNumber" disabled={!isEditing} />
                                                <ErrorMessage name="sixPersonalHealthNumber" component={() => <p className={styles.errorText}>{errors.sixPersonalHealthNumber}</p>} />
                                            </Col>
                                            <Col md={4}>
                                                <MartialStatusSelect name="martialStatus" label="Marital Status" error={errors.martialStatus} disabled={!isEditing} />
                                            </Col>
                                        </Row>

                                        <hr className="separator-line" />
                                        <Row className={styles.group}>
                                            <Col md={4}>
                                                <div>
                                                    <label>Are you living on or off reserve?  </label>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="onReserve" value="yes" checked={values.onReserve === "yes"} disabled={!isEditing} />
                                                        <label className="form-check-label">Yes</label>
                                                    </div>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="onReserve" value="no" checked={values.onReserve === "no"} disabled={!isEditing} />
                                                        <label className="form-check-label">No</label>
                                                    </div>
                                                    <ErrorMessage name="onReserve" component="div" className={styles.onReserve} />
                                                </div>
                                            </Col>
                                            <Col md={4}>
                                                <div>
                                                    <label>Have you transitioned from a reserve to the city recently?</label>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="transitionFromReserve" value="yes" checked={values.transitionFromReserve === "yes"} disabled={!isEditing} />
                                                        <label className="form-check-label">Yes</label>
                                                    </div>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="transitionFromReserve" value="no" checked={values.transitionFromReserve === "no"} disabled={!isEditing} />
                                                        <label className="form-check-label">No</label>
                                                    </div>
                                                    <ErrorMessage name="transitionFromReserve" component="div" className={styles.transitionFromReserve} />
                                                </div>
                                            </Col>
                                            <Col md={4}>
                                                <div>
                                                    <label>Are you a previous client of FNFAO?</label>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="previousFNFAOClient" value="yes" checked={values.previousFNFAOClient === "yes"} disabled={!isEditing} />
                                                        <label className="form-check-label">Yes</label>
                                                    </div>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="previousFNFAOClient" value="no" checked={values.previousFNFAOClient === "no"} disabled={!isEditing}/>
                                                        <label className="form-check-label">No</label>
                                                    </div>
                                                    <ErrorMessage name="previousFNFAOClient" component="div" className={styles.previousFNFAOClient} />
                                                </div>
                                            </Col>
                                        </Row>

                                        <Row className={styles.group}>
                                            <Col md={4}>
                                                <div>
                                                    <label>Need prenatal support?</label>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="prenatalSupport" value="yes"  checked={values.prenatalSupport === "yes"} disabled={!isEditing} />
                                                        <label className="form-check-label">Yes</label>
                                                    </div>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="prenatalSupport" value="no" checked={values.prenatalSupport === "no"} disabled={!isEditing} />
                                                        <label className="form-check-label">No</label>
                                                    </div>
                                                    <ErrorMessage name="prenatalSupport" component="div" className={styles.errorText} />
                                                </div>
                                            </Col>
                                            {values.prenatalSupport === "yes" && (

                                                <Col md={8}>
                                                    <label>If yes, specify (e.g. help avoiding birth apprehension, access to prenatal care, breastfeeding information, preparing for baby, etc.):</label>
                                                    <Field as="textarea" name="prenatalSupportSpecified" className={styles.textarea} disabled={!isEditing} />
                                                    <ErrorMessage name="prenatalSupportSpecified" component="div" className={styles.errorText} />
                                                </Col>
                                            )}
                                        </Row>

                                        <Row className={styles.group}>
                                            <Col md={4}>
                                                <div>
                                                    <label>Need housing support?</label>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="housingSupport" value="yes" checked={values.housingSupport === "yes"} disabled={!isEditing} />
                                                        <label className="form-check-label">Yes</label>
                                                    </div>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="housingSupport" value="no" checked={values.housingSupport === "no"} disabled={!isEditing} />
                                                        <label className="form-check-label">No</label>
                                                    </div>
                                                    <ErrorMessage name="housingSupport" component="div" className={styles.errorText} />
                                                </div>
                                            </Col>
                                            {values.housingSupport === "yes" && (

                                                <Col md={8}>
                                                    <label>If yes, specify (e.g. urgent housing, preventing eviction, dealing with the Residential Tenancies Branch, etc):</label>
                                                    <Field as="textarea" name="housingSupportSpecified" className={styles.textarea} disabled={!isEditing} />
                                                    <ErrorMessage name="housingSupportSpecified" component="div" className={styles.errorText} />
                                                </Col>
                                            )}
                                        </Row>

                                        <Row className={styles.group}>
                                            <Col md={4}>
                                                <div>
                                                    <label>Need addictions support?</label>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="addictionsSupport" value="yes" checked={values.addictionsSupport === "yes"} disabled={!isEditing} />
                                                        <label className="form-check-label">Yes</label>
                                                    </div>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="addictionsSupport" value="no" checked={values.addictionsSupport === "no"} disabled={!isEditing} />
                                                        <label className="form-check-label">No</label>
                                                    </div>
                                                    <ErrorMessage name="addictionsSupport" component="div" className={styles.errorText} />
                                                </div>
                                            </Col>
                                            {values.addictionsSupport === "yes" && (

                                                <Col md={8}>
                                                    <label>If yes, specify (e.g. access to detox, treatment, relapse prevention programming, etc.):</label>
                                                    <Field as="textarea" name="addictionsSupportSpecified" className={styles.textarea} disabled={!isEditing} />
                                                    <ErrorMessage name="addictionsSupportSpecified" component="div" className={styles.errorText} />
                                                </Col>
                                            )}
                                        </Row>

                                        {/* Home members */}
                                        <Row className="mt-3">
                                            <div className={styles.group}>
                                                <h5>Important Family Members and Friends</h5>

                                                <FieldArray name="homeMembers">
                                                {({ push, remove }) => (
                                                    <div  className="bg-gray-100 p-2 rounded border border-light border-2">
                                                    {values.homeMembers.map((member, index) => (
                                                        <div key={`${member.home_members_id}-${index}`} className={`${styles.bglightgrey} border rounded p-2 mb-3`}>
                                                        <Row className="align-items-center">
                                                            <Col md={4}>
                                                            <InputField
                                                                name={`homeMembers.${index}.firstName`}
                                                                label="First Name:"
                                                                disabled={!isEditing}
                                                            />
                                                            </Col>

                                                            <Col md={4}>
                                                            <InputField
                                                                name={`homeMembers.${index}.lastName`}
                                                                label="Last Name:"
                                                                disabled={!isEditing}
                                                            />
                                                            </Col>

                                                            <Col md={4}>
                                                            <InputField
                                                                name={`homeMembers.${index}.relationship`}
                                                                label="Relationship:"
                                                                disabled={!isEditing}
                                                            />
                                                            </Col>
                                                        </Row>

                                                        <Row>
                                                            <Col md={4}>
                                                                <div>
                                                                <label
                                                                    htmlFor={`homeMembers.${index}.phoneNumber`}
                                                                >
                                                                    Phone Number:
                                                                </label>
                                                                <Field
                                                                    type="number"
                                                                    id={`homeMembers.${index}.phoneNumber`}
                                                                    name={`homeMembers.${index}.phoneNumber`}
                                                                    component={PhoneNumberInput}
                                                                    placeholder="(123) 456-7890"
                                                                    disabled={!isEditing}
                                                                />
                                                                </div>
                                                            </Col>
                                                            <Col md={4}>
                                                                <div>
                                                                    <label htmlFor={`homeMembers.${index}.email`}>Email:</label>
                                                                    <Field type="email" id={`homeMembers.${index}.email`} name={`homeMembers.${index}.email`} disabled={!isEditing} />
                                                                    <ErrorMessage
                                                                        name={`homeMembers.${index}.email`}
                                                                        component={() => <p className={styles.errorText}>{errors.homeMembers?.[index]?.email}</p>} />
                                                                </div>
                                                            </Col>
                                                            <Col  md={4}>
                                                                <YesNoSelect
                                                                    name={`homeMembers.${index}.livingTogether`}
                                                                    label="Living Together?"
                                                                    error={errors.homeMembers?.[index]?.livingTogether}
                                                                    disabled={!isEditing}
                                                                />
                                                            </Col>

                                                        </Row>

                                                        <Row>
                                                            <Col md={9}></Col>
                                                            <Col md={3} className="d-flex align-items-end mt-2">
                                                            <Button
                                                                className="w-100 btn btn-danger"
                                                                type="button"
                                                                onClick={() => remove(index)}
                                                                disabled={!isEditing}
                                                            >
                                                                Delete
                                                            </Button>
                                                            </Col>
                                                        </Row>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        className="btn-dark"
                                                        type="button"
                                                        disabled={!isEditing}
                                                        onClick={() =>
                                                        push({
                                                            firstName: "",
                                                            lastName: "",
                                                            relationship: "",
                                                            phoneNumber: "",
                                                            email:"",
                                                            livingTogether: null
                                                        })}>
                                                        + Add Member
                                                    </Button>
                                                    </div>
                                                )}
                                                </FieldArray>
                                            </div>
                                        </Row>

                                        {/* Checkboxes */}

                                        <div className={styles.group}>
                                            <label>Have you or a family member ever experienced any of the following? (Please check all that apply)</label>
                                            {[
                                                { name: "residentialSchool", label: "Attended Residential School?" },
                                                { name: "cfsCare", label: "Been in CFS Care?" },
                                                { name: "adoptedScoop", label: "Adopted in the 60's Scoop?" },
                                                { name: "experiencedSuicide", label: "Experienced Suicide in your family?" },
                                                { name: "MMIWG2S", label: "Connect with the MMIWG2S+ experience?" },
                                                { name: "familyViolence", label: "Impacted by Family Violence?" }
                                            ].map(({ name, label }) => (
                                                <Row key={name} className={styles.checkboxRow}>
                                                    <Col md={1}></Col>
                                                    <Col className={styles.checkboxWrapper} md={4}>
                                                        <label htmlFor={name}>
                                                            <span style={{ marginRight: "7px", fontSize: "1.2em" }}>•</span>
                                                            {label}
                                                        </label>
                                                    </Col>
                                                    <Col md={1}>
                                                        <Field
                                                            type="checkbox"
                                                            name={name}
                                                            checked={Boolean(values[name])}
                                                            onChange={(e) => setFieldValue(name, Boolean(e.target.checked))}
                                                            disabled={!isEditing}
                                                        />
                                                    </Col>
                                                </Row>
                                            ))}
                                        </div>

                                        <Row className={styles.group}>
                                            <h5>Lawyer Information</h5>
                                            <Row className={styles.group}>
                                                <Col md={3}>
                                                    <div>
                                                        <label>Do you have a lawyer?</label>
                                                        <div className="form-check form-check-inline">
                                                            <Field
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="currentLawyer"
                                                                value="yes"
                                                                disabled={!isEditing}
                                                            />
                                                            <label className="form-check-label">Yes</label>
                                                        </div>
                                                        <div className="form-check form-check-inline">
                                                            <Field
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="currentLawyer"
                                                                value="no"
                                                                disabled={!isEditing}
                                                            />
                                                            <label className="form-check-label">No</label>
                                                        </div>
                                                        <ErrorMessage
                                                            name="currentLawyer"
                                                            component="div"
                                                            className={styles.errorText}
                                                        />
                                                    </div>
                                                </Col>
                                            </Row>

                                            {values.currentLawyer === "yes" && (
                                                <Row className={styles.group}>
                                                    <Col md={4}>
                                                        <InputField name="lawyerFullName" label="Lawyer's Full Name:" placeholder="John" error={errors.lawyerFullName} disabled={!isEditing} />
                                                    </Col>
                                                    <Col md={4}>
                                                        <div>
                                                            <label htmlFor="lawyerPhoneNumber">Lawyer's Phone Number:</label>
                                                            <Field type="number" id="lawyerPhoneNumber" name="lawyerPhoneNumber" component={PhoneNumberInput} placeholder="(123) 456-7890" disabled={!isEditing} />
                                                            <ErrorMessage name="lawyerPhoneNumber" component={() => <p className={styles.errorText}>{errors.lawyerPhoneNumber}</p>} />
                                                        </div>
                                                    </Col>
                                                    <Col md={4}>
                                                        <div>
                                                            <label htmlFor="lawyerEmail">Lawyer's Email:</label>
                                                            <Field type="email" id="lawyerEmail" name="lawyerEmail" disabled={!isEditing} />
                                                            <ErrorMessage name="lawyerEmail" component={() => <p className={styles.errorText}>{errors.lawyerEmail}</p>} />
                                                        </div>
                                                    </Col>
                                                </Row>
                                            )}

                                            {values.currentLawyer === "no" && (
                                                <Row className={styles.group}>
                                                    <Col md={3}>
                                                        <div>
                                                            <label>If no, need legal assistance?</label>
                                                            <div className="form-check form-check-inline">
                                                                <Field
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="legalAssistance"
                                                                    value="yes"
                                                                    disabled={!isEditing}
                                                                />
                                                                <label className="form-check-label">Yes</label>
                                                            </div>
                                                            <div className="form-check form-check-inline">
                                                                <Field
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="legalAssistance"
                                                                    value="no"
                                                                    disabled={!isEditing}
                                                                />
                                                                <label className="form-check-label">No</label>
                                                            </div>
                                                            <ErrorMessage
                                                                name="legalAssistance"
                                                                component="div"
                                                                className={styles.errorText}
                                                            />
                                                        </div>
                                                    </Col>
                                                    {values.legalAssistance === "yes" && (
                                                        <Col md={9}>
                                                            <label>If yes, specify:</label>
                                                            <Field
                                                                as="textarea"
                                                                name="legalAssistanceSpecified"
                                                                className={styles.textarea}
                                                                disabled={!isEditing}
                                                            />
                                                            <ErrorMessage
                                                                name="legalAssistanceSpecified"
                                                                component="div"
                                                                className={styles.errorText}
                                                            />
                                                        </Col>
                                                    )}
                                                </Row>
                                            )}
                                        </Row>

                                        <Row className={styles.group}>
                                            <Col className="mt-1">
                                                <label>Source of Income: </label>
                                                <Field as="textarea" name="sourceIncome" className={styles.textarea} disabled={!isEditing} />
                                                <ErrorMessage name="sourceIncome" component="div" className={styles.errorText} />
                                            </Col>
                                        </Row>

                                        <Row className={styles.group}>
                                            <h5>(EIA) Contact Information </h5>
                                            <label htmlFor="">If on Employment and Income Assistance (EIA), provide Contact Information:</label>
                                            <FieldArray name="EIA">
                                                {({ push, remove }) => (
                                                    <div  className="bg-gray-100 p-2 rounded border border-light border-2">
                                                    {values.EIA.map((member, index) => (
                                                        <div key={`${member.EIA_worker_id}-${index}`} className={`${styles.bglightgrey} border rounded p-2 mb-3`}>
                                                        <Row className="align-items-center">
                                                            <Col md={3}>
                                                                <InputField
                                                                    name={`EIA.${index}.firstName`}
                                                                    label="First Name:"
                                                                    disabled={!isEditing}
                                                                />
                                                            </Col>

                                                            <Col md={3}>
                                                                <InputField
                                                                    name={`EIA.${index}.lastName`}
                                                                    label="Last Name:"
                                                                    disabled={!isEditing}
                                                                />
                                                            </Col>

                                                            <Col md={3}>
                                                                <div>
                                                                <label
                                                                    htmlFor={`EIA.${index}.phoneNumber`}
                                                                >
                                                                    Phone Number:
                                                                </label>
                                                                <Field
                                                                    type="number"
                                                                    id={`EIA.${index}.phoneNumber`}
                                                                    name={`EIA.${index}.phoneNumber`}
                                                                    component={PhoneNumberInput}
                                                                    placeholder="(123) 456-7890"
                                                                    disabled={!isEditing}
                                                                />
                                                                </div>
                                                            </Col>
                                                            <Col md={3}>
                                                                <InputField
                                                                    name={`EIA.${index}.EIACaseNumber`}
                                                                    label="Case Number:"
                                                                    disabled={!isEditing}
                                                                />
                                                            </Col>
                                                        </Row>

                                                        <Row>
                                                            <Col md={9}></Col>
                                                            <Col md={3} className="d-flex align-items-end mt-2">
                                                            <Button
                                                                className="w-100 btn btn-danger"
                                                                type="button"
                                                                onClick={() => remove(index)}
                                                                disabled={!isEditing}
                                                            >
                                                                Delete
                                                            </Button>
                                                            </Col>
                                                        </Row>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        className="btn-dark"
                                                        type="button"
                                                        disabled={!isEditing}
                                                        onClick={() =>
                                                        push({
                                                            firstName: "",
                                                            lastName: "",
                                                            phoneNumber: "",
                                                            EIACaseNumber: "",
                                                        })
                                                        }
                                                    >
                                                        + Add EIA Worker
                                                    </Button>
                                                    </div>
                                                )}
                                            </FieldArray>
                                        </Row>

                                        <Row className={styles.group}>
                                            <Col md={4}>
                                            <div>
                                                <label>Do you or do any of your children require youth support?</label>
                                                <div className="form-check form-check-inline">
                                                <Field
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="youthSupport"
                                                    value="yes"
                                                    disabled={!isEditing}
                                                />
                                                <label className="form-check-label">Yes</label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                <Field
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="youthSupport"
                                                    value="no"
                                                    disabled={!isEditing}
                                                />
                                                <label className="form-check-label">No</label>
                                                </div>
                                                <ErrorMessage
                                                name="youthSupport"
                                                component="div"
                                                className={styles.errorText}
                                                />
                                            </div>
                                            </Col>
                                            {values.youthSupport === "yes" && (
                                            <Col md={8}>
                                                <label>
                                                If yes, specify (e.g. help avoiding birth apprehension, access
                                                to prenatal care, breastfeeding information, preparing for
                                                baby, etc.):
                                                </label>
                                                <Field
                                                    as="textarea"
                                                    name="youthSupportSpecified"
                                                    className={styles.textarea}
                                                    disabled={!isEditing}
                                                />
                                                <ErrorMessage
                                                    name="youthSupportSpecified"
                                                    component="div"
                                                    className={styles.errorText}
                                                />
                                            </Col>
                                            )}
                                        </Row>

                                        <Row className={styles.group}>
                                            <Col md={4}>
                                            <div>
                                                <label>Are you seeking support for custody related issues? </label>
                                                <div className="form-check form-check-inline">
                                                <Field
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="custodySupport"
                                                    value="yes"
                                                    disabled={!isEditing}
                                                />
                                                <label className="form-check-label">Yes</label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                <Field
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="custodySupport"
                                                    value="no"
                                                    disabled={!isEditing}
                                                />
                                                <label className="form-check-label">No</label>
                                                </div>
                                                <ErrorMessage
                                                    name="custodySupport"
                                                    component="div"
                                                    className={styles.errorText}
                                                />
                                            </div>
                                            </Col>
                                            {values.custodySupport === "yes" && (
                                            <Col md={8}>
                                                <label>
                                                    If yes, please specify what kind of custody-related issues
                                                    (Example: ex-spouse not honouring custody arrangement for
                                                    access/visitation, grandparent access, child support, etc.):
                                                </label>
                                                <Field
                                                    as="textarea"
                                                    name="custodySupportSpecified"
                                                    className={styles.textarea}
                                                    disabled={!isEditing}
                                                />
                                                <ErrorMessage
                                                    name="custodySupportSpecified"
                                                    component="div"
                                                    className={styles.errorText}
                                                />
                                            </Col>
                                            )}
                                        </Row>
                                        <Row className={styles.group}>
                                            <Col md={4}>
                                            <div>
                                                <label> Do you have any criminal charges (past, active or pending)?</label>
                                                <div className="form-check form-check-inline">
                                                <Field
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="criminalCharges"
                                                    value="yes"
                                                    validate={validateRadio}
                                                    disabled={!isEditing}
                                                />
                                                <label className="form-check-label">Yes</label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                <Field
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="criminalCharges"
                                                    value="no"
                                                    validate={validateRadio}
                                                    disabled={!isEditing}
                                                />
                                                <label className="form-check-label">No</label>
                                                </div>
                                                <ErrorMessage
                                                    name="criminalCharges"
                                                    component="div"
                                                    className={styles.errorText}
                                                />
                                            </div>
                                            </Col>
                                            {values.criminalCharges === "yes" && (
                                            <Col md={8}>
                                                <label>If yes, please specify why: </label>
                                                <Field
                                                    as="textarea"
                                                    name="criminalChargesSpecified"
                                                    className={styles.textarea}
                                                    disabled={!isEditing}
                                                />
                                                <ErrorMessage
                                                    name="criminalChargesSpecified"
                                                    component="div"
                                                    className={styles.errorText}
                                                />
                                            </Col>
                                            )}
                                        </Row>
                                        <Row className={styles.group}>
                                            <Col md={4}>
                                            <div>
                                                <label>Do you currently have an active arrest warrant?</label>
                                                <div className="form-check form-check-inline">
                                                <Field
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="activeWarrant"
                                                    value="yes"
                                                    validate={validateRadio}
                                                    disabled={!isEditing}
                                                />
                                                <label className="form-check-label">Yes</label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                <Field
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="activeWarrant"
                                                    value="no"
                                                    validate={validateRadio}
                                                    disabled={!isEditing}
                                                />
                                                <label className="form-check-label">No</label>
                                                </div>
                                                <ErrorMessage
                                                    name="activeWarrant"
                                                    component="div"
                                                    className={styles.errorText}
                                                />
                                            </div>
                                            </Col>
                                            {values.activeWarrant === "yes" && (
                                            <Col md={8}>
                                                <label>If yes, please specify why: </label>
                                                <Field
                                                    as="textarea"
                                                    name="activeWarrantSpecified"
                                                    className={styles.textarea}
                                                    disabled={!isEditing}
                                                />
                                                <ErrorMessage
                                                    name="activeWarrantSpecified"
                                                    component="div"
                                                    className={styles.errorText}
                                                />
                                            </Col>
                                            )}
                                        </Row>
                                        <Row className={styles.group}>
                                            <Col md={4}>
                                            <div>
                                                <label>
                                                Are you currently under child abuse investigation?
                                                </label>
                                                <div className="form-check form-check-inline">
                                                <Field
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="activeInvestigation"
                                                    value="yes"
                                                    validate={validateRadio}
                                                    disabled={!isEditing}
                                                />
                                                <label className="form-check-label">Yes</label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                <Field
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="activeInvestigation"
                                                    value="no"
                                                    validate={validateRadio}
                                                    disabled={!isEditing}
                                                />
                                                <label className="form-check-label">No</label>
                                                </div>
                                                <ErrorMessage
                                                    name="activeInvestigation"
                                                    component="div"
                                                    className={styles.errorText}
                                                />
                                            </div>
                                            </Col>
                                            {values.activeInvestigation === "yes" && (
                                            <Col md={3}>
                                                <label>If yes, start date: </label>
                                                <Field
                                                    type="date"
                                                    id="activeInvestigationExplained"
                                                    name="activeInvestigationExplained"
                                                    disabled={!isEditing}
                                                />
                                                <ErrorMessage
                                                    name="activeInvestigationExplained"
                                                    component={() => (
                                                        <p className={styles.errorText}>
                                                        {errors.activeInvestigationExplained}
                                                        </p>
                                                    )}
                                                />
                                            </Col>
                                            )}
                                        </Row>
                                        <Row className={styles.group}>
                                            <Col md={4}>
                                            <div>
                                                <label>
                                                Any active No Contact Orders or Protection Orders?
                                                </label>
                                                <div className="form-check form-check-inline">
                                                <Field
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="activeOrders"
                                                    value="yes"
                                                    validate={validateRadio}
                                                    disabled={!isEditing}
                                                />
                                                <label className="form-check-label">Yes</label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                <Field
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="activeOrders"
                                                    value="no"
                                                    validate={validateRadio}
                                                    disabled={!isEditing}
                                                />
                                                <label className="form-check-label">No</label>
                                                </div>
                                                <ErrorMessage
                                                    name="activeOrders"
                                                    component="div"
                                                    className={styles.errorText}
                                                />
                                            </div>
                                            </Col>
                                            {values.activeOrders === "yes" && (
                                            <Col md={8}>
                                                <label>If yes, against who or against you?</label>
                                                <Field
                                                    as="textarea"
                                                    name="activeOrdersExplained"
                                                    className={styles.textarea}
                                                    disabled={!isEditing}
                                                />
                                                <ErrorMessage
                                                    name="activeOrdersExplained"
                                                    component="div"
                                                    className={styles.errorText}
                                                />
                                            </Col>
                                            )}
                                        </Row>
                                    </TabPanel>
                                    <TabPanel>
                                        {/* CFS Tab */}

                                        <h5 className="text-dark">CFS Agencies </h5>
                                        {childrenData.length === 0 ? (
                                            <p>No children found for this client.</p>
                                        ) : (
                                            (() => {
                                                // Group children by agency
                                                const agenciesMap = new Map();

                                                childrenData.forEach(child => {
                                                    if (!agenciesMap.has(child.childCfsAgency)) {
                                                        agenciesMap.set(child.childCfsAgency, []);
                                                    }
                                                    agenciesMap.get(child.childCfsAgency).push(child);
                                                });

                                                // Convert Map to an array for rendering
                                                const agenciesArray = Array.from(agenciesMap.entries());

                                                return (
                                                    <table className="table table-striped table-bordered">
                                                        {/* Table header */}
                                                        <thead className="table-dark">
                                                            <tr>
                                                                <th>CFS Agency</th>
                                                                <th>Child Name</th>
                                                                <th>CFS Agent</th>
                                                                <th>Status</th>
                                                            </tr>
                                                        </thead>

                                                        {/* Table body with grouped data */}
                                                        <tbody>
                                                            {agenciesArray.map(([agency, children]) =>
                                                                children.map((child, index) => (
                                                                    <tr key={child.child_id}>
                                                                        {/* Show agency name only on the first row of the group */}
                                                                        {index === 0 && (
                                                                            <td rowSpan={children.length}>{agency || "N/A"}</td>
                                                                        )}
                                                                        <td>{child.firstName} {child.lastName}</td>
                                                                        <td>{child.childCfsAgentFullName || "N/A"}</td>
                                                                        <td>{child.childStatusCfsFile || "N/A"}</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                );
                                            })()
                                        )}

                                        <hr className="separator-line" />

                                        {/* Agency Worker's table */}
                                        <h5 className="text-dark">Agency Worker </h5>
                                        {childrenData.length > 0 && (() => {
                                            // Extract unique agents from childrenData
                                            const uniqueAgents = Array.from(
                                                new Map(
                                                    childrenData
                                                        .filter(child => child.childCfsAgentFullName)
                                                        .map(child => [child.childCfsAgentFullName, {
                                                            fullName: child.childCfsAgentFullName,
                                                            phone: child.childCfsAgentNumber || "N/A",
                                                            email: child.childCfsAgentEmail || "N/A",
                                                            supervisorName: child.childCfsSupervisorFullName || "N/A"
                                                        }])
                                                ).values()
                                            );

                                            return uniqueAgents.length > 0 ? (
                                                <table className="table table-striped table-bordered">
                                                    {/* Table header */}
                                                    <thead className="table-dark">
                                                        <tr>
                                                            <th>Full Name</th>
                                                            <th>Phone</th>
                                                            <th>Email</th>
                                                        </tr>
                                                    </thead>

                                                    {/* Body of the table with the data of the unique agents*/}
                                                    <tbody>
                                                        {uniqueAgents.map((agent, index) => (
                                                            <tr key={index}>
                                                                <td>{agent.fullName}</td>
                                                                <td>{agent.phone}</td>
                                                                <td>{agent.email}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : null;
                                        })()}

                                        <hr className="separator-line" />

                                        {/* Supervisor's table */}
                                        <h5 className="text-dark">Supervisor</h5>
                                        {childrenData.length > 0 && (() => {
                                            // Extract unique supervisors from childrenData
                                            const uniqueSupervisors = Array.from(
                                                new Map(
                                                    childrenData
                                                        .filter(child => child.childCfsSupervisorFullName)
                                                        .map(child => [child.childCfsSupervisorFullName, {
                                                            supervisorName: child.childCfsSupervisorFullName,
                                                            supervisorPhone: child.childCfsSupervisorNumber || "N/A",
                                                            supervisorEmail: child.childCfsSupervisorEmail || "N/A"
                                                        }])
                                                ).values()
                                            );

                                            return uniqueSupervisors.length > 0 ? (
                                                <table className="table table-striped table-bordered">
                                                    {/* Table header */}
                                                    <thead className="table-dark">
                                                        <tr>
                                                            <th>Supervisor Name</th>
                                                            <th>Phone</th>
                                                            <th>Email</th>
                                                        </tr>
                                                    </thead>

                                                    {/* Body of the table with the data of the unique supervisors*/}
                                                    <tbody>
                                                        {uniqueSupervisors.map((supervisor, index) => (
                                                            <tr key={index}>
                                                                <td>{supervisor.supervisorName}</td>
                                                                <td>{supervisor.supervisorPhone}</td>
                                                                <td>{supervisor.supervisorEmail}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : null;
                                        })()}

                                        <hr className="separator-line" />

                                        <Row className={styles.group}>
                                            <Col>
                                                <label>How long have your children been in CFS care?</label>
                                                <Field
                                                    as="textarea"
                                                    name="childrenInCareDuration"
                                                    className={styles.textarea}
                                                    disabled={!isEditing}
                                                />
                                                <ErrorMessage
                                                    name="childrenInCareDuration"
                                                    component="div"
                                                    className={styles.errorText}
                                                />
                                            </Col>
                                        </Row>

                                        <Row className={styles.group}>
                                            <Col>
                                                <label> What was the reason given by CFS for apprehending your children?</label>
                                                <Field
                                                    as="textarea"
                                                    name="cfsChildrenApprehesionReason"
                                                    className={styles.textarea}
                                                    disabled={!isEditing}
                                                />
                                                <ErrorMessage
                                                    name="cfsChildrenApprehesionReason"
                                                    component="div"
                                                    className={styles.errorText}
                                                />
                                            </Col>
                                        </Row>

                                        <Row className={styles.group}>
                                            <Col md={4}>
                                                <div>
                                                    <label>Are any of your children placed with family (Kinship Care)?</label>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="kinship" value="yes"  checked={values.kinship === "yes"} disabled={!isEditing} />
                                                        <label className="form-check-label">Yes</label>
                                                    </div>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="kinship" value="no" checked={values.kinship === "no"} disabled={!isEditing} />
                                                        <label className="form-check-label">No</label>
                                                    </div>
                                                    <ErrorMessage name="kinship" component="div" className={styles.errorText} />
                                                </div>
                                            </Col>
                                            {values.kinship === "yes" && (

                                                <Col md={8}>
                                                    <label>If yes, explain:</label>
                                                    <Field as="textarea" name="kinshipExplained" className={styles.textarea} disabled={!isEditing} />
                                                    <ErrorMessage name="kinshipExplained" component="div" className={styles.errorText} />
                                                </Col>
                                            )}
                                        </Row>

                                        {/* Family members or friends for Kinship Care */}
                                        <Row className={styles.group}>
                                            <h5 className="text-dark">Family Members or Friends for Kinship Care</h5>
                                            <Col md={8}>
                                                <div>
                                                    <label>Do you have any family members or friends that you can turn to for Kinship Care?</label>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="turnToKinshipCare" value="yes"  checked={values.turnToKinshipCare === "yes"} disabled={!isEditing} />
                                                        <label className="form-check-label">Yes</label>
                                                    </div>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="turnToKinshipCare" value="no" checked={values.turnToKinshipCare === "no"} disabled={!isEditing} />
                                                        <label className="form-check-label">No</label>
                                                    </div>
                                                    <ErrorMessage name="turnToKinshipCare" component="div" className={styles.errorText} />
                                                </div>
                                            </Col>
                                            {values.turnToKinshipCare === "yes" && (
                                                <Row className="mt-3">

                                                    <FieldArray name="family">
                                                    {({ push, remove }) => (
                                                        <div  className="bg-gray-100 p-2 rounded border border-light border-2">
                                                        {values.family.map((member, index) => (
                                                            <div key={`${member.family_and_friends_id}-${index}`} className={`${styles.bglightgrey} border rounded p-2 mb-3`}>
                                                            <Row className="align-items-center">
                                                                <Col md={4}>
                                                                <InputField
                                                                    name={`family.${index}.firstName`}
                                                                    label="First Name:"
                                                                    disabled={!isEditing}
                                                                />
                                                                </Col>

                                                                <Col md={4}>
                                                                <InputField
                                                                    name={`family.${index}.lastName`}
                                                                    label="Last Name:"
                                                                    disabled={!isEditing}
                                                                />
                                                                </Col>

                                                                <Col md={4}>
                                                                <InputField
                                                                    name={`family.${index}.relationshipToClient`}
                                                                    label="Relationship:"
                                                                    disabled={!isEditing}
                                                                />
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col md={4}>
                                                                    <div>
                                                                    <label
                                                                        htmlFor={`family.${index}.phoneNumber`}
                                                                    >
                                                                        Phone Number:
                                                                    </label>
                                                                    <Field
                                                                        type="number"
                                                                        id={`family.${index}.phoneNumber`}
                                                                        name={`family.${index}.phoneNumber`}
                                                                        component={PhoneNumberInput}
                                                                        placeholder="(123) 456-7890"
                                                                        disabled={!isEditing}
                                                                    />
                                                                    </div>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col md={9}></Col>
                                                                <Col md={3} className="d-flex align-items-end mt-2">
                                                                <Button
                                                                    className="w-100 btn btn-danger"
                                                                    type="button"
                                                                    onClick={() => remove(index)}
                                                                    disabled={!isEditing}
                                                                >
                                                                    Delete
                                                                </Button>
                                                                </Col>
                                                            </Row>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            className="btn-dark"
                                                            type="button"
                                                            disabled={!isEditing}
                                                            onClick={() =>
                                                            push({
                                                                firstName: "",
                                                                lastName: "",
                                                                relationshipToClient: "",
                                                                phoneNumber: "",
                                                            })
                                                            }
                                                        >
                                                            + Add Member
                                                        </Button>
                                                        </div>
                                                    )}
                                                    </FieldArray>
                                                </Row>
                                            )}
                                        </Row>
                                        {/* END Family or friends for Kinship Care */}

                                        <Row className={styles.group}>
                                            <Col>
                                                <label> Are there any concerns you have about the level of care your child(ren) are currently receiving?</label>
                                                <Field
                                                    as="textarea"
                                                    name="anyConcerns"
                                                    className={styles.textarea}
                                                    disabled={!isEditing}
                                                />
                                                <ErrorMessage
                                                    name="anyConcerns"
                                                    component="div"
                                                    className={styles.errorText}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className={styles.group}>
                                            <Col md={4}>
                                            <div>
                                                <label>Do you have a copy of your case plan(s)?</label>
                                                <div className="form-check form-check-inline">
                                                <Field
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="casePlanCopy"
                                                    value="yes"
                                                    disabled={!isEditing}
                                                />
                                                <label className="form-check-label">Yes</label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                <Field
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="casePlanCopy"
                                                    value="no"
                                                    disabled={!isEditing}
                                                />
                                                <label className="form-check-label">No</label>
                                                </div>
                                                <ErrorMessage
                                                    name="casePlanCopy"
                                                    component="div"
                                                    className={styles.errorText}
                                                />
                                            </div>
                                            </Col>
                                            {values.casePlanCopy === "no" && (
                                            <Col md={8}>
                                                <label>
                                                If no, describe the last requests the agency asked you to
                                                complete to get your children home:
                                                </label>
                                                <Field
                                                    as="textarea"
                                                    name="casePlanCopyDescribe"
                                                    className={styles.textarea}
                                                    disabled={!isEditing}
                                                />
                                                <ErrorMessage
                                                    name="casePlanCopyDescribe"
                                                    component="div"
                                                    className={styles.errorText}
                                                />
                                            </Col>
                                            )}
                                        </Row>

                                        <Row className={styles.group}>
                                            <Col md={4}>
                                                <div>
                                                    <label>Did you receive any preventative supports to assist you with your children prior to their apprehension?</label>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="prentativeSupport" value="yes"  checked={values.prentativeSupport === "yes"} disabled={!isEditing} />
                                                        <label className="form-check-label">Yes</label>
                                                    </div>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="prentativeSupport" value="no" checked={values.prentativeSupport === "no"} disabled={!isEditing} />
                                                        <label className="form-check-label">No</label>
                                                    </div>
                                                    <ErrorMessage name="prentativeSupport" component="div" className={styles.errorText} />
                                                </div>
                                            </Col>
                                            {values.prentativeSupport === "yes" && (

                                                <Col md={8}>
                                                    <label>If yes, explain:</label>
                                                    <Field as="textarea" name="prentativeSupportExplained" className={styles.textarea} disabled={!isEditing} />
                                                    <ErrorMessage name="prentativeSupportExplained" component="div" className={styles.errorText} />
                                                </Col>
                                            )}
                                        </Row>

                                        <Row className={styles.group}>
                                            <Col md={4}>
                                                <div>
                                                    <label>Do you currently have a Private Agreement or Safety Plan for any of your children?</label>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="privateAgreement" value="yes" checked={values.privateAgreement === "yes"} disabled={!isEditing} />
                                                        <label className="form-check-label">Yes</label>
                                                    </div>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="privateAgreement" value="no" checked={values.privateAgreement === "no"} disabled={!isEditing} />
                                                        <label className="form-check-label">No</label>
                                                    </div>
                                                    <ErrorMessage name="privateAgreement" component="div" className={styles.errorText} />
                                                </div>
                                            </Col>
                                            {values.privateAgreement === "yes" && (

                                                <Col md={8}>
                                                    <label>If yes, explain:</label>
                                                    <Field as="textarea" name="privateAgreementExplained" className={styles.textarea} disabled={!isEditing} />
                                                    <ErrorMessage name="privateAgreementExplained" component="div" className={styles.errorText} />
                                                </Col>
                                            )}
                                        </Row>

                                        <Row className={styles.group}>
                                            <Col>
                                                <div>
                                                    <label>Did CFS accurately explain the process that was to be followed to get your children home?  </label>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="cfsExplain" value="yes" checked={values.cfsExplain === "yes"} disabled={!isEditing} />
                                                        <label className="form-check-label">Yes</label>
                                                    </div>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="cfsExplain" value="no" checked={values.cfsExplain === "no"} disabled={!isEditing} />
                                                        <label className="form-check-label">No</label>
                                                    </div>
                                                    <ErrorMessage name="cfsExplain" component="div" className={styles.errorText} />
                                                </div>
                                            </Col>
                                        </Row>

                                        <Row className={styles.group}>
                                            <Col md={4}>
                                                <div>
                                                    <label>Have you had previous involvement with CFS? </label>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="previousInvolvement" value="yes" checked={values.previousInvolvement === "yes"} disabled={!isEditing} />
                                                        <label className="form-check-label">Yes</label>
                                                    </div>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="previousInvolvement" value="no" checked={values.previousInvolvement === "no"} disabled={!isEditing} />
                                                        <label className="form-check-label">No</label>
                                                    </div>
                                                    <ErrorMessage name="previousInvolvement" component="div" className={styles.errorText} />
                                                </div>
                                            </Col>
                                            {values.previousInvolvement === "yes" && (

                                                <Col md={8}>
                                                    <label>If yes, explain:</label>
                                                    <Field as="textarea" name="previousInvolvementExplain" className={styles.textarea} disabled={!isEditing} />
                                                    <ErrorMessage name="previousInvolvementExplain" component="div" className={styles.errorText} />
                                                </Col>
                                            )}
                                        </Row>

                                        <Row className={styles.group}>
                                            <Col >
                                                <label>What is your current visitation schedule with your children? </label>
                                                <Field as="textarea" name="visitsChildFrequency" className={styles.textarea} disabled={!isEditing} />
                                                <ErrorMessage name="visitsChildFrequency" component="div" className={styles.errorText} />
                                            </Col>
                                        </Row>

                                        <Row className={styles.group}>
                                            <Col md={4}>
                                                <div>
                                                    <label>Have you had a Parental Capacity Assessment (PCA) done?</label>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="parentalCapacityDone" value="yes" checked={values.parentalCapacityDone === "yes"} disabled={!isEditing} />
                                                        <label className="form-check-label">Yes</label>
                                                    </div>
                                                    <div className="form-check form-check-inline">
                                                        <Field  className="form-check-input" type="radio" name="parentalCapacityDone" value="no" checked={values.parentalCapacityDone === "no"} disabled={!isEditing} />
                                                        <label className="form-check-label">No</label>
                                                    </div>
                                                    <ErrorMessage name="parentalCapacityDone" component="div" className={styles.errorText} />
                                                </div>
                                            </Col>
                                            {values.parentalCapacityDone === "yes" && (

                                                <Col md={8}>
                                                    <label>If yes, explain:</label>
                                                    <Field as="textarea" name="parentalCapacity" className={styles.textarea} disabled={!isEditing} />
                                                    <ErrorMessage name="parentalCapacity" component="div" className={styles.errorText} />
                                                </Col>
                                            )}
                                        </Row>


                                    </TabPanel>
                                    <TabPanel>
                                        {/* Children Information Tab */}

                                        {childrenData.length === 0 ? (
                                                <p>No children found for this client.</p>
                                        ):(
                                            <>
                                                <Row className="mt-1 mb-3">
                                                    <Col md={4}>
                                                        <RelationshipToChildrenSelect name="relationshipToChildren" label="What is your relationship to the child(ren)?" error={errors.relationshipToChildren} disabled={!isEditing} />
                                                    </Col>
                                                    <Col md={8}></Col>
                                                </Row>
                                                <Row className={styles.group}>
                                                    <Col md={5}>
                                                        <div>
                                                            <label>Are there any other adults involved in your matter?</label>
                                                            <div className="form-check form-check-inline">
                                                                <Field  className="form-check-input" type="radio" name="otherAdultsInvolved" value="yes" checked={values.otherAdultsInvolved === "yes"} disabled={!isEditing}/>
                                                                <label className="form-check-label">Yes</label>
                                                            </div>
                                                            <div className="form-check form-check-inline">
                                                                <Field  className="form-check-input" type="radio" name="otherAdultsInvolved" value="no" checked={values.otherAdultsInvolved === "no"} disabled={!isEditing} />
                                                                <label className="form-check-label">No</label>
                                                            </div>
                                                            <ErrorMessage name="otherAdultsInvolved" component="div" className={styles.errorText} />
                                                        </div>
                                                    </Col>
                                                    {values.otherAdultsInvolved === "yes" && (

                                                        <Col md={12}>
                                                            <label>Please specify:</label>
                                                            <Field as="textarea" name="otherAdultsInvolvedExplained" className={styles.textarea} disabled={!isEditing}/>
                                                            <ErrorMessage name="otherAdultsInvolvedExplained" component="div" className={styles.errorText} />
                                                        </Col>
                                                    )}
                                                </Row>
                                            </>

                                        )}

                                        {/* list of children */}
                                        <Row className="mb-3">
                                            <h5 className="text-dark">List of Children</h5>
                                            <label className="text-dark">(List all children, including those at home or in care):</label>

                                            <FieldArray name="children">
                                                {({ push, remove }) => (
                                                    <div>
                                                        {values.children
                                                            .sort((a, b) => a.child_id - b.child_id) // Sort children by ascending child_id
                                                            .map((child, index) => (
                                                            <div key={`${child.child_id}-${index}`} className={`${styles.bglightgrey} border rounded p-2 mb-3`} >
                                                                <Row className="mb-2">
                                                                    <Col>
                                                                        <h5>{index + 1}. </h5>
                                                                    </Col>
                                                                </Row>
                                                                <Row className="align-items-center">
                                                                    <Col md={3}>
                                                                        <InputField name={`children.${index}.firstName`} label="First Name:" disabled={!isEditing} />
                                                                    </Col>
                                                                    <Col md={3}>
                                                                        <InputField name={`children.${index}.middleName`} label="Middle Name:" disabled={!isEditing} />
                                                                    </Col>
                                                                    <Col md={6}>
                                                                        <InputField name={`children.${index}.lastName`} label="Last Name:" disabled={!isEditing} />
                                                                    </Col>

                                                                </Row>
                                                                <Row >
                                                                    <Col md={3}>
                                                                        <div>
                                                                            <label htmlFor={`children.${index}.birthDate`}>Date of Birth:</label>
                                                                            <Field type="date" id={`children.${index}.birthDate`} name={`children.${index}.birthDate`} disabled={!isEditing} />
                                                                            <ErrorMessage
                                                                                name={`children.${index}.birthDate`}
                                                                                component={() => <p className={styles.errorText}>{errors.children?.[index]?.birthDate}</p>}
                                                                            />
                                                                        </div>
                                                                    </Col>
                                                                    <Col md={6}>
                                                                        <Field
                                                                            name={`children.${index}.childNation`}
                                                                            component={FirstNationSelect}
                                                                            label="First Nation Membership"
                                                                            error={errors.childNation}
                                                                            disabled={!isEditing}
                                                                        />
                                                                    </Col>
                                                                    <Col md={3}>
                                                                        <GenderSelect name={`children.${index}.gender`} label="Gender:" error={errors.gender} disabled={!isEditing}/>
                                                                    </Col>
                                                                </Row>
                                                                <Row>
                                                                    <Col md={6}>
                                                                        <InputField name={`children.${index}.childPlaced`} label="Place of Stay:" disabled={!isEditing} />
                                                                    </Col>
                                                                </Row>

                                                                {/* Agency information */}
                                                                <hr className="separator-line" />
                                                                <div className="bg-light border border-light p-3 rounded">
                                                                    <Row>
                                                                        <h5 className="text-dark">Agency Information</h5>
                                                                        <Col md={4}>

                                                                            <Field
                                                                                name={`children.${index}.childCfsAgency`}
                                                                                component={ManageCfsAgencies}
                                                                                label="CFS Agency Name:"
                                                                                error={<ErrorMessage name={`children.${index}.childCfsAgency`} component="div" className="text-red-500" />}
                                                                                disabled={!isEditing}
                                                                                value={values.children[index].childCfsAgency}
                                                                                onChange={(e) => setFieldValue(`children.${index}.childCfsAgency`, e.target.value)}
                                                                            />
                                                                        </Col>
                                                                        <Col  md={6}>
                                                                            <Field
                                                                                name={`children.${index}.childStatusCfsFile`}
                                                                                component={StatusCFSFileSelect}
                                                                                label="CFS File Status"
                                                                                error={errors.children?.[index]?.childStatusCfsFile}
                                                                                disabled={!isEditing}
                                                                                value={values.children[index].childStatusCfsFile}
                                                                                onChange={(e) => setFieldValue(`children.${index}.childStatusCfsFile`, e.target.value)}
                                                                            />
                                                                        </Col>
                                                                    </Row>
                                                                    <Row>
                                                                        <Col md={4}>
                                                                            <InputField name={`children.${index}.childCfsAgentFullName`} label="Worker's Full Name:" disabled={!isEditing} />
                                                                        </Col>
                                                                        <Col md={4}>
                                                                            <div>
                                                                                <label htmlFor={`children.${index}.childCfsAgentNumber`}>Worker's Phone Number:</label>
                                                                                <Field type="number" id={`children.${index}.childCfsAgentNumber`} name={`children.${index}.childCfsAgentNumber`} component={PhoneNumberInput} placeholder="(123) 456-7890" disabled={!isEditing} />
                                                                                <ErrorMessage
                                                                                    name={`children.${index}.childCfsAgentNumber`}
                                                                                    component={() => <p className={styles.errorText}>{errors.children?.[index]?.childCfsAgentNumber}</p>} />
                                                                            </div>
                                                                        </Col>
                                                                        <Col md={4}>
                                                                            <div>
                                                                                <label htmlFor={`children.${index}.childCfsAgentEmail`}>Worker's Email:</label>
                                                                                <Field type="email" id={`children.${index}.childCfsAgentEmail`} name={`children.${index}.childCfsAgentEmail`} disabled={!isEditing} />
                                                                                <ErrorMessage
                                                                                    name={`children.${index}.childCfsAgentEmail`}
                                                                                    component={() => <p className={styles.errorText}>{errors.children?.[index]?.childCfsAgentEmail}</p>} />
                                                                            </div>
                                                                        </Col>

                                                                    </Row>

                                                                    {/* CFS Supervisor information */}
                                                                    <Row>
                                                                        <Col md={4}>
                                                                            <InputField name={`children.${index}.childCfsSupervisorFullName`} label="Supervisor Full Name:" disabled={!isEditing} />
                                                                        </Col>
                                                                        <Col md={4}>
                                                                            <div>
                                                                                <label htmlFor={`children.${index}.childCfsSupervisorNumber`}>Supervisor Phone Number:</label>
                                                                                <Field type="number" id={`children.${index}.childCfsSupervisorNumber`} name={`children.${index}.childCfsSupervisorNumber`} component={PhoneNumberInput} placeholder="(123) 456-7890" disabled={!isEditing} />
                                                                                <ErrorMessage
                                                                                    name={`children.${index}.childCfsSupervisorNumber`}
                                                                                    component={() => <p className={styles.errorText}>{errors.children?.[index]?.childCfsSupervisorNumber}</p>} />
                                                                            </div>
                                                                        </Col>
                                                                        <Col md={4}>
                                                                            <div>
                                                                                <label htmlFor={`children.${index}.childCfsSupervisorEmail`}>Supervisor Email:</label>
                                                                                <Field type="email" id={`children.${index}.childCfsSupervisorEmail`} name={`children.${index}.childCfsSupervisorEmail`} disabled={!isEditing} />
                                                                                <ErrorMessage
                                                                                    name={`children.${index}.childCfsSupervisorEmail`}
                                                                                    component={() => <p className={styles.errorText}>{errors.children?.[index]?.childCfsSupervisorEmail}</p>} />
                                                                            </div>
                                                                        </Col>
                                                                    </Row>

                                                                </div>
                                                                {/* END Agency information */}

                                                                {/* Child medical condition */}
                                                                <hr className="separator-line" />
                                                                <div className="bg-light border border-light p-3 rounded">
                                                                    <h5>Child's Medical Information</h5>
                                                                    <Row className={styles.group}>
                                                                        <Col md={5}>
                                                                            <div>
                                                                                <label>Does your child have any medical needs?</label>
                                                                                <div className="form-check form-check-inline">
                                                                                    <Field  className="form-check-input" type="radio" name={`children.${index}.childMedicalNeeds`} value="yes" checked={values.children[index].childMedicalNeeds === "yes"} disabled={!isEditing}/>
                                                                                    <label className="form-check-label">Yes</label>
                                                                                </div>
                                                                                <div className="form-check form-check-inline">
                                                                                    <Field  className="form-check-input" type="radio" name={`children.${index}.childMedicalNeeds`} value="no" checked={values.children[index].childMedicalNeeds === "no"} disabled={!isEditing} />
                                                                                    <label className="form-check-label">No</label>
                                                                                </div>
                                                                                <ErrorMessage name={`children.${index}.childMedicalNeeds`} component="div" className={styles.errorText} />
                                                                            </div>
                                                                        </Col>
                                                                        {values.children[index].childMedicalNeeds === "yes" && (

                                                                            <Col md={12}>
                                                                                <label>Please specify:</label>
                                                                                <Field as="textarea" name={`children.${index}.childMedicalNeedsExplained`} className={styles.textarea} disabled={!isEditing}/>
                                                                                <ErrorMessage name={`children.${index}.childMedicalNeedsExplained`} component="div" className={styles.errorText} />
                                                                            </Col>
                                                                        )}
                                                                    </Row>
                                                                </div>
                                                                {/* END Child medical condition */}

                                                                {/* Another Biological Parent*/}
                                                                <hr className="separator-line" />
                                                                <div className="bg-light border border-light p-3 rounded">
                                                                    <h5>Other Biological Parent Information</h5>
                                                                    <Row className="align-items-center">
                                                                        <Col md={3}>
                                                                            <InputField name={`children.${index}.biologicalParentFirstName`} label="First Name:" disabled={!isEditing} />
                                                                        </Col>
                                                                        <Col md={3}>
                                                                            <InputField name={`children.${index}.biologicalParentLastName`} label="Last Name:" disabled={!isEditing} />
                                                                        </Col>
                                                                        <Col md={6}>
                                                                            <Field
                                                                                name={`children.${index}.biologicalParentFirstNation`}
                                                                                component={FirstNationSelect}
                                                                                label="First Nation Membership"
                                                                                error={errors.biologicalParentFirstNation}
                                                                                disabled={!isEditing}
                                                                            />
                                                                        </Col>

                                                                    </Row>
                                                                </div>
                                                                {/* END Another Biological Parent*/}

                                                                <Row>
                                                                    <Col md={9}></Col>
                                                                    <Col md={3} className="d-flex align-items-end mt-2">
                                                                        <Button className="w-100 btn btn-danger" type="button" onClick={() => remove(index)} disabled={!isEditing} >Delete</Button>
                                                                    </Col>
                                                                </Row>

                                                            </div>
                                                        ))}
                                                        <Button className="btn-dark" type="button" onClick={() =>
                                                            push({
                                                                firstName: "",
                                                                middleName: "",
                                                                lastName: "",
                                                                birthDate: "",
                                                                childNation: "",
                                                                gender:"",
                                                                childPlaced: "",
                                                                childCfsAgency:"",
                                                                childCfsAgentFullName:"",
                                                                childCfsAgentNumber: null,
                                                                childCfsAgentEmail:"",
                                                                childStatusCfsFile:"",
                                                                childCfsSupervisorFullName:"",
                                                                childCfsSupervisorNumber: null,
                                                                childCfsSupervisorEmail:"",
                                                                childMedicalNeeds: null,
                                                                childMedicalNeedsExplained:"",
                                                                biologicalParentFirstName:"",
                                                                biologicalParentLastName:"",
                                                                biologicalParentFirstNation:"",
                                                            })} disabled={!isEditing}>
                                                            + Add Child
                                                        </Button>
                                                    </div>
                                                )}
                                            </FieldArray>
                                        </Row>
                                    </TabPanel>
                                    <TabPanel>
                                        {/* Health and Wellness Tab */}
                                        <Row>
                                            <label>Have you ever been diagnosed with any of the following? (Please check all that apply)</label>
                                        </Row>
                                        <div className={styles.group}>
                                            {[
                                                { name: "FASD", label: "FASD" },
                                                { name: "ADHD", label: "ADHD" },
                                                { name: "PTSD", label: "PTSD" },
                                                { name: "depression", label: "Depression" },
                                                { name: "cancerAutoimmuneCondition", label: "Cancer Autoimmune Condition" },
                                                { name: "otherMentalCondition", label: "Other Mental Health Condition" }
                                            ].map(({ name, label }) => (
                                                <Row key={name} className={styles.checkboxRow}>
                                                    <Col md={1}></Col>
                                                    <Col className={styles.checkboxWrapper} md={4}>
                                                        <label htmlFor={name}>
                                                            <span style={{ marginRight: "7px", fontSize: "1.2em" }}>•</span>
                                                            {label}
                                                        </label>
                                                    </Col>
                                                    <Col md={1}>
                                                        <Field
                                                            type="checkbox"
                                                            name={name}
                                                            checked={Boolean(values[name])}
                                                            onChange={(e) => setFieldValue(name, Boolean(e.target.checked))}
                                                            disabled={!isEditing}
                                                        />
                                                    </Col>
                                                </Row>
                                            ))}
                                        </div>


                                        {values.otherMentalCondition && (
                                        <Row className={styles.group}>
                                            <Col>
                                                <label> Explain Other Mental Health Condition:</label>
                                                <Field
                                                    as="textarea"
                                                    name="otherMentalConditionExplained"
                                                    className={styles.textarea}
                                                    disabled={!isEditing}
                                                />
                                                <ErrorMessage
                                                    name="otherMentalConditionExplained"
                                                    component="div"
                                                    className={styles.errorText}
                                                />
                                            </Col>
                                        </Row>
                                        )}

                                        <Row className={styles.group}>
                                            <Col>
                                            <label htmlFor="diagnosedFollowingExplain">If you have checked any of the above, please describe the supports you have received to address their effects. </label>
                                            <Field
                                                as="textarea"
                                                name="diagnosedFollowingExplain"
                                                className={styles.textarea}
                                                disabled={!isEditing}
                                            />
                                            <ErrorMessage
                                                name="diagnosedFollowingExplain"
                                                component="div"
                                                className={styles.errorText}
                                            />
                                            </Col>
                                        </Row>

                                        <Row className={styles.group}>
                                            <Col md={4}>
                                            <div>
                                                <label>Do you feel that you may struggle with using negative coping skills from to time?</label>
                                                <div className="form-check form-check-inline">
                                                    <Field
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="negativeCopingSkills"
                                                        value="yes"
                                                        disabled={!isEditing}
                                                    />
                                                    <label className="form-check-label">Yes</label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                    <Field
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="negativeCopingSkills"
                                                        value="no"
                                                        disabled={!isEditing}
                                                    />
                                                    <label className="form-check-label">No</label>
                                                </div>
                                                <ErrorMessage
                                                    name="negativeCopingSkills"
                                                    component="div"
                                                    className={styles.errorText}
                                                />
                                            </div>
                                            </Col>
                                            {values.negativeCopingSkills === "yes" && (
                                            <Col md={8}>
                                                <label> If yes, please explain:</label>
                                                <Field
                                                    as="textarea"
                                                    name="negativeCopingSkillsExplain"
                                                    className={styles.textarea}
                                                    disabled={!isEditing}
                                                />
                                                <ErrorMessage
                                                    name="negativeCopingSkillsExplain"
                                                    component="div"
                                                    className={styles.errorText}
                                                />
                                            </Col>
                                            )}
                                        </Row>

                                        <Row className={styles.group}>
                                            <Col>
                                            <label>How has Drugs and/or Alcohol impacted your life? </label>
                                            <Field
                                                as="textarea"
                                                name="drugsImpact"
                                                className={styles.textarea}
                                                disabled={!isEditing}
                                            />
                                            <ErrorMessage
                                                name="drugsImpact"
                                                component="div"
                                                className={styles.errorText}
                                            />
                                            </Col>
                                        </Row>

                                        <Row className={styles.group}>
                                            <Col>
                                            <label>When was the last time you used Drugs and/or Alcohol? </label>
                                            <Field
                                                as="textarea"
                                                name="lastTimeUsed"
                                                className={styles.textarea}
                                                disabled={!isEditing}
                                            />
                                            <ErrorMessage
                                                name="lastTimeUsed"
                                                component="div"
                                                className={styles.errorText}
                                            />
                                            </Col>
                                        </Row>

                                        <Row className={styles.group}>
                                            <Col md={4}>
                                            <div>
                                                <label>Do you have any educational goals we can support you to achieve?</label>
                                                <div className="form-check form-check-inline">
                                                    <Field
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="educationalGoals"
                                                        value="yes"
                                                        disabled={!isEditing}
                                                    />
                                                    <label className="form-check-label">Yes</label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                    <Field
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="educationalGoals"
                                                        value="no"
                                                        disabled={!isEditing}
                                                    />
                                                    <label className="form-check-label">No</label>
                                                </div>
                                                <ErrorMessage
                                                name="educationalGoals"
                                                component="div"
                                                className={styles.errorText}
                                                />
                                            </div>
                                            </Col>
                                            {values.educationalGoals === "yes" && (
                                            <Col md={8}>
                                                <label> If yes, please explain:</label>
                                                <Field
                                                    as="textarea"
                                                    name="educationalGoalsExplained"
                                                    className={styles.textarea}
                                                    disabled={!isEditing}
                                                />
                                                <ErrorMessage
                                                name="educationalGoalsExplained"
                                                component="div"
                                                className={styles.errorText}
                                                />
                                            </Col>
                                            )}
                                        </Row>
                                        <Row className={styles.group}>
                                            <Col md={4}>
                                                <div>
                                                    <label>Do you have access to an Elder or counsellor?</label>
                                                    <div className="form-check form-check-inline">
                                                        <Field
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="accessElder"
                                                            value="yes"
                                                            disabled={!isEditing}
                                                        />
                                                        <label className="form-check-label">Yes</label>
                                                    </div>
                                                    <div className="form-check form-check-inline">
                                                        <Field
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="accessElder"
                                                            value="no"
                                                            disabled={!isEditing}
                                                        />
                                                        <label className="form-check-label">No</label>
                                                    </div>
                                                    <ErrorMessage
                                                    name="accessElder"
                                                    component="div"
                                                    className={styles.errorText}
                                                    />
                                                </div>
                                            </Col>
                                            {values.accessElder === "yes" && (
                                            <Col md={8}>
                                                <label> If yes, please describe:</label>
                                                <Field
                                                    as="textarea"
                                                    name="accessElderExplained"
                                                    className={styles.textarea}
                                                    disabled={!isEditing}
                                                />
                                                <ErrorMessage
                                                name="accessElderExplained"
                                                component="div"
                                                className={styles.errorText}
                                                />
                                            </Col>
                                            )}
                                        </Row>

                                    </TabPanel>
                                    <TabPanel>
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
"use client";
import React, { useEffect, useState } from "react";
import UserHome from "../user-home/page";
import styles from "./fullIntake.module.css";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import { Button, Container, Row, Col, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import InputField from "@/components/InputField";
import ReferredBySelect from "@/components/ReferredBySelect";
import ProvincesSelect from "@/components/ProvincesSelect";
import RelationshipToChildrenSelect from "@/components/RelationshipToChildrenSelect";
import StatusCFSFileSelect from "@/components/StatusCFSFileSelect";
import FirstNationSelect from "@/components/FirstNationSelect";
import MartialStatusSelect from "@/components/MartialStatusSelect";
import TypeNoteSelect from "@/components/TypeNoteSelect";
import SubTypeNoteSelect from "@/components/SubTypeNoteSelect"
import FormattedDate from "@/components/FormattedDate";

import { handleNotesUpdate } from "../utils/notesUpdates"; // handles updates to the Notes table


import supabase from "../lib/supabase";


import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

export default function FullIntake({client_id}) {
    const testClientId = client_id || "61";
    console.log("Client ID First:",client_id);
    return (
        <UserHome>
            <div className={styles.fullIntakeContainer}>
                <div className={styles.container}>
                    <FullIntakeForm client_id = {testClientId} />
                </div>
            </div>
        </UserHome>
    );
}

const handleChildrenUpdate = async (children, client_id, setChildrenData ) => {
    try {
        // Gets the current children in the database
        const { data: existingChildren, error: fetchError } = await supabase
            .from("Childs")
            .select("*")
            .eq("client_id", client_id);

        if (fetchError) {
            console.error("Error fetching existing children:", fetchError);
            return false;
        }

        const existingChildIds = existingChildren.map(child => child.child_id); // Extracts child_id from existingChildren
        const newChildren = [];
        const updatedChildren = [];
        const receivedChildIds = [];

        children.forEach(child => {
            if (child.child_id) {
                updatedChildren.push(child);
                receivedChildIds.push(child.child_id);
            } else {
                newChildren.push({ ...child, client_id });
            }
        });

        // Detect deleted children
        const deletedChildrenIds = existingChildIds.filter(id => !receivedChildIds.includes(id));

        // Insert new children
        if (newChildren.length > 0) {
            const { error: insertError } = await supabase.from("Childs").insert(newChildren);
            if (insertError) {
                console.error("Error inserting new children:", insertError);
                return false;
            }
            console.log("New children inserted:", newChildren);
        }

        // Update existing children
        for (const child of updatedChildren) {
            const { error: updateError } = await supabase
                .from("Childs")
                .update(child)
                .eq("child_id", child.child_id);

            if (updateError) {
                console.error(`Error updating child ${child.child_id}:`, updateError);
                return false;
            }
        }
        console.log("Existing children updated:", updatedChildren);

        // Delete removed children
        if (deletedChildrenIds.length > 0) {
            const { error: deleteError } = await supabase
                .from("Childs")
                .delete()
                .in("child_id", deletedChildrenIds);

            if (deleteError) {
                console.error("Error deleting children:", deleteError);
                return false;
            }
            console.log("Children deleted:", deletedChildrenIds);
        }

        // Gets updated children again after modifications
        const { data: updatedChildrenList, error: fetchUpdatedChildrenError } = await supabase
        .from("Childs")
        .select("*")
        .eq("client_id", client_id);

        if (fetchUpdatedChildrenError) {
        console.error("Error fetching updated children:", fetchUpdatedChildrenError);
        return false;
        }

        // ChildrenData status updated
        setChildrenData(updatedChildrenList);

        return true;
    } catch (error) {
        console.error("Unexpected error in handleChildrenUpdate:", error);
        return false;
    }
};

function FullIntakeForm({client_id}){
    const [originalData, setOriginalData] = useState(null);
    const [childrenData, setChildrenData] = useState([]); // State for children
    const [notesData, setNotesData] = useState([]); // State for case notes
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false); // state to enable/disable fields
    const [formSent, setFormSent] = useState(false);

    const [selectedNote, setSelectedNote] = useState(null);
    const [showNewNoteForm, setShowNewNoteForm] = useState(false);


    const handleShowNoteDetails = (note) => {
        setSelectedNote(note); // Save the selected note
    };

    const handleCloseNoteDetails = () => {
        setSelectedNote(null); // Close the note details
    };

    const handleAddNoteClick = (values, push) => {
        const newNote = {
            client_id: client_id,
            type: values.type || "General",  // Default value
            subType: values.subType || "Uncategorized",
            description: values.description?.trim() || "No description provided",
            actionPlan: values.actionPlan?.trim() || "No action plan provided", // Avoid empty values
            advocate_id: "19",
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        };

        // setFieldValue("notes", [...values.notes, newNote]); // Add the new note to the Formik array
        push(newNote);
        setShowNewNoteForm(true);
        console.log("New note added:", newNote);
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
                .single();

            if (clientError) {
                console.error("Error fetching client data:", clientError.message || clientError);
            } else {
                setOriginalData(clientData);
                console.log("Original data:", clientData);
            }

            // Gets the children associated with the client
            const { data: children, error: childrenError } = await supabase
                .from("Childs")
                .select("*")
                .eq("client_id", client_id);

            if (childrenError) {
                console.error("Error fetching children data:", childrenError.message || childrenError);
            } else {
                console.log("Children Data:", children);
                setChildrenData(children || []);
            }

            // Gets the case notes associated with the client
            const {data: notes, error: notesError} = await supabase
                .from("Notes")
                .select("*")
                .eq("client_id", client_id );

            if (notesError){
                console.error("Error fetching notes data:", notesError.message || notesError);
            }else {
                console.log("Notes Data:", notes);
                setNotesData(notes || []);
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
                initialValues={
                    {
                        firstName:originalData?.firstName || "",
                        middleName:originalData?.middleName || "",
                        lastName:originalData?.lastName || "",
                        dateOfBirth: originalData?.dateOfBirth ? originalData.dateOfBirth.split("T")[0] : "",
                        phoneNumber:originalData?.phoneNumber || "",
                        address: originalData?.address || "",
                        city: originalData?.city || "",
                        province: originalData?.province || "",
                        postalCode: originalData?.postalCode || "",
                        email: originalData?.email || "",
                        // emergencyContactFirstName: "",
                        // emergencyContactLastName: "",
                        // emergencyContactNumber: "",
                        // referredBy: "",
                        relationshipToChildren: originalData?.relationshipToChildren || "",
                        // otherAdultsInvolved: originalData?.otherAdultsInvolved === true ? "yes" : originalData?.otherAdultsInvolved === false ? "no" : "",
                        otherAdultsInvolved: originalData?.otherAdultsInvolved ? "yes" : (originalData?.otherAdultsInvolved === false ? "no" : ""),
                        otherAdultsInvolvedExplained: originalData?.otherAdultsInvolvedExplained || "",
                        firstNationMembership: originalData?.firstNationMembership || "",
                        treatyNumber: originalData?.treatyNumber || "",
                        otherFirstNation: originalData?.otherFirstNation || "",
                        ninePersonalHealthNumber: originalData?.ninePersonalHealthNumber || "",
                        sixPersonalHealthNumber: originalData?.sixPersonalHealthNumber || "",
                        // onReserve: clientData?.onReserve || "",
                        onReserve: originalData?.onReserve === true ? "yes" : originalData?.onReserve === false ? "no" : "",
                        // transitionFromReserve: clientData?.transitionFromReserve || "",
                        transitionFromReserve: originalData?.transitionFromReserve === true ? "yes" : originalData?.transitionFromReserve === false ? "no" : "",
                        // previousFNFAOClient: clientData?.previousFNFAOClient || "",
                        previousFNFAOClient: originalData?.previousFNFAOClient === true ? "yes" : originalData?.previousFNFAOClient === false ? "no" : "",
                        // seekingAdvocacy: "",
                        // cfsAgency: "",
                        // cfsAgentFullName: "",
                        // cfsAgentNumber: "",
                        // cfsAgentEmail: "",
                        // statusCFSFile: "",
                        // visitsChild:'no',
                        visitsChildFrequency: originalData?.visitsChildFrequency || "",
                        casePlanCopy: originalData?.casePlanCopy === true ? "yes" : originalData?.casePlanCopy === false ? "no" : "",
                        casePlanCopyDescribe: originalData?.casePlanCopyDescribe || "",
                        // involvedCFSReason: "",
                        // prenatalSupport:clientData?.prenatalSupport || "",
                        prenatalSupport: originalData?.prenatalSupport === true ? "yes" : originalData?.prenatalSupport === false ? "no" : "",
                        prenatalSupportSpecified: originalData?.prenatalSupportSpecified || "",
                        // housingSupport:clientData?.housingSupport || "",
                        housingSupport: originalData?.housingSupport === true ? "yes" : originalData?.housingSupport === false ? "no" : "",
                        housingSupportSpecified: originalData?.housingSupportSpecified || "",
                        // addictionsSupport:clientData?.addictionsSupport || "",
                        addictionsSupport: originalData?.addictionsSupport === true ? "yes" : originalData?.addictionsSupport === false ? "no" : "",
                        addictionsSupportSpecified: originalData?.addictionsSupportSpecified || "",
                        // youthSupport:'no',
                        // youthSupportSpecified: "",
                        // custodySupport:'no',
                        // custodySupportSpecified: "",
                        // criminalCharges:'no',
                        // criminalChargesSpecified: "",
                        // activeWarrant:'no',
                        // activeWarrantSpecified: "",
                        // activeInvestigation:'no',
                        // activeInvestigationExplained: "",
                        // activeOrders:'no',
                        // activeOrdersExplained: "",
                        // currentLawyer:'yes',
                        // legalAssistance:'no',
                        // legalAssistanceSpecified: "",
                        // unableToAssistExplained: "",
                        // referForSupport : "",
                        martialStatus: originalData?.martialStatus || "",
                        dateModified : originalData?.dateModified ? originalData.dateModified.split("T")[0] : "",
                        modifiedBy: originalData?.modifiedBy || "",
                        createdAt: originalData?.createdAt ? originalData.createdAt.split("T")[0] : "",

                        FASD: Boolean(originalData?.FASD),
                        ADHD: Boolean(originalData?.ADHD),
                        PTSD: Boolean(originalData?.PTSD),
                        depression: Boolean(originalData?.depression),
                        cancerAutoimmuneCondition: Boolean(originalData?.cancerAutoimmuneCondition),
                        otherMentalCondition: Boolean(originalData?.otherMentalCondition),
                        otherMentalConditionExplained: originalData?.otherMentalConditionExplained || "",
                        diagnosedFollowingExplain:originalData?.diagnosedFollowingExplain || "",
                        negativeCopingSkills: originalData?.negativeCopingSkills ? "yes" : (originalData?.negativeCopingSkills === false ? "no" : ""),
                        negativeCopingSkillsExplain: originalData?.negativeCopingSkillsExplain || "",

                        drugsImpact: originalData?.drugsImpact || "",
                        lastTimeUsed: originalData?.lastTimeUsed || "",
                        educationalGoals: originalData?.educationalGoals ? "yes" : (originalData?.educationalGoals === false ? "no" : ""),
                        educationalGoalsExplained: originalData?.educationalGoalsExplained || "",
                        accessElder: originalData?.accessElder ? "yes" : (originalData?.accessElder === false ? "no" : ""),
                        accessElderExplained: originalData?.accessElderExplained || "",

                        childrenInCareDuration: originalData?.childrenInCareDuration || "",
                        cfsChildrenApprehesionReason: originalData?.cfsChildrenApprehesionReason || "",
                        kinship: originalData?.kinship ? "yes" : (originalData?.kinship === false ? "no" : ""),
                        kinshipExplained: originalData?.kinshipExplained || "",
                        anyConcerns: originalData?.anyConcerns || "",
                        prentativeSupport: originalData?.prentativeSupport ? "yes" : (originalData?.prentativeSupport === false ? "no" : ""),
                        privateAgreement: originalData?.privateAgreement ? "yes" : (originalData?.privateAgreement === false ? "no" : null), //asi para boleanos que esten nulos en la bd
                        privateAgreementExplained: originalData?.privateAgreementExplained || "",
                        previousInvolvement: originalData?.previousInvolvement ? "yes" : (originalData?.previousInvolvement === false ? "no" : null),
                        previousInvolvementExplain: originalData?.previousInvolvementExplain || "",
                        parentalCapacityDone: originalData?.parentalCapacityDone ? "yes" : (originalData?.parentalCapacityDone === false ? "no" : null),
                        parentalCapacity: originalData?.parentalCapacity || "",


                        // children: childrenData || [],
                        children: childrenData.length > 0 ? childrenData : [{}],
                        notes: notesData || [],
                        // family: []
                    }
                }
                enableReinitialize
                validate={(values) => {
                    let errors = {};

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

          if (!values.dateOfBirth) {
            errors.dateOfBirth = "Please select a birth date";
          } else {
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

          if (!values.phoneNumber) {
            errors.phoneNumber = "Please enter a phone number";
          }

          const addressRegex = /^[a-zA-Z0-9\s,.-]*$/;
          if (!values.address) {
            errors.address = "Please enter an address";
          } else if (!addressRegex.test(values.address)) {
            errors.address = "The address contains invalid characters";
          }

          if (!values.city) {
            errors.city = "Please enter a city";
          } else if (!/^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(values.city)) {
            errors.city = "The city can only contain letters and spaces";
          }

          if (!values.province) {
            errors.province = "Please select a province";
          }

          if (
            values.postalCode &&
            !/^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(values.postalCode)
          ) {
            errors.postalCode = "Invalid postal code format (e.g., A1A 1A1)";
          }

          if (!values.email) {
            errors.email = "Please enter an email";
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
            errors.email = "Invalid email format";
          }

                    // if (!values.emergencyContactFirstName) {
                    //     errors.emergencyContactFirstName = "Please provide an emergency contact first name.";
                    // }

                    // if (!values.emergencyContactLastName) {
                    //     errors.emergencyContactLastName = "Please provide an emergency contact last name.";
                    // }

                    // if (!values.emergencyContactNumber) {
                    //     errors.emergencyContactNumber = "Please provide an emergency contact phone.";
                    // }

                    // if (!values.relationshipToChildren) {
                    //     errors.relationshipToChildren = "Please provide a relationship with the child(ren).";
                    // }

                    // if (values.otherAdultsInvolved === true && !values.otherAdultsInvolvedExplained.trim()) {
                    //     errors.otherAdultsInvolvedExplained = "Please specify the other involved adult(s)";
                    // }

                    // if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.cfsAgentEmail)) {
                    //     errors.cfsAgentEmail = "Invalid email format";
                    // }

                    return errors;
                }}
                onSubmit={async (values, { resetForm }) => {
                    try {
                        console.log("Form submitted with values:", values);
                        console.log("onSubmit values.notes:", values);
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
                        const isNotesUnchanged = JSON.stringify(values.notes) === JSON.stringify(notesData);

                        if (isClientUnchanged && isChildrenUnchanged && isNotesUnchanged) {
                            console.warn("Warning: No changes detected, skipping update.");
                            setIsEditing(false);
                            return;
                        }

                        // ----------------
                        console.log("Updating Clients with values:", values);
                        const { children, notes, actionPlan, description, type, subType, advocate_id, ...clientValues } = values; // Extract 'children', 'notes', etc  and leave only the 'Clients' values

                        // console.log("Values before updating Clients:", JSON.stringify(clientValues, null, 2)); //quitar
                        // console.log("Updating client_id:", client_id);//quitar
                        // console.log("Children data before update:", JSON.stringify(values.children, null, 2)); //quitar
                        // console.log("Notes data before update:", JSON.stringify(values.notes, null, 2)); //quitar

                        // Add dateModified field with the current date and time
                        clientValues.dateModified = new Date().toISOString();

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
                            console.log("Update successful. Updated data:", data);

                            console.log("Updating Children with values:", values.children);

                            // Call `handle Children Update` to update the children in the database
                            const childrenUpdateSuccess = await handleChildrenUpdate(values.children, client_id, setChildrenData);
                            console.log("Children update result:", childrenUpdateSuccess);
                            if (!childrenUpdateSuccess) {
                                console.error("Error updating children data.");
                            }

                            // Call `handle Notes Update` to update the notes in the database
                            const notesUpdateSuccess = await handleNotesUpdate(values.notes, client_id, setNotesData);
                            console.log("Notes update result:", notesUpdateSuccess);
                            if (!notesUpdateSuccess){
                                console.error("Error update notes data.");
                            }

                            // UPDATE originalData with the new values
                            setOriginalData(data[0]);  // Use the data returned by Supabase

                            setShowNewNoteForm(false);
                            setIsEditing(false);
                            setFormSent(true);
                            resetForm({ values });
                            setTimeout(() => setFormSent(false), 3000);
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
                    <h2 className={styles.centeredTitle}>FULL-INTAKE FORM</h2>
                        <div >

                            <Row>
                                <Col md={7}><label htmlFor="createdAt"> <strong> Created At: </strong>
                                    <FormattedDate dateString={values.createdAt}/></label>
                                </Col>
                            </Row>
                            <Row  md={6}>
                                <Col md={8}><label htmlFor="dateModified"> <strong> Last Updated: </strong>
                                    <FormattedDate dateString={values.dateModified}/></label>
                                </Col>

                                <Col md={4}>
                                    <label><strong>Updated by:</strong></label>
                                    <div>{values.modifiedBy}</div>
                                </Col>
                            </Row>
                        </div>

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
                                        <Field type="number" id="phoneNumber" name="phoneNumber" disabled={!isEditing} />
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

                                        <Row className="mt-4">
                                            <Col md={4}>
                                                <FirstNationSelect name="firstNationMembership" label="First Nation Membership" error={errors.firstNationMembership} disabled={!isEditing} />
                                            </Col>
                                            <Col md={4}>
                                                <InputField name="treatyNumber" label="Treaty Number:" placeholder="" error={errors.treatyNumber} disabled={!isEditing} />
                                            </Col>
                                            <Col md={4}>
                                                <FirstNationSelect name="otherFirstnation" label="Other First Nation" error={errors.otherFirstnation} disabled={!isEditing}/>
                                            </Col>
                                        </Row>

                                        <Row className="mt-3">
                                            <Col md={4}>
                                                <label>Personal Health Identification Numbers (9-Digit):</label>
                                                <Field type="number" id="ninePersonalHealthNumber" placeholder="000000000" name="ninePersonalHealthNumber" disabled={!isEditing} />
                                                <ErrorMessage name="ninePersonalHealthNumber" component={() => <p className={styles.errorText}>{errors.ninePersonalHealthNumber}</p>} />
                                            </Col>
                                            <Col md={2}>
                                                <label>(6-Digit):</label>
                                                <Field type="number" id="sixPersonalHealthNumber" placeholder="000000" name="sixPersonalHealthNumber" disabled={!isEditing} />
                                                <ErrorMessage name="sixPersonalHealthNumber" component={() => <p className={styles.errorText}>{errors.sixPersonalHealthNumber}</p>} />
                                            </Col>
                                        </Row>


                                        <Row className="mt-3">
                                            <Col md={4}>
                                                <div>
                                                    <label>Are you living on or off reserve?  </label>
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
                                        <Row>
                                            <Col md={4}>
                                                <MartialStatusSelect name="martialStatus" label="Marital Status" error={errors.martialStatus} disabled={!isEditing} />
                                            </Col>
                                        </Row>
                                    </TabPanel>
                                    <TabPanel>
                                        {/* CFS Tab */}
                                        {childrenData.length === 0 ? (
                                            <p>No children found for this client.</p>
                                        ) : (
                                            <>
                                               {childrenData.length > 0 && (
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

                                                        {/* Body of the table with the data of each child */}
                                                        <tbody>
                                                            {childrenData.map((child) => (
                                                                <tr key={child.child_id}>
                                                                    <td>{child.childCfsAgency || "N/A"}</td>
                                                                    <td>{child.firstName} {child.lastName}</td>
                                                                    <td>{child.childCfsAgentFullName || "N/A"}</td>
                                                                    <td>{child.childStatusCfsFile || "N/A"}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}

                                            </>
                                        )}

                                        <Row className={styles.group}>
                                            <Col md={5}>
                                                <InputField
                                                    name="childrenInCareDuration"
                                                    label="How long have your children been in CFS care?"
                                                    type="number"  // Set the type to "number" to allow only numeric input
                                                    placeholder="Enter duration in years"  // Provide a placeholder for the input field
                                                    error={errors.childrenInCareDuration}  // Pass the error to display validation messages
                                                    disabled={!isEditing}  // Disable the input if not in editing mode
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
                                        {/* <Row className={styles.group}>
                                            <h4 className="text-dark">Family Members or Friends </h4>
                                            <Col md={8}>
                                                <div>
                                                    <label>Do you have any family members or friends that you can turn to for Kinship Care?</label>
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
                                                <Row className="mt-3">

                                                    <FieldArray name="family">
                                                    {({ push, remove }) => (
                                                        <div>
                                                        {values.family.map((member, index) => (
                                                            <div
                                                            key={index}
                                                            className={`${styles.bglightgrey} border rounded p-2 mb-3`}
                                                            >
                                                            <Row className="align-items-center">
                                                                <Col md={4}>
                                                                <InputField
                                                                    name={`family.${index}.firstName`}
                                                                    label="First Name:"
                                                                />
                                                                </Col>

                                                                <Col md={4}>
                                                                <InputField
                                                                    name={`family.${index}.lastName`}
                                                                    label="Last Name:"
                                                                />
                                                                </Col>

                                                                <Col md={4}>
                                                                <InputField
                                                                    name={`family.${index}.relationshipToClient`}
                                                                    label="Relationship:"
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
                                                            onClick={() =>
                                                            push({
                                                                firstName: "",
                                                                middleName: "",
                                                                lastName: "",
                                                                birthDate: "",
                                                                childNation: "",
                                                                childPlaced: "",
                                                                childCfsAgency: "",
                                                                childCfsAgentFullName: "",
                                                                childCfsAgentNumber: "",
                                                                childCfsAgentEmail: "",
                                                                childStatusCfsFile: "",
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
                                        </Row> */}
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
                                                    <Field as="textarea" name="kinshipExplained" className={styles.textarea} disabled={!isEditing} />
                                                    <ErrorMessage name="kinshipExplained" component="div" className={styles.errorText} />
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
                                                <Row className="mt-4 mb-3">
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



                                        {/* About your children */}
                                        <Row className="mb-3">
                                            <h6 className="text-dark">Children’s Information (List all children, including those at home or in care):</h6>

                                            <FieldArray name="children">
                                                {({ push, remove }) => (
                                                    <div>
                                                        {values.children
                                                            .sort((a, b) => a.child_id - b.child_id) // Sort children by ascending child_id
                                                            .map((child, index) => (
                                                            <div key={`${child.child_id}-${index}`} className={`${styles.bglightgrey} border rounded p-2 mb-3`} >
                                                                <Row className="mb-2">
                                                                    <Col>
                                                                        <h5>Child No. {index + 1} </h5>
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
                                                                <Row className="mb-4">
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
                                                                        <FirstNationSelect name={`children.${index}.childNation`} label="First Nation Membership" error={errors.childNation} disabled={!isEditing}/>
                                                                    </Col>
                                                                    <Col md={3}>
                                                                        <InputField name={`children.${index}.childPlaced`} label="Place of Stay:" disabled={!isEditing} />
                                                                    </Col>
                                                                </Row>

                                                                {/* Agency information */}
                                                                <div className="bg-light border border-light p-3 rounded">
                                                                    <Row className="mt-2">
                                                                        <h5 className="text-dark">Agency Information</h5>
                                                                        <Col md={4}>
                                                                            <InputField name={`children.${index}.childCfsAgency`} label="CFS Agency Name:" disabled={!isEditing} />
                                                                        </Col>
                                                                        <Col md={4}>
                                                                            <InputField name={`children.${index}.childCfsAgentFullName`} label="Agency Worker’s Full Name:" disabled={!isEditing} />
                                                                        </Col>
                                                                        <Col md={4}>
                                                                            <div>
                                                                                <label htmlFor={`children.${index}.childCfsAgentNumber`}>Phone Number:</label>
                                                                                <Field type="number" id={`children.${index}.childCfsAgentNumber`} name={`children.${index}.childCfsAgentNumber`} disabled={!isEditing} />
                                                                                <ErrorMessage
                                                                                    name={`children.${index}.childCfsAgentNumber`}
                                                                                    component={() => <p className={styles.errorText}>{errors.children?.[index]?.childCfsAgentNumber}</p>} />
                                                                            </div>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row>
                                                                        <Col md={4}>
                                                                            <div>
                                                                                <label htmlFor={`children.${index}.childCfsAgentEmail`}>Email:</label>
                                                                                <Field type="email" id={`children.${index}.childCfsAgentEmail`} name={`children.${index}.childCfsAgentEmail`} disabled={!isEditing} />
                                                                                <ErrorMessage
                                                                                    name={`children.${index}.childCfsAgentEmail`}
                                                                                    component={() => <p className={styles.errorText}>{errors.children?.[index]?.childCfsAgentEmail}</p>} />
                                                                            </div>
                                                                        </Col>
                                                                        <Col  md={4}>
                                                                            <StatusCFSFileSelect
                                                                                name={`children.${index}.childStatusCfsFile`}
                                                                                label="CFS File Status"
                                                                                error={errors.children?.[index]?.childStatusCfsFile}
                                                                                disabled={!isEditing}
                                                                                onChange={(e) => setFieldValue(`children.${index}.childStatusCfsFile`, e.target.value)}
                                                                                // onChange={(e) => {
                                                                                //     formik.setFieldValue(`children.${index}.childStatusCfsFile`, e.target.value);
                                                                                // }}
                                                                            />
                                                                        </Col>
                                                                    </Row>
                                                                </div>

                                                                {/* END Agency information */}

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
                                                                childPlaced: "",
                                                                childCfsAgency:"",
                                                                childCfsAgentFullName:"",
                                                                childCfsAgentNumber:"",
                                                                childCfsAgentEmail:"",
                                                                childStatusCfsFile:""
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
                                            <label>Have you ever been diagnosed with any of the following?</label>
                                        </Row>
                                        <Row className={styles.group}>
                                            <Col className={styles.checkboxContainer}>
                                                <Field
                                                    type="checkbox"
                                                    name="FASD"
                                                    checked={Boolean(values.FASD)}
                                                    onChange={(e) => setFieldValue("FASD", Boolean(e.target.checked))}
                                                    disabled={!isEditing}
                                                />
                                                <label htmlFor="FASD">FASD</label>
                                            </Col>
                                            <Col className={styles.checkboxContainer}>
                                                <Field
                                                    type="checkbox"
                                                    name="ADHD"
                                                    checked={Boolean(values.ADHD)}
                                                    onChange={(e) => setFieldValue("ADHD", Boolean(e.target.checked))}
                                                    disabled={!isEditing}
                                                />
                                                <label htmlFor="ADHD">ADHD</label>
                                            </Col>
                                            <Col className={styles.checkboxContainer}>
                                                <Field
                                                    type="checkbox"
                                                    name="PTSD"
                                                    checked={Boolean(values.PTSD)}
                                                    onChange={(e) => setFieldValue("PTSD", Boolean(e.target.checked))}
                                                    disabled={!isEditing}
                                                />
                                                <label htmlFor="PTSD">PTSD</label>
                                            </Col>
                                            <Col className={styles.checkboxContainer}>
                                                <Field
                                                    type="checkbox"
                                                    name="depression"
                                                    checked={Boolean(values.depression)}
                                                    onChange={(e) => setFieldValue("depression", Boolean(e.target.checked))}
                                                    disabled={!isEditing}
                                                />
                                                <label htmlFor="depression">Depression</label>
                                            </Col>
                                            <Col className={styles.checkboxContainer}>
                                                <Field
                                                    type="checkbox"
                                                    name="cancerAutoimmuneCondition"
                                                    checked={Boolean(values.cancerAutoimmuneCondition)}
                                                    onChange={(e) => setFieldValue("cancerAutoimmuneCondition", Boolean(e.target.checked))}
                                                    disabled={!isEditing}
                                                />
                                                <label htmlFor="cancerAutoimmuneCondition">Cancer Autoimmune Condition</label>
                                            </Col>
                                            <Col className={styles.checkboxContainer}>
                                                <Field
                                                    type="checkbox"
                                                    name="otherMentalCondition"
                                                    checked={Boolean(values.otherMentalCondition)}
                                                    onChange={(e) => setFieldValue("otherMentalCondition", Boolean(e.target.checked))}
                                                    disabled={!isEditing}
                                                />
                                                <label htmlFor="otherMentalCondition">Other Mental Health Condition</label>
                                            </Col>
                                        </Row>

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

                                        {/* Case Notes Tab */}

                                        {notesData.length === 0 ? (
                                            <p>No notes found for this client.</p>
                                        ) : (
                                            <>
                                                {/* Displays the notes table */}
                                                {!selectedNote && (
                                                    <table className="table table-striped table-bordered">
                                                        <thead className="table-dark">
                                                            <tr>
                                                                <th>Note ID</th>
                                                                <th>Created At</th>
                                                                <th>Type</th>
                                                                <th></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {[...notesData].sort((a, b) => a.note_id - b.note_id).map((note) => (
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
                                                            <Col md={8}>
                                                                <h5>Note ID: {selectedNote.note_id}</h5>
                                                            </Col>
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
                                                                >
                                                                    Close Note
                                                                </Button>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                )}

                                                {/* Show add new note details */}
                                                {!showNewNoteForm && (
                                                    // <Button onClick={() => handleAddNoteClick(values, setFieldValue)} disabled={!isEditing} >Add Note</Button>
                                                    <FieldArray name="notes">
                                                        {({ push }) => (
                                                            <Button onClick={() => handleAddNoteClick(values, push)} disabled={!isEditing}>
                                                                Add Note
                                                            </Button>
                                                        )}
                                                    </FieldArray>

                                                )}
                                                {showNewNoteForm && (
                                                    <div style={{ backgroundColor: "#dbdbdb", padding: "15px", borderRadius: "8px", border: "0.5px solid #ccc" }} >
                                                        {/* Separating line */}
                                                        {/* <hr className="my-3" /> */}
                                                        <h4>New Note</h4>
                                                        <Row>
                                                            <Col>
                                                                {/* <InputField name="treatyNumber" label="Treaty Number:" placeholder="" error={errors.treatyNumber} disabled={!isEditing} /> */}
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
                                        )}
                                    </TabPanel>
                                    <TabPanel>Tab panel Legal notes   </TabPanel>
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


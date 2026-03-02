"use client";
import supabase from "../../lib/supabase";
import { normalizeDates } from "./fetchClientData";
// Handles form updates
import { handleNotesUpdate } from "../../utils/notesUpdates";
import { handleFamilyUpdate }  from "../../utils/familyUpdates";
import { handleHomeMembersUpdate } from "../../utils/homeMebersUpdate";
import { handleEIAUpdate } from "../../utils/EIAUpdates";
import handleChildrenUpdate from "../childrenUpdate";

const FullIntakeFormSubmit = async (values, { resetForm }, userId, getToken, router, setFormSent, client_id, originalData, childrenData, familyData, homeMembersData, EIAData, notesData, setChildrenData, setFamilyData, setHomeMembersData, setEIAData, setNotesData, setOriginalData, setShowNewNoteForm, setIsEditing) => {
    try {
        const normalizeValue = (value) => {
            if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
                return value.slice(0, 10);
            }
            return value;
        };

        const formatLogValue = (value) => {
            if (value === null || value === undefined || value === "") return "N/A";
            if (typeof value === "boolean") return value ? "true" : "false";
            if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
                return value.slice(0, 10);
            }
            if (typeof value === "object") return JSON.stringify(value);
            return String(value);
        };

        const buildChangedFieldsDescription = (previous = {}, current = {}) => {
            const excludedFields = new Set(["dateModified", "createdAt"]);
            return Object.keys(current)
                .filter((field) => !excludedFields.has(field))
                .filter((field) => {
                    const prevVal = normalizeValue(previous?.[field] ?? null);
                    const currVal = normalizeValue(current?.[field] ?? null);
                    return JSON.stringify(prevVal) !== JSON.stringify(currVal);
                })
                .map((field) => `${field}: ${formatLogValue(previous?.[field])} → ${formatLogValue(current?.[field])}`);
        };

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
            setOriginalData(normalizeDates(data[0]));  // Use the data returned by Supabase

            // Insert a User Log entry for this update via API (bypasses RLS)
            const changedFields = buildChangedFieldsDescription(originalData, clientValues);
            const description = changedFields.length
                ? `Full intake updated. Changed fields:\n${changedFields.join("\n")}`
                : `Full intake updated for client_id: ${client_id}`;

            await fetch("/api/user-logs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    description,
                    logType: "UPDATE",
                    client_id,
                    clerkUserId: userId || null,
                }),
            });

            setShowNewNoteForm(false);
            setIsEditing(false);
            setFormSent(true);
            resetForm({ values });
            
            // Redirect to client list after successful update (like youth-intake form)
            setTimeout(() => {
                router.push(`/clients/${client_id}/view`);
            }, 1500);
        } else {
            console.warn("Warning: The update did not modify any data.");
        }

    } catch (err) {
        console.error("Unexpected error:", err);
    }
}

export default FullIntakeFormSubmit;
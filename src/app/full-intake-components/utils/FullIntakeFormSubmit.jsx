"use client";
import supabase from "../../lib/supabase";
import { normalizeDates } from "./fetchClientData";
// Handles form updates
import { handleNotesUpdate } from "../../utils/notesUpdates";
import { handleFamilyUpdate }  from "../../utils/familyUpdates";
import { handleHomeMembersUpdate } from "../../utils/homeMebersUpdate";
import { handleEIAUpdate } from "../../utils/EIAUpdates";
import handleChildrenUpdate from "../childrenUpdate";

const FullIntakeFormSubmit = async (values, { resetForm }, userId, router, showToast, client_id, originalData, childrenData, familyData, homeMembersData, EIAData, notesData, setChildrenData, setFamilyData, setHomeMembersData, setEIAData, setNotesData, setOriginalData, setShowNewNoteForm, setIsEditing) => {
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

        const buildNoteChangesDescription = (originalNotes = [], updatedNotes = []) => {
            const lines = [];
            const originalMap = new Map((originalNotes || []).map((n) => [n.note_id, n]));
            const updatedMap = new Map((updatedNotes || []).filter((n) => n.note_id).map((n) => [n.note_id, n]));

            // Added notes (no note_id yet)
            const added = (updatedNotes || []).filter((n) => !n.note_id);
            for (const n of added) {
                lines.push(`${n.noteType || "Case"} note added (type: ${n.type || "N/A"}, subType: ${n.subType || "N/A"})`);
            }

            // Updated notes
            for (const [id, orig] of originalMap.entries()) {
                const updated = updatedMap.get(id);
                if (!updated) continue;
                const noteChanges = [];
                for (const field of ["type", "subType", "description", "actionPlan"]) {
                    const prevVal = formatLogValue(orig[field]);
                    const currVal = formatLogValue(updated[field]);
                    if (prevVal !== currVal) {
                        noteChanges.push(`${field}: ${prevVal} → ${currVal}`);
                    }
                }
                if (noteChanges.length > 0) {
                    lines.push(`${orig.noteType || "Note"} note updated. Changed fields:\n  ${noteChanges.join("\n  ")}`);
                }
            }

            // Deleted notes
            const updatedIds = new Set((updatedNotes || []).filter((n) => n.note_id).map((n) => n.note_id));
            for (const [id, orig] of originalMap.entries()) {
                if (!updatedIds.has(id)) {
                    lines.push(`${orig.noteType || "Note"} note deleted (type: ${orig.type || "N/A"})`);
                }
            }

            return lines;
        };

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

        const { children, notes, actionPlan, description, type, subType, advocate_id, family, homeMembers, EIA, caseNotes, legalNotes, childMedicalNeeds, childMedicalNeedsExplained,  ...clientValues } = values; // Extract 'children', 'notes', etc  and leave only the 'Clients' values

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

        // Updates data via API route (uses service role key server-side, bypasses RLS)
        const updateRes = await fetch("/api/clients", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ client_id, clientValues }),
        });

        const updateResult = await updateRes.json();

        if (!updateRes.ok) {
            console.error("Error updating Clients data:", updateResult.error, updateResult.details);
            return;
        }

        const data = updateResult.data;

        // Confirm that the update was successful
        if (data && data.length > 0) {

            // Call all sub-updates in parallel — they are fully independent of each other
            const [childrenUpdateSuccess, familyUpdateSuccess, homeMemberUpdateSuccess, EIAUpdateSuccess, notesUpdateSuccess] = await Promise.all([
                handleChildrenUpdate(values.children, client_id, setChildrenData),
                handleFamilyUpdate(values.family, client_id, setFamilyData),
                handleHomeMembersUpdate(values.homeMembers, client_id, setHomeMembersData),
                handleEIAUpdate(values.EIA, client_id, setEIAData),
                handleNotesUpdate(values.notes, client_id, setNotesData, supabase, userId),
            ]);

            if (!childrenUpdateSuccess) console.error("Error updating children data.");
            if (!familyUpdateSuccess) console.error("Error updating family data.");
            if (!homeMemberUpdateSuccess) console.error("Error updating home members data.");
            if (!EIAUpdateSuccess) console.error("Error updating EIA data.");
            if (!notesUpdateSuccess) console.error("Error updating notes data.");

            // UPDATE originalData with the new values
            setOriginalData(normalizeDates(data[0]));  // Use the data returned by Supabase

            // Build log description
            const changedFields = buildChangedFieldsDescription(originalData, clientValues);
            const noteChanges = buildNoteChangesDescription(notesData, values.notes);
            const allChanges = [...changedFields, ...noteChanges];
            const description = allChanges.length
                ? `Full intake updated for client: ${values.firstName} ${values.lastName}. Changed fields:\n${allChanges.join("\n")}`
                : `Full intake updated for client: ${values.firstName} ${values.lastName}`;

            // Insert a User Log entry — fire and forget, no need to block redirect
            fetch("/api/user-logs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    description,
                    logType: "UPDATE",
                    client_id,
                    advocateId: userId || null,
                }),
            });

            setShowNewNoteForm(false);
            setIsEditing(false);
            showToast("success", "Adult client updated successfully!");
            resetForm({ values });

            // Redirect after toast is visible
            setTimeout(() => {
                router.push(`/adult-clients/${client_id}/view`);
            }, 500);
        } else {
            console.warn("Warning: The update did not modify any data.");
        }

    } catch (err) {
        console.error("Unexpected error:", err);
    }
}

export default FullIntakeFormSubmit;
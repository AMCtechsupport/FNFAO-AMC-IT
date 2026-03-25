"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import validator from "validator";
import supabase from "../../lib/supabase";
import youthIntakeDefaultValues from "./youthIntakeDefaultValues";
import { assignClientToAdvocate } from "../../../../components/assign-client-to-advocate";

// Function to get Manitoba current date/time 
const getManitobaDateTime = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Winnipeg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value;

  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = get("hour");
  const minute = get("minute");

  return `${year}-${month}-${day}T${hour}:${minute}`;
};

function sanitizeInput(input) {
  if (typeof input === "string") {
    return validator.escape(input.trim());
  }
  return input;
}

function sanitizeValues(values) {
  const sanitizedValues = {};
  for (let key in values) {
    sanitizedValues[key] = sanitizeInput(values[key]);
  }
  return sanitizedValues;
}

const YouthIntakeFormSubmit = async (values, {resetForm}, user, router, showToast, isEditMode, editClientId) => {
    try {
                const normalizeValue = (value) => {
                    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
                        return value.split("T")[0];
                    }
                    return value;
                };

                const formatLogValue = (value) => {
                    if (value === null || value === undefined || value === "") return "N/A";
                    if (typeof value === "boolean") return value ? "true" : "false";
                    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return value.split("T")[0];
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

        const sanitizedValues = sanitizeValues(values);

        const convertedValues = {};

        // Define which fields are radio buttons that need special handling
        const radioBooleanFields = [
        'inCare', 'onReserve', 'apprehendedOnReserve', 'transitionFromReserve',
        'inSchool', 'fullStudent', 'bankAccount', 'incomeAssistance',
        'youthJustice', 'accessElder', 'speakingOffice', 'youthWorkshops',
        'disabilities', 'connectedCommunity'
        ];

        // Loop through all fields in the 'values' object
        // to convert them from "yes/no" to true/false
        for (let key in sanitizedValues) {
        if (sanitizedValues[key] === "yes") {
            convertedValues[key] = true;
        } else if (sanitizedValues[key] === "no") {
            convertedValues[key] = false;
        } else if (radioBooleanFields.includes(key) && sanitizedValues[key] === "") {
            // Convert empty strings to null for radio button fields
            convertedValues[key] = null;
        } else {
            convertedValues[key] = sanitizedValues[key];
        }
        }

        // Debug: Log converted values to verify conversion
        console.log("🔍 DEBUG - Converted values for database:", convertedValues);

        // Get the current date in ISO 8601 format
        const currentDate = getManitobaDateTime();

        // Extract children, emergencyContact, homeMembers, educationalPersons
        const {
        emergencyContactFirstName,
        emergencyContactLastName,
        emergencyContactNumber,
        homeMembers,
        educationalPersons,
        selectedAdvocate,
        ...clientData
        } = convertedValues;

        let clientId;
        let changedFields = [];

        if (isEditMode && editClientId) {
        const { data: existingClientData } = await supabase
            .from("Clients")
            .select("*")
            .eq("client_id", editClientId)
            .single();

        // UPDATE existing client
        clientData.dateModified = currentDate;

        changedFields = buildChangedFieldsDescription(existingClientData || {}, clientData);

        const { error: clientError } = await supabase
            .from("Clients")
            .update(clientData)
            .eq("client_id", editClientId);

        if (clientError) {
            console.error("❌ Error updating client:");
            console.error("Message:", clientError.message || "No message");
            console.error("Details:", clientError.details || "No details");
            console.error("Code:", clientError.code || "No code");
            throw clientError;
        }

        clientId = editClientId;

        // Delete existing related data before inserting new ones
        await supabase.from("Home Members").delete().eq("client_id", clientId);
        await supabase.from("Educational Support Persons").delete().eq("client_id", clientId);
        await supabase.from("Emergency Contacts").delete().eq("client_id", clientId);

        } else {
        // CREATE new client
        clientData.createdAt = currentDate;
        clientData.dateModified = currentDate;
        clientData.clientType = "Youth Intake";

        // Debug: Log final client data being sent to database
        console.log("🔍 DEBUG - Final clientData for database:", clientData);

        const { data: client, error: clientError } = await supabase
            .from("Clients")
            .insert([
            {
                ...clientData,
                createdBy: user?.id ?? null,
            },
            ])
            .select();

        if (clientError) {
            console.error("❌ Error inserting client:");
            console.error("Message:", clientError.message || "No message");
            console.error("Details:", clientError.details || "No details");
            console.error("Code:", clientError.code || "No code");
            throw clientError;
        }

        clientId = client[0]?.client_id;
        if (!clientId) throw new Error("Failed to retrieve client ID.");
        }

        // If there are homeMembers, insert them into the 'Home Members' table
        if (homeMembers && homeMembers.length > 0) {
        const homeMembersData = homeMembers
            .filter((member) => member.firstName || member.lastName)
            .map((homeMember) => {
            const {
                firstName,
                middleName,
                lastName,
                relationship,
                phoneNumber,
                email,
            } = homeMember;
            return {
                firstName,
                middleName,
                lastName,
                relationship,
                phoneNumber,
                email,
                client_id: clientId, // Associate each home member with the client
            };
            });

        if (homeMembersData.length > 0) {
            const { error: homeMemberError } = await supabase
            .from("Home Members")
            .insert(homeMembersData);

            if (homeMemberError) {
            console.error("Error inserting home members:", homeMemberError);
            throw homeMemberError;
            }

            // console.log("Home Members inserted successfully:", homeMembersData);
        }
        }

        // For Educational Support Persons
        if (educationalPersons && educationalPersons.length > 0) {
        const educationalPersonsData = educationalPersons
            .filter((person) => person.firstName || person.lastName)
            .map((educationalPerson) => {
            const {
                firstName,
                middleName,
                lastName,
                relationship,
                phoneNumber,
                email,
            } = educationalPerson;
            return {
                firstName,
                middleName,
                lastName,
                relationship,
                phoneNumber,
                email,
                client_id: clientId,
            };
            });

        if (educationalPersonsData.length > 0) {
            const { error: educationalPersonsError } = await supabase
            .from("Educational Support Persons")
            .insert(educationalPersonsData);

            if (educationalPersonsError) {
            console.error(
                "Error inserting educational support person:",
                educationalPersonsError
            );
            throw educationalPersonsError;
            }

            // console.log(
            //   "Educational support persons inserted successfully:",
            //   educationalPersonsData
            // );
        }
        }

        // Insert emergency contact into the 'Emergency Contacts' table
        if (
        emergencyContactFirstName &&
        emergencyContactLastName &&
        emergencyContactNumber
        ) {
        const emergencyContactData = {
            firstName: emergencyContactFirstName,
            lastName: emergencyContactLastName,
            phoneNumber: emergencyContactNumber,
            note: "",
            client_id: clientId, // Associate emergency contact with the client
        };

        const { error: emergencyContactError } = await supabase
            .from("Emergency Contacts")
            .insert([emergencyContactData]);

        if (emergencyContactError) {
            console.error("❌ Error inserting emergency contact:");
            console.error(
            "Message:",
            emergencyContactError.message || "No message"
            );
            console.error(
            "Details:",
            emergencyContactError.details || "No details"
            );
            console.error("Code:", emergencyContactError.code || "No code");
            throw emergencyContactError;
        }

        // console.log(
        //   "Emergency contact inserted successfully:",
        //   emergencyContactData
        // );
        }

        // Insert a User Log entry for this submission via API (bypasses RLS)
        await fetch("/api/user-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: isEditMode
              ? changedFields.length
                ? `Youth intake updated for client: ${values.firstName} ${values.lastName}. Changed fields:\n${changedFields.join("\n")}`
                : `Youth intake updated for client: ${values.firstName} ${values.lastName}`
              : `Youth intake created for client: ${values.firstName} ${values.lastName}`,
            logType: isEditMode ? "UPDATE" : "INSERT",
            client_id: clientId,
            clerkUserId: user?.id || null,
          }),
        });

        // Assigns client to advocate who submit the form
        if (selectedAdvocate === "none") {
            updateClientStatus(clientId, "Inactive");
        } else {
            if (selectedAdvocate && selectedAdvocate.length > 0) {
            const { error: assignAdvocateError } = 
                assignClientToAdvocate(clientId, selectedAdvocate);
            if (assignAdvocateError) {
                throw assignAdvocateError;
            }}
        }

        // Reset form and show success message
        showToast("success", isEditMode ? "Youth client updated successfully" : "Youth Intake sent successfully");

        // Reset initialValues back to empty state
        resetForm(youthIntakeDefaultValues);

        // Handle post-submission behavior
        if (isEditMode) {
        // For edit mode, redirect to client list after successful update
        setTimeout(() => {
            router.push('/clients');
        }, 1500);
        }
    } catch (error) {
        console.error("General error:", error);
    }
}

export default YouthIntakeFormSubmit;
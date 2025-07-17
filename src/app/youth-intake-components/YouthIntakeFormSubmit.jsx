"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import validator from "validator";
import supabase from "../lib/supabase";
import youthIntakeDefaultValues from "./youthIntakeDefaultValues";

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

const YouthIntakeFormSubmit = async (values, {resetForm}, user, router, setFormSent, isEditMode, editClientId) => {
    try {
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
        const currentDate = new Date().toISOString();

        // Extract children, emergencyContact, homeMembers, educationalPersons
        const {
        emergencyContactFirstName,
        emergencyContactLastName,
        emergencyContactNumber,
        homeMembers,
        educationalPersons,
        ...clientData
        } = convertedValues;

        let clientId;

        if (isEditMode && editClientId) {
        // UPDATE existing client
        clientData.dateModified = currentDate;

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
                createdBy: user.id,
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
        //   "✅ Emergency contact inserted successfully:",
        //   emergencyContactData
        // );
        }

        // Reset form and show success message
        setFormSent(true);
        
        // Reset initialValues back to empty state
        resetForm(youthIntakeDefaultValues);
        
        // Handle post-submission behavior
        if (isEditMode) {
        // For edit mode, redirect to client list after successful update
        setTimeout(() => {
            router.push('/clients');
        }, 1500);
        } else {
        // For new submissions, show success message temporarily
        setTimeout(() => setFormSent(false), 3000);
        }
    } catch (error) {
        console.error("General error:", error);
    }
}

export default YouthIntakeFormSubmit;
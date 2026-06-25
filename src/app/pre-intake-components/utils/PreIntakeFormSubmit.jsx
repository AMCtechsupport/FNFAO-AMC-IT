import { useSession } from "next-auth/react";
import { assignClientToAdvocate } from "../../../../components/assign-client-to-advocate";
import { updateClientStatus } from "../../../../components/client-active";
import supabase from "../../lib/supabase";

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

const PreIntakeFormSubmit = (showToast) => {
    const { data: session } = useSession();
    const user = session?.user;
    const onSubmitPreIntake = async (values, { resetForm }) => {
        try {
            const convertedValues = {};

            // Loop through all fields in the 'values' object
            // to convert them from "yes/no" to true/false
            for (let key in values) {
                if (values[key] === "yes") {
                    convertedValues[key] = true;
                } else if (values[key] === "no") {
                    convertedValues[key] = false;
                } else if (
                    values[key] === "" ||
                    values[key] === undefined ||
                    values[key] === null
                ) {
                    convertedValues[key] = null; // Assigns null if nothing is selected
                } else {
                    convertedValues[key] = values[key];
                }
            }

            // Get Manitoba current date/time
            const currentDate = getManitobaDateTime();

            // Extract arrays from convertedValues; keep the rest as client data
            const {
                children,
                family,
                homeMembers,
                EIA,
                selectedAdvocate,
                ...clientData
            } = convertedValues;

            // Add date fields before inserting
            clientData.createdAt = currentDate;
            clientData.dateModified = currentDate;
            clientData.clientType = "Pre-Intake";
            // Set clientStatus to 'Inactive' if no advocate is assigned
            clientData.clientStatus = (!selectedAdvocate || selectedAdvocate === "none") ? "Inactive" : undefined;

            // Insert client data into the 'Clients' table
            const { data: client, error: clientError } = await supabase
                .from("Clients")
                .insert([
                    {
                        ...clientData,
                        createdBy: user?.advocateId ? String(user.advocateId) : null,
                    },
                ])
                .select();

            if (clientError) {
                throw clientError;
            }

            const clientRows = Array.isArray(client) ? client : client ? [client] : [];
            const clientId = clientRows[0]?.client_id;
            if (!clientId) throw new Error("Failed to retrieve client ID.");

            const listedChildren = (children || []).filter(
                (child) =>
                    (child?.firstName && child.firstName.trim()) ||
                    (child?.lastName && child.lastName.trim()) ||
                    child?.birthDate,
            );

            // If there are children, sanitize and insert them into the 'Childs' table
            if (listedChildren.length > 0) {
                const childrenToInsert = listedChildren.map((child) => {
                    const sanitized = { ...child };

                    // Convert childMedicalNeeds from string to boolean/null
                    if (sanitized.childMedicalNeeds === "yes") {
                        sanitized.childMedicalNeeds = true;
                    } else if (sanitized.childMedicalNeeds === "no") {
                        sanitized.childMedicalNeeds = false;
                    } else if (sanitized.childMedicalNeeds === "" || sanitized.childMedicalNeeds === null || sanitized.childMedicalNeeds === undefined) {
                        sanitized.childMedicalNeeds = null;
                    }

                    // Ensure phone number fields are null when empty
                    if (sanitized.childCfsAgentNumber === "" || sanitized.childCfsAgentNumber === undefined) {
                        sanitized.childCfsAgentNumber = null;
                    }
                    if (sanitized.childCfsSupervisorNumber === "" || sanitized.childCfsSupervisorNumber === undefined) {
                        sanitized.childCfsSupervisorNumber = null;
                    }

                    return { ...sanitized, client_id: clientId };
                });

                const { error: childrenError } = await supabase
                    .from("Childs")
                    .insert(childrenToInsert);

                if (childrenError) {
                    throw childrenError;
                }
            }

            // If there are family members, insert them into the 'Important Family and Friends' table
            if (family && family.length > 0) {
                const familyToInsert = family.map((m) => ({ ...m, client_id: clientId }));
                const { error: familyError } = await supabase
                    .from("Important Family and Friends")
                    .insert(familyToInsert);
                if (familyError) {
                    throw familyError;
                }
            }

            // If there are home members, insert them into the 'Home Members' table
            if (homeMembers && homeMembers.length > 0) {
                const homeToInsert = homeMembers.map((m) => ({ ...m, client_id: clientId }));
                const { error: homeError } = await supabase
                    .from("Home Members")
                    .insert(homeToInsert);
                if (homeError) {
                    throw homeError;
                }
            }

            // If there are EIA workers, insert them into the 'EIA Workers' table
            if (EIA && EIA.length > 0) {
                const eiaToInsert = EIA.map((m) => ({ ...m, client_id: clientId }));
                const { error: eiaError } = await supabase
                    .from("EIA Workers")
                    .insert(eiaToInsert);
                if (eiaError) {
                    throw eiaError;
                }
            }

            // Log the creation
            await fetch("/api/user-logs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    description: `Pre-intake created for client: ${values.firstName} ${values.lastName}`,
                    logType: "INSERT",
                    client_id: clientId,
                    advocateId: user?.advocateId || null,
                }),
            });

            // Assigns client to advocate who submit the form
            if (selectedAdvocate && selectedAdvocate.length > 0 && selectedAdvocate !== "none") {
                await assignClientToAdvocate(clientId, selectedAdvocate);
            }

            // Reset form and show success message
            showToast("success", "Pre-intake sent successfully");
            resetForm();
        } catch (error) {
            console.error("Error submitting pre-intake:", error);
            showToast(
                "error",
                error?.message || "Failed to submit pre-intake. Please try again.",
            );
        }

    };
    return { onSubmitPreIntake };
};

export default PreIntakeFormSubmit;

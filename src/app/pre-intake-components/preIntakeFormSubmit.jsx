import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import supabase from "../lib/supabase";

const PreIntakeFormSubmit = () => {
    const { user } = useUser();
    const [formSent, setFormSent] = useState(false);
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

            // Get the current date in ISO 8601 format
            const currentDate = new Date().toISOString();

            // Extract 'children', 'emergencyContactFirstName', 'emergencyContactLastName' and 'emergencyContactNumber'
            // from convertedValues and keep the rest as client data
            const {
            children,
            emergencyContactFirstName,
            emergencyContactLastName,
            emergencyContactNumber,
            ...clientData
            } = convertedValues;

            // Add date fields before inserting
            clientData.createdAt = currentDate;
            clientData.dateModified = currentDate;
            clientData.clientType = "Pre-Intake";

            // Insert client data into the 'Clients' table
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
            throw clientError;
            }

            // Get the inserted client's ID
            const clientId = client[0]?.client_id;
            if (!clientId) throw new Error("Failed to retrieve client ID.");

            // If there are children, insert them into the 'Childs' table
            if (children && children.length > 0) {
            const childrenData = children.map((child) => ({
                ...child,
                client_id: clientId, // Associate each child with the client
            }));

            const { error: childrenError } = await supabase
                .from("Childs")
                .insert(childrenData);

            if (childrenError) {
                throw childrenError;
            }
            }

            // Insert emergency contact into  the 'Emergency Contact' table
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
                throw emergencyContactError;
            }
            }

            // Reset form and show success message
            setFormSent(true);
            resetForm();
            setTimeout(() => setFormSent(false), 5000);
        } catch (error) {
        // Optionally, handle error reporting here
    }
    
};
    return { onSubmitPreIntake, formSent};
};

export default PreIntakeFormSubmit;
import supabase from "../lib/supabase";

// const {data, error} = await supabase.auth.getSession();
// console.log('Supabase session: ', data)

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
            // Sanitize child data before processing
            const sanitizedChild = { ...child };
            
            // Convert childMedicalNeeds from string to boolean/null
            if (sanitizedChild.childMedicalNeeds === "yes") {
                sanitizedChild.childMedicalNeeds = true;
            } else if (sanitizedChild.childMedicalNeeds === "no") {
                sanitizedChild.childMedicalNeeds = false;
            } else if (sanitizedChild.childMedicalNeeds === "" || sanitizedChild.childMedicalNeeds === null || sanitizedChild.childMedicalNeeds === undefined) {
                sanitizedChild.childMedicalNeeds = null;
            }

            // Ensure phone number fields are properly formatted or null
            if (sanitizedChild.childCfsAgentNumber === "" || sanitizedChild.childCfsAgentNumber === undefined) {
                sanitizedChild.childCfsAgentNumber = null;
            }
            if (sanitizedChild.childCfsSupervisorNumber === "" || sanitizedChild.childCfsSupervisorNumber === undefined) {
                sanitizedChild.childCfsSupervisorNumber = null;
            }

            // Remove any undefined fields
            Object.keys(sanitizedChild).forEach(key => {
                if (sanitizedChild[key] === undefined) {
                    sanitizedChild[key] = null;
                }
            });

            if (sanitizedChild.child_id) {
                updatedChildren.push(sanitizedChild);
                receivedChildIds.push(sanitizedChild.child_id);
            } else {
                newChildren.push({ ...sanitizedChild, client_id });
            }
        });

        // Detect deleted children
        const deletedChildrenIds = existingChildIds.filter(id => !receivedChildIds.includes(id));

        // Insert new children with better error logging
        if (newChildren.length > 0) {
            console.log("🔍 Attempting to insert new children:", JSON.stringify(newChildren, null, 2));
            
            const { data: insertedData, error: insertError } = await supabase
                .from("Childs")
                .insert(newChildren)
                .select();
            
            if (insertError) {
                console.error("❌ Detailed error inserting new children:");
                console.error("Error message:", insertError.message || "No message");
                console.error("Error details:", insertError.details || "No details");
                console.error("Error hint:", insertError.hint || "No hint");
                console.error("Error code:", insertError.code || "No code");
                console.error("Full error object:", JSON.stringify(insertError, null, 2));
                console.error("Data being inserted:", JSON.stringify(newChildren, null, 2));
                return false;
            }
            console.log("✅ New children inserted successfully:", insertedData);
        }

        // Update existing children
        for (const child of updatedChildren) {
            const { error: updateError } = await supabase
                .from("Childs")
                .update(child)
                .eq("child_id", child.child_id);

            if (updateError) {
                console.error("❌ Detailed error updating child:", child.child_id);
                console.error("Error message:", updateError.message || "No message");
                console.error("Error details:", updateError.details || "No details");
                console.error("Error hint:", updateError.hint || "No hint");
                console.error("Error code:", updateError.code || "No code");
                console.error("Full error object:", JSON.stringify(updateError, null, 2));
                console.error("Data being updated:", JSON.stringify(child, null, 2));
                return false;
            }
        }
        console.log("✅ Existing children updated:", updatedChildren.length, "children");

        // Delete removed children
        if (deletedChildrenIds.length > 0) {
            const { error: deleteError } = await supabase
                .from("Childs")
                .delete()
                .in("child_id", deletedChildrenIds);

            if (deleteError) {
                console.error("❌ Detailed error deleting children:");
                console.error("Error message:", deleteError.message || "No message");
                console.error("Error details:", deleteError.details || "No details");
                console.error("Error hint:", deleteError.hint || "No hint");
                console.error("Error code:", deleteError.code || "No code");
                console.error("Full error object:", JSON.stringify(deleteError, null, 2));
                console.error("Child IDs being deleted:", deletedChildrenIds);
                return false;
            }
            console.log("✅ Children deleted:", deletedChildrenIds);
        }

        // Gets updated children again after modifications
        const { data: updatedChildrenList, error: fetchUpdatedChildrenError } = await supabase
        .from("Childs")
        .select("*")
        .eq("client_id", client_id);

        if (fetchUpdatedChildrenError) {
            console.error("❌ Error fetching updated children:", fetchUpdatedChildrenError);
            return false;
        }

        // ChildrenData status updated
        setChildrenData(updatedChildrenList);

        return true;
    } catch (error) {
        console.error("❌ Unexpected error in handleChildrenUpdate:", error);
        return false;
    }
};

export default handleChildrenUpdate;
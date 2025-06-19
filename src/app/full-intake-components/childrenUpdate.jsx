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

export default handleChildrenUpdate;
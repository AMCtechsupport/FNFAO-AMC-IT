import supabase from "../lib/supabase";

export async function handleEIAUpdate (EIA, client_id, setEIAData ){
    try {
        // Gets the current EIA in the database
        const { data: existingEIA, error: fetchError } = await supabase
            .from("EIA Workers")
            .select("*")
            .eq("client_id", client_id);

        if (fetchError) {
            console.error("Error fetching existing EIA: ", fetchError);
            return false;
        }

        console.log("Existing EIA in DB:", existingEIA); // quitar

        const existingEIAIds = existingEIA.map(member => member.EIA_worker_id); // Extracts EIA_worker_id from existingEIA
        const newMember = [];
        const updatedMembers = [];
        const receivedMembersIds = [];

        EIA.forEach(member => {
            if (member.EIA_worker_id) {
                updatedMembers.push(member);
                receivedMembersIds.push(member.EIA_worker_id);
            } else {
                newMember.push({ ...member, client_id });
            }
        });

        // Detect deleted members
        const deletedMembersIds = existingEIAIds.filter(id => !receivedMembersIds.includes(id));
        console.log("Datos EIA a insertar en la BD:", JSON.stringify(newMember, null, 2));

        // Insert new member
        if (newMember.length > 0) {
            const { error: insertError } = await supabase.from("EIA Workers").insert(newMember);
            if (insertError) {
                console.error("Error inserting new member:", insertError);
                return false;
            }
            console.log("New member inserted:", newMember);
        }

        // Update existing members
        for (const member of updatedMembers) {
            const { error: updateError } = await supabase
                .from("EIA Workers")
                .update(member)
                .eq("EIA_worker_id", member.EIA_worker_id);

            if (updateError) {
                console.error(`Error updating member ${member.EIA_worker_id}:`, updateError);
                return false;
            }
        }
        console.log("Existing member updated:", updatedMembers);

        // Filter invalid IDs before deleting
        const validDeletedMembersIds = deletedMembersIds.filter(id => Number.isInteger(id));

        // Delete removed members
        if (validDeletedMembersIds.length > 0) {
            console.log("Attempting to delete members:", validDeletedMembersIds);

            const { data, error: deleteError } = await supabase
                .from("EIA Workers")
                .delete()
                .in("EIA_worker_id", validDeletedMembersIds)
                // .select();  // <- Agregado para devolver los registros eliminados quitar

            if (deleteError) {
                console.error("Error deleting EIA member:", deleteError.message || deleteError);
                return false;
            }

            console.log("Members deleted successfully:", data);
        } else {
            console.log("No members to delete.");
        }

        // Gets updated member again after modifications
        const { data: updatedMemberList, error: fetchUpdatedMembersError } = await supabase
        .from("EIA Workers")
        .select("*")
        .eq("client_id", client_id);

        if (fetchUpdatedMembersError) {
            console.error("Error fetching updated member:", fetchUpdatedMembersError);
        return false;
        }

        // console.log("Lista actualizada después de eliminar:", updatedMemberList);

        // EIAData status updated
        setEIAData(updatedMemberList);

        return true;
    } catch (error) {
        console.error("Unexpected error in handleEIAUpdate:", error);
        return false;
    }
};
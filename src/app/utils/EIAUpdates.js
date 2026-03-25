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

        // Insert new member
        if (newMember.length > 0) {
            const { error: insertError } = await supabase.from("EIA Workers").insert(newMember);
            if (insertError) {
                console.error("Error inserting new member:", insertError);
                return false;
            }
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

        // Filter invalid IDs before deleting
        const validDeletedMembersIds = deletedMembersIds.filter(id => Number.isInteger(id));

        // Delete removed members
        if (validDeletedMembersIds.length > 0) {

            const { data, error: deleteError } = await supabase
                .from("EIA Workers")
                .delete()
                .in("EIA_worker_id", validDeletedMembersIds)
                // .select();  // <- Agregado para devolver los registros eliminados quitar

            if (deleteError) {
                console.error("Error deleting EIA member:", deleteError.message || deleteError);
                return false;
            }
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

        // EIAData status updated
        setEIAData(updatedMemberList);

        return true;
    } catch (error) {
        console.error("Unexpected error in handleEIAUpdate:", error);
        return false;
    }
};
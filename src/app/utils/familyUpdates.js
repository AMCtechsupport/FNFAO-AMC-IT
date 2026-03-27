import supabase from "../lib/supabase";

export async function handleFamilyUpdate (family, client_id, setFamilyData ){
    try {
        // Gets the current family in the database
        const { data: existingFamily, error: fetchError } = await supabase
            .from("Important Family and Friends")
            .select("*")
            .eq("client_id", client_id);

        if (fetchError) {
            console.error("Error fetching existing family: ", fetchError);
            return false;
        }

        const existingFamilyIds = existingFamily.map(member => member.family_and_friends_id); // Extracts family_and_friends_id from existingFamily
        const newMember = [];
        const updatedMembers = [];
        const receivedMembersIds = [];

        family.forEach(member => {
            if (member.family_and_friends_id) {
                updatedMembers.push(member);
                receivedMembersIds.push(member.family_and_friends_id);
            } else {
                newMember.push({ ...member, client_id });
            }
        });

        // Detect deleted members
        const deletedMembersIds = existingFamilyIds.filter(id => !receivedMembersIds.includes(id));

        // Insert new member
        if (newMember.length > 0) {
            const { error: insertError } = await supabase.from("Important Family and Friends").insert(newMember);
            if (insertError) {
                console.error("Error inserting new member:", insertError);
                return false;
            }
        }

        // Update existing members
        for (const member of updatedMembers) {
            const { error: updateError } = await supabase
                .from("Important Family and Friends")
                .update(member)
                .eq("family_and_friends_id", member.family_and_friends_id);

            if (updateError) {
                console.error(`Error updating member ${member.family_and_friends_id}:`, updateError);
                return false;
            }
        }

        // Filter invalid IDs before deleting
        const validDeletedMembersIds = deletedMembersIds.filter(id => Number.isInteger(id));

        // Delete removed members
        if (validDeletedMembersIds.length > 0) {

            const { data, error: deleteError } = await supabase
                .from("Important Family and Friends")
                .delete()
                .in("family_and_friends_id", validDeletedMembersIds)
                // .select();  // <- Agregado para devolver los registros eliminados quitar

            if (deleteError) {
                console.error("Error deleting member:", deleteError.message || deleteError);
                return false;
            }
        }

        // Gets updated member again after modifications
        const { data: updatedMemberList, error: fetchUpdatedMembersError } = await supabase
        .from("Important Family and Friends")
        .select("*")
        .eq("client_id", client_id);

        if (fetchUpdatedMembersError) {
            console.error("Error fetching updated member:", fetchUpdatedMembersError);
        return false;
        }

        // FamilyData status updated
        setFamilyData(updatedMemberList);

        return true;
    } catch (error) {
        console.error("Unexpected error in handleFamilyUpdate:", error);
        return false;
    }
};
import supabase from "../lib/supabase";

export async function handleHomeMembersUpdate (homeMenbers, client_id, setHomeMembersData ){
    try {
        // Gets the current homeMenbers in the database
        const { data: existingHomMembers, error: fetchError } = await supabase
            .from("Home Members")
            .select("*")
            .eq("client_id", client_id);

        if (fetchError) {
            console.error("Error fetching existing homeMenbers: ", fetchError);
            return false;
        }

        const existingHomeMembersIds = existingHomMembers.map(member => member.home_members_id); // Extracts home_members_id from existingHomMembers
        const newMember = [];
        const updatedMembers = [];
        const receivedMembersIds = [];

        homeMenbers.forEach(member => {
            if (member.home_members_id) {
                updatedMembers.push(member);
                receivedMembersIds.push(member.home_members_id);
            } else {
                newMember.push({ ...member, client_id });
            }
        });

        // Detect deleted members
        const deletedMembersIds = existingHomeMembersIds.filter(id => !receivedMembersIds.includes(id));

        // Insert new member
        if (newMember.length > 0) {
            const { error: insertError } = await supabase.from("Home Members").insert(newMember);
            if (insertError) {
                console.error("Error inserting new member:", insertError);
                return false;
            }
        }

        // Update existing members
        for (const member of updatedMembers) {
            const { error: updateError } = await supabase
                .from("Home Members")
                .update(member)
                .eq("home_members_id", member.home_members_id);

            if (updateError) {
                console.error(`Error updating member ${member.home_members_id}:`, updateError);
                return false;
            }
        }

        // Filter invalid IDs before deleting
        const validDeletedMembersIds = deletedMembersIds.filter(id => Number.isInteger(id));

        // Delete removed members
        if (validDeletedMembersIds.length > 0) {

            const { data, error: deleteError } = await supabase
                .from("Home Members")
                .delete()
                .in("home_members_id", validDeletedMembersIds)
                // .select();  // <- Agregado para devolver los registros eliminados quitar

            if (deleteError) {
                console.error("Error deleting member:", deleteError.message || deleteError);
                return false;
            }
        }

        // Gets updated member again after modifications
        const { data: updatedMemberList, error: fetchUpdatedMembersError } = await supabase
        .from("Home Members")
        .select("*")
        .eq("client_id", client_id);

        if (fetchUpdatedMembersError) {
            console.error("Error fetching updated member:", fetchUpdatedMembersError);
        return false;
        }

        // FamilyData status updated
        setHomeMembersData(updatedMemberList);

        return true;
    } catch (error) {
        console.error("Unexpected error in handleHomeMembersUpdate:", error);
        return false;
    }
};
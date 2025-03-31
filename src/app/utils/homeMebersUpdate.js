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

        console.log("Existing homeMenbers in DB:", existingHomMembers); // quitar

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
        console.log("Datos a insertar en la BD:", JSON.stringify(newMember, null, 2));


        // Insert new member
        if (newMember.length > 0) {
            const { error: insertError } = await supabase.from("Home Members").insert(newMember);
            if (insertError) {
                console.error("Error inserting new member:", insertError);
                return false;
            }
            console.log("New member inserted:", newMember);
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
        console.log("Existing member updated:", updatedMembers);

        // Filter invalid IDs before deleting
        const validDeletedMembersIds = deletedMembersIds.filter(id => Number.isInteger(id));
        // console.log("IDs a eliminar (antes de la eliminación):", validDeletedMembersIds);

        // Delete removed members
        if (validDeletedMembersIds.length > 0) {
            console.log("Attempting to delete members:", validDeletedMembersIds);

            const { data, error: deleteError } = await supabase
                .from("Home Members")
                .delete()
                .in("home_members_id", validDeletedMembersIds)
                // .select();  // <- Agregado para devolver los registros eliminados quitar

            if (deleteError) {
                console.error("Error deleting member:", deleteError.message || deleteError);
                return false;
            }

            console.log("Members deleted successfully:", data);
        } else {
            console.log("No members to delete.");
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

        // console.log("Lista actualizada después de eliminar:", updatedMemberList);

        // FamilyData status updated
        setHomeMembersData(updatedMemberList);

        return true;
    } catch (error) {
        console.error("Unexpected error in handleHomeMembersUpdate:", error);
        return false;
    }
};
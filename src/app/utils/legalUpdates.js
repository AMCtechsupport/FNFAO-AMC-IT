import supabase from "../lib/supabase";

export async function handleLegalUpdate (notes, client_id, setNotesData, noteType){
    try {
        // Gets the current notes in the database with the new noteType filter
        const { data: existingNotes, error: fetchError } = await supabase
            .from("Notes")
            .select("*")
            .eq("client_id", client_id)
            .eq("noteType", noteType); // <---- Filtro agregado

        if (fetchError) {
            console.error("Error fetching existing notes: ", fetchError);
            return false;
        }

        const existingNotesIds = existingNotes.map(note => note.note_id); // Extracts note_id from existingNotes
        const newNotes = [];
        const updatedNotes = [];
        const receivedNotesIds = [];

        notes.forEach(note => {
            if (note.note_id) {
                updatedNotes.push(note);
                receivedNotesIds.push(note.note_id);
            } else {
                newNotes.push({ ...note, client_id });
            }
        });

        // Detect deleted notes
        const deletedNotesIds = existingNotesIds.filter(id => !receivedNotesIds.includes(id));

        // Insert new note
        if (newNotes.length > 0) {
            const { error: insertError } = await supabase.from("Notes").insert(newNotes);
            if (insertError) {
                console.error("Error inserting new note:", insertError);
                return false;
            }
        }

        // Update existing notes
        for (const note of updatedNotes) {
            const { error: updateError } = await supabase
                .from("Notes")
                .update(note)
                .eq("note_id", note.note_id);

            if (updateError) {
                console.error(`Error updating note ${note.note_id}:`, updateError);
                return false;
            }
        }

        // Delete removed note
        if (deletedNotesIds.length > 0) {
            const { error: deleteError } = await supabase
                .from("Notes")
                .delete()
                .in("note_id", deletedNotesIds);

            if (deleteError) {
                console.error("Error deleting note:", deleteError);
                return false;
            }
        }

        // ------------------------
        // Gets updated note again after modifications
        const { data: updatedNotesList, error: fetchUpdatedNotesError } = await supabase
        .from("Notes")
        .select("*")
        .eq("client_id", client_id)
        .eq("noteType", noteType); // <---- Filtro agregado

        if (fetchUpdatedNotesError) {
            console.error("Error fetching updated note:", fetchUpdatedNotesError);
            return false;
        }

        // NotesData status updated
        setNotesData(updatedNotesList);

        return true;
    } catch (error) {
        console.error("Unexpected error in handleNotesUpdate:", error);
        return false;
    }
};

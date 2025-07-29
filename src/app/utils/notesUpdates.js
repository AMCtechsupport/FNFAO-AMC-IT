import supabase from "../lib/supabase";
import { v4 as uuidv4 } from 'uuid';
import { isValidUUID } from '../utils/isValidUUID';

export async function handleNotesUpdate (notes, client_id, setNotesData, supabase, userId){
    //const validUserId = isValidUUID(userId) ? userId : uuidv4();
    const cleanedUserId = userId.trim();  // Eliminar espacios

    console.log("userId dentro de handlenotesUpdate", cleanedUserId);
    console.log("📌 userId a guardar:", userId, typeof cleanedUserId);

    try {

        // supabase.auth.setAuth(token); //REQUIRED to use RLS with Clerk
        // const { data: user, error } = await supabase.auth.signIn({ token });

        // Gets the current notes in the database
        const { data: existingNotes, error: fetchError } = await supabase
            .from("Notes")
            .select("*")
            .eq("client_id", client_id);

        if (fetchError) {
            console.error("Error fetching existing notes: ", fetchError);
            return false;
        }

        console.log("Existing Notes in DB:", existingNotes); // quitar

        const existingNotesIds = existingNotes.map(note => note.note_id); // Extracts note_id from existingNotes
        const newNotes = [];
        const updatedNotes = [];
        const receivedNotesIds = [];

        for (const note of notes) {
            if (note.note_id) {
                updatedNotes.push(note);
                receivedNotesIds.push(note.note_id);
            } else {
                newNotes.push({ ...note, client_id });

                // If there is a file, we load it and record it in the Files table.
                if (note.file) {
                    const file = note.file;
                    const uniqueFilename = `${uuidv4()}-${file.name}`;
                    const filePath = `client_${client_id}/${uniqueFilename}`;

                    console.log("📎 Archivo seleccionado:", file);
                    console.log("🆔 Nombre de archivo único generado:", uniqueFilename);
                    console.log("📁 Ruta donde se subirá el archivo en Supabase Storage:", filePath);

                    const { data: uploadData, error: uploadError } = await supabase
                        .storage
                        .from("attachments")
                        .upload(filePath, file, { upsert: false });

                    if (uploadError) {
                        console.error("❌ Error subiendo archivo a Supabase Storage:", uploadError.message);
                        return false;
                    }

                    const publicUrl = supabase
                        .storage
                        .from("attachments")
                        .getPublicUrl(filePath).data.publicUrl;

                    note.file_url = publicUrl;
                    note.file_name = file.name;


                }
            }
        }//);

        // Detect deleted notes
        const deletedNotesIds = existingNotesIds.filter(id => !receivedNotesIds.includes(id));

        // Insert new note
        if (newNotes.length > 0) {
            const { error: insertError } = await supabase.from("Notes").insert(newNotes);
            if (insertError) {
                console.error("Error inserting new note:", insertError);
                return false;
            }
            console.log("New note inserted:", newNotes);
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
        console.log("Existing note updated:", updatedNotes);

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
            console.log("Note deleted:", deletedNotesIds);
        }

        // Gets updated note again after modifications
        const { data: updatedNotesList, error: fetchUpdatedNotesError } = await supabase
        .from("Notes")
        .select("*")
        .eq("client_id", client_id);

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

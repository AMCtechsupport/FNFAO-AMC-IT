import { v4 as uuidv4 } from 'uuid';
import { isValidUUID } from '../utils/isValidUUID';

export async function handleNotesUpdate (notes, client_id, setNotesData, supabaseClient, userId){
    //const validUserId = isValidUUID(userId) ? userId : uuidv4();
    const cleanedUserId = userId.trim();  // Eliminar espacios

    console.log("userId dentro de handlenotesUpdate", cleanedUserId);
    console.log("📌 userId a guardar:", userId, typeof cleanedUserId);

    try {

        // Gets the current notes in the database
        const { data: existingNotes, error: fetchError } = await supabaseClient
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
                // Ensure all required fields are present for new notes
                const newNote = { 
                    ...note, 
                    client_id,
                    advocate_id: 19, // Use numeric advocate_id instead of string
                    type: note.type || "General",
                    subType: note.subType || "Uncategorized", 
                    description: note.description || "No description provided",
                    actionPlan: note.actionPlan || "No action plan provided",
                    noteType: note.noteType ? (note.noteType.charAt(0).toUpperCase() + note.noteType.slice(1)) : "Case",
                    createdAt: note.createdAt || new Date().toISOString(),
                    modifiedAt: note.modifiedAt || new Date().toISOString()
                };
                
                console.log("🔍 Processing new note:", newNote);
                
                // Remove any fields that might not exist in the database
                // Only keep fields that we know exist in the Notes table
                const allowedFields = [
                    'client_id', 'advocate_id', 'type', 'subType', 'description', 
                    'actionPlan', 'noteType', 'createdAt', 'modifiedAt'
                ];
                
                // Clean the newNote object to only include allowed fields
                const cleanedNote = {};
                allowedFields.forEach(field => {
                    if (newNote[field] !== undefined) {
                        cleanedNote[field] = newNote[field];
                    }
                });
                
                // Add the file for processing, but it will be removed before database insertion
                if (newNote.file) {
                    cleanedNote.file = newNote.file;
                }
                
                // Replace newNote with cleanedNote
                Object.assign(newNote, cleanedNote);
                
                console.log("🧹 Cleaned note for database:", newNote);
                
                newNotes.push(newNote);
            }
        }//);

        // Detect deleted notes
        const deletedNotesIds = existingNotesIds.filter(id => !receivedNotesIds.includes(id));

        // Insert new notes and handle files with new system
        if (newNotes.length > 0) {
            // Process each new note individually to get note_id for file upload
            for (const noteWithFile of newNotes) {
                // Prepare note data for database (remove file field)
                const { file, ...cleanNote } = noteWithFile;
                
                console.log("🔍 Attempting to insert new note:", cleanNote);
                
                // Insert note and get the returned note_id
                const { data: insertData, error: insertError } = await supabaseClient
                    .from("Notes")
                    .insert([cleanNote])
                    .select(); // Return the inserted note with note_id
                
                if (insertError) {
                    console.error("❌ Error inserting new note:", insertError);
                    console.error("❌ Error details:", JSON.stringify(insertError, null, 2));
                    return false;
                }
                
                console.log("✅ New note inserted successfully:", insertData);
                
                // If there was a file, upload it using the new note_id
                if (file && insertData && insertData[0]) {
                    const noteId = insertData[0].note_id;
                    console.log("📎 Uploading file for note_id:", noteId);

                    try {
                        // Create FormData for API upload with noteId
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('clientId', client_id);
                        formData.append('noteId', noteId); // Use the new note_id

                        // Upload via API route
                        const response = await fetch('/api/upload-file', {
                            method: 'POST',
                            body: formData
                        });

                        const result = await response.json();

                        if (!response.ok || !result.success) {
                            console.error("❌ API upload failed:", result.error);
                            return false;
                        }

                        console.log("✅ File uploaded to new system path successfully:", result);
                        console.log("📄 File uploaded to:", result.file_path);

                    } catch (error) {
                        console.error("❌ Error uploading file via API:", error.message);
                        return false;
                    }
                }
            }
        }

        // Update existing notes
        for (const note of updatedNotes) {
            const { error: updateError } = await supabaseClient
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
            const { error: deleteError } = await supabaseClient
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
        const { data: updatedNotesList, error: fetchUpdatedNotesError } = await supabaseClient
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

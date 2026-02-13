import { v4 as uuidv4 } from "uuid";

export async function handleNotesUpdate(notes, client_id, setNotesData, supabase, userId) {
  const cleanedUserId = (userId || "").trim();

  try {
    // 1) Fetch existing notes for this client
    const { data: existingNotes, error: fetchError } = await supabase
      .from("Notes")
      .select("*")
      .eq("client_id", client_id);

    if (fetchError) {
      console.error("Error fetching existing notes:", fetchError.message, fetchError);
      return false;
    }

    const existingNotesIds = (existingNotes || []).map((n) => n.note_id);

    const newNotes = [];
    const updatedNotes = [];
    const receivedNotesIds = [];

    const isRealFile = (val) => typeof File !== "undefined" && val instanceof File;

    // Only remove UI-only fields (do NOT remove type/subType/etc.)
    const sanitizeNote = (obj) => {
      if (!obj || typeof obj !== "object") return obj;
      // eslint-disable-next-line no-unused-vars
      const { file, ...rest } = obj;
      return rest;
    };

    // Upload file to Storage, then create a Files row, return file_id
    const uploadAndCreateFileRow = async (file) => {
      const uniqueFilename = `${uuidv4()}-${file.name}`;
      const storagePath = `client_${client_id}/${uniqueFilename}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(storagePath, file, { upsert: false });

      if (uploadError) {
        console.error("Storage upload failed:", uploadError.message, uploadError);
        throw uploadError;
      }

      // Public URL (if bucket is public). If not public, storagePath is still stored.
      const publicUrl = supabase.storage.from("attachments").getPublicUrl(storagePath).data.publicUrl;

      // Insert into Files table
      const fileRow = {
        fileName: file.name,
        filePath: publicUrl || storagePath,
        uploadedAt: new Date().toISOString(),
        client_id: client_id,
        owner_id: cleanedUserId || null,
      };

      const { data: insertedFile, error: fileInsertError } = await supabase
        .from("Files")
        .insert(fileRow)
        .select("file_id")
        .single();

      if (fileInsertError) {
        console.error("Files INSERT failed:", fileInsertError.message, fileInsertError);
        throw fileInsertError;
      }

      return insertedFile.file_id;
    };

    // 2) Split incoming notes into new vs update
    for (const note of Array.isArray(notes) ? notes : []) {
      if (note.note_id) {
        updatedNotes.push(note);
        receivedNotesIds.push(note.note_id);
      } else {
        let file_id = note.file_id ?? null;

        // Only upload if it's an actual File object
        if (isRealFile(note.file)) {
          file_id = await uploadAndCreateFileRow(note.file);
        }

        // Build payload using YOUR Notes table columns
        const payload = sanitizeNote({
          client_id,
          advocate_id: note.advocate_id ?? note.advocateId ?? null,
          createdAt: note.createdAt ?? new Date().toISOString(),
          modifiedAt: note.modifiedAt ?? new Date().toISOString(),

          // IMPORTANT: your DB requires `type` NOT NULL
          type: note.type ?? note.noteType ?? note.note_type ?? "case",

          // Your DB uses `subType` (NOT noteSubtype)
          subType: note.subType ?? note.noteSubtype ?? note.sub_type ?? null,

          description: note.description ?? null,
          actionPlan: note.actionPlan ?? note.action_plan ?? null,

          file_id: file_id,
        });

        newNotes.push(payload);
      }
    }

    // 3) Find deleted notes
    const deletedNotesIds = existingNotesIds.filter((id) => !receivedNotesIds.includes(id));

    // 4) INSERT new notes (force type at final moment)
    if (newNotes.length > 0) {
      const notesToInsert = newNotes.map((n) => ({
        ...n,
        type: n.type ?? n.noteType ?? n.note_type ?? "case",
      }));

      console.log("FINAL notesToInsert:", JSON.stringify(notesToInsert, null, 2));
      console.log("FINAL type values:", notesToInsert.map((n) => n.type));

      const { data, error: insertError } = await supabase
        .from("Notes")
        .insert(notesToInsert)
        .select();

      if (insertError) {
        console.error("Notes INSERT failed:", insertError.message, insertError);
        console.error("code:", insertError.code);
        console.error("details:", insertError.details);
        console.error("hint:", insertError.hint);
        return false;
      }

      console.log("Inserted notes:", data);
    }

    // 5) UPDATE existing notes (force type too)
    for (const note of updatedNotes) {
      const note_id = note.note_id;
      if (!note_id) continue;

      let file_id = note.file_id ?? null;

      if (isRealFile(note.file)) {
        file_id = await uploadAndCreateFileRow(note.file);
      }

      const updatePayload = sanitizeNote({
        advocate_id: note.advocate_id ?? note.advocateId ?? null,
        modifiedAt: new Date().toISOString(),

        // Force required type
        type: note.type ?? note.noteType ?? note.note_type ?? "case",

        subType: note.subType ?? note.noteSubtype ?? note.sub_type ?? null,
        description: note.description ?? null,
        actionPlan: note.actionPlan ?? note.action_plan ?? null,

        file_id: file_id,
      });

      const { error: updateError } = await supabase
        .from("Notes")
        .update(updatePayload)
        .eq("note_id", note_id);

      if (updateError) {
        console.error(`Notes UPDATE failed for ${note_id}:`, updateError.message, updateError);
        console.error("code:", updateError.code);
        console.error("details:", updateError.details);
        console.error("hint:", updateError.hint);
        return false;
      }
    }

    // 6) DELETE removed notes
    if (deletedNotesIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("Notes")
        .delete()
        .in("note_id", deletedNotesIds);

      if (deleteError) {
        console.error("Notes DELETE failed:", deleteError.message, deleteError);
        return false;
      }
    }

    // 7) Refresh notes from DB
    const { data: updatedNotesList, error: fetchUpdatedError } = await supabase
      .from("Notes")
      .select("*")
      .eq("client_id", client_id);

    if (fetchUpdatedError) {
      console.error("Error fetching updated notes:", fetchUpdatedError.message, fetchUpdatedError);
      return false;
    }

    setNotesData(updatedNotesList);
    return true;
  } catch (err) {
    console.error("Unexpected error in handleNotesUpdate:", err?.message || err, err);
    return false;
  }
}

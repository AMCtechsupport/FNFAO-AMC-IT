import { v4 as uuidv4 } from "uuid";

export async function handleNotesUpdate(notes, client_id, setNotesData, supabase, userId) {
  const cleanedUserId = (userId || "").trim();

  try {
    // 1) Get existing notes for client
    const { data: existingNotes, error: fetchError } = await supabase
      .from("Notes")
      .select("note_id")
      .eq("client_id", client_id);

    if (fetchError) {
      console.error("Error fetching existing notes:", fetchError.message, fetchError);
      return false;
    }

    const existingIds = (existingNotes || []).map((n) => n.note_id);

    const newNotes = [];
    const updatedNotes = [];
    const receivedIds = [];

    const isRealFile = (val) => typeof File !== "undefined" && val instanceof File;

    const sanitize = (obj) => {
      if (!obj || typeof obj !== "object") return obj;
      // remove UI-only field
      // eslint-disable-next-line no-unused-vars
      const { file, ...rest } = obj;
      return rest;
    };

    // Upload file to storage + create Files row => returns file_id
    const uploadAndCreateFileRow = async (file) => {
      const uniqueFilename = `${uuidv4()}-${file.name}`;
      const storagePath = `client_${client_id}/${uniqueFilename}`;

      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(storagePath, file, { upsert: false });

      if (uploadError) {
        console.error("Storage upload failed:", uploadError.message, uploadError);
        throw uploadError;
      }

      // Create row in Files table
      const fileRowPayload = {
        fileName: file.name,
        filePath: storagePath,
        uploadedAt: new Date().toISOString(),
        client_id: client_id,
        owner_id: cleanedUserId || null,
      };

      const { data: fileRow, error: fileInsertError } = await supabase
        .from("Files")
        .insert(fileRowPayload)
        .select("file_id")
        .single();

      if (fileInsertError) {
        console.error("Files INSERT failed:", fileInsertError.message, fileInsertError);
        throw fileInsertError;
      }

      return fileRow?.file_id ?? null;
    };

    // Normalize noteType exactly how your UI tabs filter
    const normalizeNoteType = (val) => {
      const v = (val || "").toString().trim().toLowerCase();
      if (v === "case") return "Case";
      if (v === "legal") return "Legal";
      return val ? val.toString().trim() : null;
    };

    // Build payload strictly matching your Notes columns
    const buildPayload = (note, overrides = {}) => {
      const payload = {
        client_id: client_id,
        advocate_id: note?.advocate_id ?? note?.advocateId ?? null,

        // Important: your column names are createdAt + modifiedAt
        createdAt: note?.createdAt ?? new Date().toISOString(),
        modifiedAt: new Date().toISOString(),

        // IMPORTANT: type is NOT NULL in DB
        // UI uses "Type" dropdown -> store into `type`
        type: note?.type ?? note?.noteSubtype ?? null,

        // UI "Subtype" dropdown -> store into `subType`
        subType: note?.subType ?? note?.subtype ?? note?.noteSubType ?? null,

        // UI Description / Action Plan
        description: note?.description ?? null,
        actionPlan: note?.actionPlan ?? null,

        // Note category used for tabs (Case vs Legal)
        noteType: normalizeNoteType(note?.noteType),

        // Attachment foreign key
        file_id: note?.file_id ?? null,

        ...overrides,
      };

      return sanitize(payload);
    };

    // 2) Split incoming notes into NEW vs UPDATE
    for (const note of Array.isArray(notes) ? notes : []) {
      if (note?.note_id) {
        receivedIds.push(note.note_id);
        updatedNotes.push(note);
      } else {
        let file_id = note?.file_id ?? null;

        if (isRealFile(note?.file)) {
          file_id = await uploadAndCreateFileRow(note.file);
        }

        const insertPayload = buildPayload(note, { file_id });

        // Enforce required fields so UI + DB both work
        if (!insertPayload.type) {
          // If user didn’t select "Type", set a safe default that your UI already uses
          insertPayload.type = "initialMeeting";
        }

        // If noteType missing, default to Case so it appears in Case Notes tab
        if (!insertPayload.noteType) {
          insertPayload.noteType = "Case";
        }

        newNotes.push(insertPayload);
      }
    }

    // 3) Deleted notes
    const deletedIds = existingIds.filter((id) => !receivedIds.includes(id));

    // 4) INSERT new
    if (newNotes.length > 0) {
      const { error: insertError } = await supabase.from("Notes").insert(newNotes);
      if (insertError) {
        console.error("Notes INSERT failed:", insertError.message, insertError);
        return false;
      }
    }

    // 5) UPDATE existing
    for (const note of updatedNotes) {
      const note_id = note.note_id;
      if (!note_id) continue;

      let file_id = note?.file_id ?? null;

      if (isRealFile(note?.file)) {
        file_id = await uploadAndCreateFileRow(note.file);
      }

      const updatePayload = buildPayload(note, { file_id });

      if (!updatePayload.type) updatePayload.type = "initialMeeting";
      if (!updatePayload.noteType) updatePayload.noteType = "Case";

      const { error: updateError } = await supabase
        .from("Notes")
        .update(updatePayload)
        .eq("note_id", note_id);

      if (updateError) {
        console.error(`Notes UPDATE failed for ${note_id}:`, updateError.message, updateError);
        return false;
      }
    }

    // 6) DELETE removed
    if (deletedIds.length > 0) {
      const { error: deleteError } = await supabase.from("Notes").delete().in("note_id", deletedIds);
      if (deleteError) {
        console.error("Notes DELETE failed:", deleteError.message, deleteError);
        return false;
      }
    }

    // 7) REFRESH NOTES so UI shows newly created rows immediately
    const { data: refreshed, error: refreshError } = await supabase
      .from("Notes")
      .select("*")
      .eq("client_id", client_id)
      .order("createdAt", { ascending: false });

    if (refreshError) {
      console.error("Notes refresh failed:", refreshError.message, refreshError);
      return false;
    }

    setNotesData(Array.isArray(refreshed) ? refreshed : []);
    return true;
  } catch (err) {
    console.error("Unexpected error in handleNotesUpdate:", err?.message || err, err);
    return false;
  }
}

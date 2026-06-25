import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import supabase from "../../lib/supabase.server";
import { isSameCalendarDay } from "../../lib/note-edit-utils";
import { requireApiUser } from "../../lib/api-auth";

export async function GET(request) {
  const authResult = await requireApiUser();
  if (!authResult.ok) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const client_id = searchParams.get("client_id");

    if (!client_id) {
      return NextResponse.json({ error: "client_id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("Notes")
      .select(`
        *,
        author:Advocates!Notes_advocate_id_fkey(firstName, lastName),
        editor:Advocates!fk_modified_by_advocate(firstName, lastName),
        Files!file_id(fileName, filePath)
      `)
      .eq("client_id", client_id)
      .order("note_id", { ascending: true });

    if (error) {
      console.error("[/api/notes] Error fetching notes:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const notes = (data || []).map((note) => ({
      ...note,
      authorName: note.author
        ? `${note.author.firstName} ${note.author.lastName}`
        : null,
      editorName: note.editor
        ? `${note.editor.firstName} ${note.editor.lastName}`
        : null,
      fileName: note.Files?.fileName || null,
      filePath: note.Files?.filePath || null,
    }));

    return NextResponse.json({ notes });
  } catch (err) {
    console.error("[/api/notes] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const authResult = await requireApiUser();
  if (!authResult.ok) return authResult.response;

  try {
    const formData = await request.formData();
    const type = formData.get("type");
    const subType = formData.get("subType");
    const description = formData.get("description");
    const actionPlan = formData.get("actionPlan");
    const noteType = formData.get("noteType");
    const client_id = formData.get("client_id");
    const advocate_id = formData.get("advocate_id");
    const owner_id = formData.get("owner_id");
    const file = formData.get("file");

    if (!client_id) {
      return NextResponse.json({ error: "client_id is required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const normalizeNoteType = (val) => {
      const v = (val || "").toString().trim().toLowerCase();
      if (v === "case") return "Case";
      if (v === "legal") return "Legal";
      return val ? val.toString().trim() : "Case";
    };

    const insertPayload = {
      type: type || "general",
      subType: subType || null,
      description: description || null,
      actionPlan: actionPlan || null,
      noteType: normalizeNoteType(noteType),
      client_id,
      advocate_id: advocate_id || null,
      createdAt: now,
      modifiedAt: now,
    };

    if (file && file.size > 0) {
      const uniqueFilename = `${uuidv4()}-${file.name}`;
      const storagePath = `client_${client_id}/${uniqueFilename}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(storagePath, buffer, { contentType: file.type, upsert: false });

      if (uploadError) {
        console.error("[/api/notes POST] Storage upload failed:", uploadError);
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: fileRow, error: fileInsertError } = await supabase
        .from("Files")
        .insert({
          fileName: file.name,
          filePath: storagePath,
          uploadedAt: now,
          client_id: client_id || null,
          owner_id: owner_id || null,
        })
        .select("file_id")
        .single();

      if (fileInsertError) {
        console.error("[/api/notes POST] Files INSERT failed:", fileInsertError);
        return NextResponse.json({ error: fileInsertError.message }, { status: 500 });
      }

      insertPayload.file_id = fileRow?.file_id ?? null;
    }

    const { data: newNote, error: insertError } = await supabase
      .from("Notes")
      .insert(insertPayload)
      .select("note_id")
      .single();

    if (insertError) {
      console.error("[/api/notes POST] Insert failed:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, note_id: newNote.note_id });
  } catch (err) {
    console.error("[/api/notes POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const authResult = await requireApiUser();
  if (!authResult.ok) return authResult.response;

  try {
    const formData = await request.formData();
    const note_id = formData.get("note_id");
    const type = formData.get("type");
    const subType = formData.get("subType");
    const description = formData.get("description");
    const actionPlan = formData.get("actionPlan");
    const client_id = formData.get("client_id");
    const owner_id = formData.get("owner_id");
    const modified_by_advocate_id = formData.get("advocate_id"); // Editor's advocate_id
    const file = formData.get("file"); // File object or null

    if (!note_id) {
      return NextResponse.json({ error: "note_id is required" }, { status: 400 });
    }

    // Fetch existing note
    const { data: existingNote, error: fetchError } = await supabase
      .from("Notes")
      .select("createdAt")
      .eq("note_id", note_id)
      .single();

    if (fetchError || !existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (!isSameCalendarDay(existingNote.createdAt)) {
      return NextResponse.json(
        { error: "This note can only be edited on the day it was created." },
        { status: 403 },
      );
    }

    const modifiedAt = new Date().toISOString();
    const updatePayload = {
      type,
      subType,
      description,
      actionPlan,
      modifiedAt,
      modified_by_advocate_id: modified_by_advocate_id || null
    };

    // Handle optional file upload
    if (file && file.size > 0) {
      const uniqueFilename = `${uuidv4()}-${file.name}`;
      const storagePath = `client_${client_id}/${uniqueFilename}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(storagePath, buffer, { contentType: file.type, upsert: false });

      if (uploadError) {
        console.error("[/api/notes PATCH] Storage upload failed:", uploadError);
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: fileRow, error: fileInsertError } = await supabase
        .from("Files")
        .insert({
          fileName: file.name,
          filePath: storagePath,
          uploadedAt: new Date().toISOString(),
          client_id: client_id || null,
          owner_id: owner_id || null,
        })
        .select("file_id")
        .single();

      if (fileInsertError) {
        console.error("[/api/notes PATCH] Files INSERT failed:", fileInsertError);
        return NextResponse.json({ error: fileInsertError.message }, { status: 500 });
      }

      updatePayload.file_id = fileRow?.file_id ?? null;
    }

    const { error: updateError } = await supabase
      .from("Notes")
      .update(updatePayload)
      .eq("note_id", note_id);

    if (updateError) {
      console.error("[/api/notes PATCH] Update failed:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/notes PATCH] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}

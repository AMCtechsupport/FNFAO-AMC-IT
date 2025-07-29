import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create Supabase client with service role key (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// DELETE: 
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('noteId');
    const clientId = searchParams.get('clientId');

    if (!noteId) {
      return NextResponse.json(
        { error: 'noteId is required' }, 
        { status: 400 }
      );
    }

    console.log("🗑️ API: Deleting note:", noteId, "for client:", clientId);

    // Delete the note from database
    const { error: deleteError } = await supabaseAdmin
      .from('Notes')
      .delete()
      .eq('note_id', noteId);

    if (deleteError) {
      console.error("❌ API: Error deleting note:", deleteError);
      return NextResponse.json(
        { error: deleteError.message }, 
        { status: 500 }
      );
    }

    // If clientId is provided, also delete all files associated with this note
    if (clientId) {
      const noteFolderPath = `client_${clientId}/note_${noteId}`;
      
      // List all files in the note folder
      const { data: files, error: listError } = await supabaseAdmin
        .storage
        .from('attachments')
        .list(noteFolderPath, {
          limit: 100,
          offset: 0
        });

      if (!listError && files && files.length > 0) {
        // Delete all files in the note folder
        const filePaths = files.map(file => `${noteFolderPath}/${file.name}`);
        
        const { error: deleteFilesError } = await supabaseAdmin
          .storage
          .from('attachments')
          .remove(filePaths);

        if (deleteFilesError) {
          console.error("⚠️ API: Error deleting note files:", deleteFilesError);
          // Don't fail the entire operation if file deletion fails
        } else {
          console.log("✅ API: Note files deleted successfully");
        }
      }
    }

    console.log("✅ API: Note deleted successfully");

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error) {
    console.error("❌ API: Unexpected error:", error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 
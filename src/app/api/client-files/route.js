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

// Helper function to decode filename for display
function decodeFilename(fileName) {
  try {
    // Check if filename contains encoded characters (%)
    if (!fileName.includes('%')) {
      return fileName;
    }
    
    const decodedName = decodeURIComponent(fileName);
    
    // Look for timestamp pattern anywhere in the filename
    const timestampRegex = /-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)/;
    const match = decodedName.match(timestampRegex);
    
    if (match) {
      // Split at the timestamp and reconstruct
      const timestampIndex = decodedName.indexOf(match[1]);
      const beforeTimestamp = decodedName.substring(0, timestampIndex - 1); // -1 to remove the dash before timestamp
      const afterTimestamp = decodedName.substring(timestampIndex + match[1].length);
      
      // Reconstruct without timestamp
      const result = beforeTimestamp + afterTimestamp;
      return result;
    }
    
    // If no timestamp pattern found, return decoded name as is
    return decodedName;
    
  } catch (e) {
    console.warn("❌ Failed to decode filename:", fileName, e);
    return fileName;
  }
}

// GET: 
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const noteId = searchParams.get('noteId'); // Add noteId parameter
    const noteSpecificOnly = searchParams.get('noteSpecificOnly') === 'true';

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' }, 
        { status: 400 }
      );
    }

    console.log("📁 API: Getting files for client:", clientId, "note:", noteId, "noteSpecificOnly:", noteSpecificOnly);

    let allFiles = [];

    if (noteId) {
      // For specific note, check both note-specific folder AND general client folder
      
      // 1. Check note-specific folder first
      const noteFolderPath = `client_${clientId}/note_${noteId}`;
      const { data: noteFiles, error: noteListError } = await supabaseAdmin
        .storage
        .from('attachments')
        .list(noteFolderPath, {
          limit: 100,
          offset: 0
        });

      if (!noteListError && noteFiles) {
        const noteFilesWithUrls = noteFiles.map(file => {
          const filePath = `client_${clientId}/note_${noteId}/${file.name}`;
          const publicUrl = supabaseAdmin
            .storage
            .from('attachments')
            .getPublicUrl(filePath).data.publicUrl;
          
          // Decode filename for display (handle encoded Chinese characters)
          const displayName = decodeFilename(file.name);
          
          return {
            name: displayName,
            path: filePath,
            size: file.metadata?.size || 0,
            created_at: file.created_at,
            updated_at: file.updated_at,
            url: publicUrl,
            source: 'note_specific'
          };
        });
        allFiles.push(...noteFilesWithUrls);
      }

      // 2. Also check general client folder for legacy files (only if not noteSpecificOnly)
      if (!noteSpecificOnly) {
        const clientFolderPath = `client_${clientId}`;
        const { data: clientFiles, error: clientListError } = await supabaseAdmin
          .storage
          .from('attachments')
          .list(clientFolderPath, {
            limit: 100,
            offset: 0
          });

      if (!clientListError && clientFiles) {
        const clientFilesWithUrls = clientFiles
          .filter(file => !file.name.startsWith('note_')) // Exclude note folders
          .map(file => {
            const filePath = `client_${clientId}/${file.name}`;
            const publicUrl = supabaseAdmin
              .storage
              .from('attachments')
              .getPublicUrl(filePath).data.publicUrl;
            
            // Decode filename for display (handle encoded Chinese characters)
            const displayName = decodeFilename(file.name);
            
            return {
              name: displayName,
              path: filePath,
              size: file.metadata?.size || 0,
              created_at: file.created_at,
              updated_at: file.updated_at,
              url: publicUrl,
              source: 'legacy'
            };
          });
        allFiles.push(...clientFilesWithUrls);
      }
    } // Close noteSpecificOnly condition

    } else {
      // For general client files, just get from client folder
      const folderPath = `client_${clientId}`;
      const { data: files, error: listError } = await supabaseAdmin
        .storage
        .from('attachments')
        .list(folderPath, {
          limit: 100,
          offset: 0
        });

      if (listError) {
        console.error("❌ API: Error listing files:", listError);
        return NextResponse.json(
          { error: listError.message }, 
          { status: 500 }
        );
      }

      const filesWithUrls = files?.map(file => {
        const filePath = `client_${clientId}/${file.name}`;
        const publicUrl = supabaseAdmin
          .storage
          .from('attachments')
          .getPublicUrl(filePath).data.publicUrl;
        
        // Decode filename for display (handle encoded Chinese characters)
        const displayName = decodeFilename(file.name);
        
        return {
          name: displayName,
          path: filePath,
          size: file.metadata?.size || 0,
          created_at: file.created_at,
          updated_at: file.updated_at,
          url: publicUrl,
          source: 'general'
        };
      }) || [];
      
      allFiles = filesWithUrls;
    }

    console.log("✅ API: Found files:", allFiles.length);
    console.log("📄 API: File types:", allFiles.map(f => ({ 
      name: f.name, 
      ext: f.name.split('.').pop().toLowerCase(),
      source: f.source
    })));

    return NextResponse.json({
      success: true,
      files: allFiles
    });

  } catch (error) {
    console.error("❌ API: Unexpected error:", error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// DELETE:
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');

    if (!filePath) {
      return NextResponse.json(
        { error: 'filePath is required' }, 
        { status: 400 }
      );
    }

    console.log("🗑️ API: Deleting file:", filePath);

    // Delete file from storage
    const { error: deleteError } = await supabaseAdmin
      .storage
      .from('attachments')
      .remove([filePath]);

    if (deleteError) {
      console.error("❌ API: Error deleting file:", deleteError);
      return NextResponse.json(
        { error: deleteError.message }, 
        { status: 500 }
      );
    }

    console.log("✅ API: File deleted successfully");

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error("❌ API: Unexpected error:", error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 
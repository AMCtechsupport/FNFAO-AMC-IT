import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Create Supabase client with service role key (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request) {
  try {
    console.log("🔍 API: Environment check - URL:", !!supabaseUrl, "Key:", !!supabaseServiceKey);
    console.log("🔍 API: Service key length:", supabaseServiceKey?.length || 0);
    
    const formData = await request.formData();
    const file = formData.get('file');
    const clientId = formData.get('clientId');
    const noteId = formData.get('noteId'); // Add noteId parameter

    console.log("📎 API: Form data received:", {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      clientId,
      noteId
    });

    if (!file || !clientId) {
      console.error("❌ API: Missing required fields:", { hasFile: !!file, clientId });
      return NextResponse.json(
        { error: 'File and clientId are required' }, 
        { status: 400 }
      );
    }

    // Check file size (20MB = 20 * 1024 * 1024 bytes)
    const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > maxFileSize) {
      console.error("❌ API: File too large:", file.size, "bytes");
      return NextResponse.json(
        { error: 'File size exceeds the maximum limit of 20MB' }, 
        { status: 400 }
      );
    }

    console.log("📎 API: File received:", file.name, "Size:", file.size, "bytes for client:", clientId, "note:", noteId);

    // Keep original filename but add timestamp to handle duplicates
    // Also handle Chinese characters by encoding the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileExtension = file.name.split('.').pop();
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    
    // Encode Chinese characters and special characters for safe storage
    const safeFileName = encodeURIComponent(fileNameWithoutExt).replace(/[()]/g, '_');
    const uniqueFilename = `${safeFileName}-${timestamp}.${fileExtension}`;
    
    // If noteId is provided, organize files by note, otherwise use client folder
    const filePath = noteId 
      ? `client_${clientId}/note_${noteId}/${uniqueFilename}`
      : `client_${clientId}/${uniqueFilename}`;

    console.log("📁 API: Uploading to path:", filePath);

    // Upload file using service role (bypasses RLS)
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('attachments')
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      console.error("❌ API: Upload error:", uploadError);
      console.error("❌ API: Upload error details:", JSON.stringify(uploadError, null, 2));
      return NextResponse.json(
        { error: uploadError.message }, 
        { status: 500 }
      );
    }

    console.log("✅ API: File uploaded successfully:", uploadData);

    // Get public URL
    const publicUrl = supabaseAdmin
      .storage
      .from('attachments')
      .getPublicUrl(filePath).data.publicUrl;

    console.log("📄 API: Public URL:", publicUrl);

    return NextResponse.json({
      success: true,
      file_url: publicUrl,
      file_name: file.name, // Keep original filename for display
      file_path: filePath,
      encoded_filename: uniqueFilename // Also provide encoded filename
    });

  } catch (error) {
    console.error("❌ API: Unexpected error:", error);
    console.error("❌ API: Error stack:", error.stack);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 
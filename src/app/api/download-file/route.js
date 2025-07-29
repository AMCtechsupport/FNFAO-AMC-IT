import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    const fileName = searchParams.get('name');

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    console.log('📥 Downloading file:', { filePath, fileName });

    // Download file from Supabase storage
    const { data, error } = await supabaseAdmin.storage
      .from('attachments')
      .download(filePath);

    if (error) {
      console.error('❌ Error downloading file:', error);
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Convert blob to array buffer
    const arrayBuffer = await data.arrayBuffer();

    // Determine content type
    const contentType = data.type || 'application/octet-stream';

    // Create response with file data
    const response = new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName || 'download'}"`,
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
    });

    return response;

  } catch (error) {
    console.error('❌ Error in download API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

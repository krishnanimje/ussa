import type { APIRoute } from 'astro';
import { checkAdminAuth } from '../../../../lib/auth';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { addPropertyMedia } from '../../../../lib/store';
import type { PropertyMedia } from '../../../../lib/types';
import fs from 'node:fs/promises';
import path from 'node:path';

export const prerender = false;

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml'
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const POST: APIRoute = async ({ request }) => {
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Admin privileges required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const propertyId = (formData.get('propertyId') as string) || '';
    const altText = (formData.get('altText') as string) || '';
    const isPrimary = formData.get('isPrimary') === 'true';

    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ success: false, error: 'No image file uploaded.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Invalid file format (${file.type}). Supported formats: JPEG, PNG, WebP, AVIF, SVG.` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 10MB.` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = path.extname(file.name) || (file.type === 'image/jpeg' ? '.jpg' : '.png');
    const safeName = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${fileExt}`;

    let mediaUrl = '';
    let storagePath = '';

    // 3. Try Supabase Storage first if configured
    const adminSupabase = getSupabaseAdmin();
    if (adminSupabase) {
      try {
        const { data: uploadData, error: uploadErr } = await adminSupabase.storage
          .from('property-media')
          .upload(safeName, buffer, {
            contentType: file.type,
            upsert: false
          });

        if (!uploadErr && uploadData) {
          const { data: pubData } = adminSupabase.storage
            .from('property-media')
            .getPublicUrl(uploadData.path);

          mediaUrl = pubData.publicUrl;
          storagePath = uploadData.path;
        }
      } catch (e) {
        console.warn('Supabase storage upload failed, falling back to local storage:', e);
      }
    }

    // 4. Local disk fallback
    if (!mediaUrl) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      try {
        await fs.mkdir(uploadsDir, { recursive: true });
        const filePath = path.join(uploadsDir, safeName);
        await fs.writeFile(filePath, buffer);
        mediaUrl = `/uploads/${safeName}`;
        storagePath = `uploads/${safeName}`;
      } catch (e: any) {
        return new Response(JSON.stringify({ success: false, error: `Filesystem error: ${e.message}` }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 5. If propertyId is provided, associate with listing in store
    let mediaRecord: PropertyMedia = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      property_id: propertyId,
      media_type: 'image',
      url: mediaUrl,
      storage_path: storagePath,
      alt_text: altText || file.name,
      display_order: 1,
      is_primary: isPrimary,
      file_size_bytes: file.size,
      mime_type: file.type,
      created_at: new Date().toISOString()
    };

    if (propertyId) {
      mediaRecord = await addPropertyMedia(propertyId, {
        media_type: 'image',
        url: mediaUrl,
        storage_path: storagePath,
        alt_text: altText || file.name,
        display_order: 99,
        is_primary: isPrimary,
        file_size_bytes: file.size,
        mime_type: file.type
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      media: mediaRecord,
      url: mediaUrl,
      message: 'Photo uploaded successfully'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Server upload failure' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

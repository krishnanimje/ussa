import type { APIRoute } from 'astro';
import { checkAdminAuth, getClientIp } from '../../../../lib/auth';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { addPropertyMedia } from '../../../../lib/store';
import { validateImageBuffer } from '../../../../lib/validation';
import { checkUploadRateLimit } from '../../../../lib/rateLimit';
import type { PropertyMedia } from '../../../../lib/types';
import fs from 'node:fs/promises';
import path from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // 1. Enforce Server-Side Authorization
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Admin privileges required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. Enforce Upload Rate Limiting
  const clientIp = getClientIp(request);
  const rateLimit = checkUploadRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Upload rate limit reached. Please wait before uploading more files.' 
    }), {
      status: 429,
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

    const buffer = Buffer.from(await file.arrayBuffer());

    // 3. Binary Magic Number, Extension Whitelist & Anti-XSS SVG Inspection
    const validation = validateImageBuffer(buffer, file.name, file.type);
    if (!validation.valid) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: validation.error || 'Invalid or unsafe file format detected.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const detectedMime = validation.detectedMime || file.type;
    const fileExt = path.extname(file.name).toLowerCase() || (detectedMime === 'image/jpeg' ? '.jpg' : '.png');
    
    // Generate unpredictable cryptographically randomized filename preventing directory traversal
    const safeName = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 10)}${fileExt}`;

    let mediaUrl = '';
    let storagePath = '';

    // 4. Try Supabase Storage first if configured
    const adminSupabase = getSupabaseAdmin();
    if (adminSupabase) {
      try {
        const { data: uploadData, error: uploadErr } = await adminSupabase.storage
          .from('property-media')
          .upload(safeName, buffer, {
            contentType: detectedMime,
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

    // 5. Local disk fallback
    if (!mediaUrl) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      try {
        await fs.mkdir(uploadsDir, { recursive: true });
        const filePath = path.join(uploadsDir, safeName);
        await fs.writeFile(filePath, buffer);
        mediaUrl = `/uploads/${safeName}`;
        storagePath = `local:${safeName}`;
      } catch (writeErr) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Failed to write media asset to persistent storage.' 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 6. Record in media table if associated with property
    let createdMedia: PropertyMedia | undefined;
    if (propertyId) {
      createdMedia = await addPropertyMedia(propertyId, {
        media_type: 'image',
        url: mediaUrl,
        storage_path: storagePath,
        alt_text: altText || 'San Diego property photograph',
        display_order: 99,
        is_primary: isPrimary,
        file_size_bytes: file.size,
        mime_type: detectedMime
      });
    }

    return new Response(JSON.stringify({
      success: true,
      mediaUrl,
      storagePath,
      mediaId: createdMedia?.id,
      message: 'Media uploaded and verified successfully.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'An internal server error occurred while processing the upload.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

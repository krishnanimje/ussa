import type { APIRoute } from 'astro';
import { checkAdminAuth } from '../../../lib/auth';
import { getSiteSettings, updateSiteSettings } from '../../../lib/store';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const settings = await getSiteSettings();
  return new Response(JSON.stringify({ success: true, settings }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const updates = await request.json();
    const updated = await updateSiteSettings(updates);
    return new Response(JSON.stringify({ success: true, settings: updated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

import type { APIRoute } from 'astro';
import { getAllLeads, updateLeadStatus } from '../../../lib/store';
import type { LeadStatus } from '../../../lib/types';

export const prerender = false;

function verifyAdminAuth(request: Request): boolean {
  // Check cookie or authorization header
  const authHeader = request.headers.get('authorization') || '';
  const cookieHeader = request.headers.get('cookie') || '';
  const adminSecret = process.env.ADMIN_SECRET_KEY || import.meta.env.ADMIN_SECRET_KEY || 'dev-secret-valle-admin-session-key-2026';

  if (authHeader === `Bearer ${adminSecret}`) return true;
  if (cookieHeader.includes(`valle_admin_session=${adminSecret}`)) return true;

  return false;
}

export const GET: APIRoute = async ({ request }) => {
  if (!verifyAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Admin privileges required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const leads = await getAllLeads();
  return new Response(JSON.stringify({ success: true, leads }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const PATCH: APIRoute = async ({ request }) => {
  if (!verifyAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Admin privileges required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { leadId, status, notes } = await request.json();
    if (!leadId || !status) {
      return new Response(JSON.stringify({ error: 'Missing leadId or status' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updated = await updateLeadStatus(leadId, status as LeadStatus, notes);
    return new Response(JSON.stringify({ success: updated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error updating lead' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
